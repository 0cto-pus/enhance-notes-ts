import * as jwt from 'jsonwebtoken';
import { Request } from 'express';
import amqplib from 'amqplib';

import {
  TokenExpiredError,
  AuthorizeError,
  APIError,
} from './errors/app-errors';

import {
  APP_SECRET,
  MESSAGE_BROKER_URL,
  QUEUE_NAME,
  SUGGESTION_SERVICE,
  EXCHANGE_NAME,
  OPEN_AI_SECRET,
} from '../config';

import {
  RPCRequestDataParams,
  SubscibeMessageParams,
  RPCRequestParams,
  UserPayload,
} from 'types/suggestions-types';

import OpenAI from 'openai';
import { v4 as uuid4 } from 'uuid';
let amqplibConnection: amqplib.Connection | null = null;

export const validateSignature = async (req: Request): Promise<boolean> => {
  const signature = req.get('Authorization');

  if (signature) {
    try {
      if (!APP_SECRET) {
        throw new Error('APP_SECRET is not defined');
      }
      const payload = jwt.verify(signature.split(' ')[1], APP_SECRET);

      if (typeof payload === 'string') {
        throw new APIError('Invalid token payload');
      }

      req.user = payload as UserPayload;
      return true;
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        throw new TokenExpiredError('JWT token has expired');
      }
      throw new AuthorizeError('Invalid token');
    }
  } else {
    throw new AuthorizeError('No token provided');
  }
};

export function getUser(req: Request): UserPayload {
  if (!req.user) {
    throw new AuthorizeError('User not authenticated');
  }
  return req.user;
}

const getChannel = async (): Promise<amqplib.Channel> => {
  if (amqplibConnection === null) {
    if (!MESSAGE_BROKER_URL) {
      throw new Error('MESSAGE_BROKER_URL is not defined');
    }
    amqplibConnection = await amqplib.connect(MESSAGE_BROKER_URL);
  }
  return await amqplibConnection.createChannel();
};

export const createChannel = async (): Promise<amqplib.Channel> => {
  try {
    const channel = await getChannel();
    await channel.assertQueue(EXCHANGE_NAME, { durable: true });
    return channel;
  } catch (err) {
    throw err;
  }
};

export const subsribeMessage = async ({
  channel,
  serviceName,
}: SubscibeMessageParams) => {
  const appQueue = await channel.assertQueue(QUEUE_NAME);
  channel.bindQueue(appQueue.queue, EXCHANGE_NAME, SUGGESTION_SERVICE);

  channel.consume(appQueue.queue, (data) => {
    if (data !== null) {
      console.log('received data');
      console.log(data.content.toString());
      serviceName.subscribeEvents(data.content.toString());
      channel.ack(data);
    } else {
      throw new APIError("Suggestion couldn't received");
    }
  });
};

export const enhanceRequest = async (content: string) => {
  const openai = new OpenAI({
    apiKey: OPEN_AI_SECRET,
  });

  const response = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `Benim girdiğim notları iyileştirmeni ve güzelleştirmeni istiyorum. Kurallarım aşağıdaki gibidir ve bu kuralların dışında çıkılmayacaktır.

          1- Girdiğim not yarım kalmış olabilir ya da birkaç anahtar kelimeyi içerebilir. Yazdığım şeyin ne olabileceğini tahmin edip, tamamlayıp, genişletmekle görevli olacaksın.
              
          2- Girdiğim not herhangi bir konu hakkında olabilir.
              
          3- Girdiğim notları akıllıca, damıtılmış, rafine hale getirilmiş istiyorum. Gereksiz bilgi vermekten kaçın. Birkaç cümlelik açıklamalar istiyorum fazla açıklama yapmamalısın.
              
          4- Girdiğim notların konusundan şaşmamaya özen göster.  
              
          5- Girdiğim notları "best practice" yapıda yaz.  
              
          6- Ben herhangi bir şey hakkında not girdiğim zaman ya da anahtar kelimeler yazdığım zaman direkt olarak yanıt vermeye başla.`,
      },
      { role: 'user', content },
    ],
    model: 'gpt-4o',
  });
  return response.choices[0].message.content;
};

const requestData = async ({
  RPC_QUEUE_NAME,
  requestPayload,
  uuid,
}: RPCRequestDataParams) => {
  try {
    const channel = await getChannel();

    const q = await channel.assertQueue('', { exclusive: true });

    channel.sendToQueue(
      RPC_QUEUE_NAME,
      Buffer.from(JSON.stringify(requestPayload)),
      {
        replyTo: q.queue,
        correlationId: uuid,
      }
    );

    return new Promise((resolve, reject) => {
      // timeout n
      const timeout = setTimeout(() => {
        channel.close();
        resolve('API could not fullfil the request!');
      }, 8000);
      channel.consume(
        q.queue,
        (msg) => {
          if (msg === null) {
            reject('Message is null');
            return;
          }

          if (msg.properties.correlationId == uuid) {
            resolve(JSON.parse(msg.content.toString()));
            clearTimeout(timeout);
          } else {
            reject('data Not found!');
          }
        },
        {
          noAck: true,
        }
      );
    });
  } catch (error) {
    console.log(error);
    return 'error';
  }
};

export const rpcRequest = async ({
  RPC_QUEUE_NAME,
  requestPayload,
}: RPCRequestParams) => {
  const uuid = uuid4();
  return await requestData({ RPC_QUEUE_NAME, requestPayload, uuid });
};
