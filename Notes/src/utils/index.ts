import * as jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';
import { Request } from 'express';
import mongoose from 'mongoose';
import amqplib, { Channel, Message } from 'amqplib';
import {
  TokenExpiredError,
  AuthorizeError,
  APIError,
} from './errors/app-errors';
import { APP_SECRET, MESSAGE_BROKER_URL, EXCHANGE_NAME } from '../config';
import {
  MessageBrokerParams,
  RPCObserverParams,
  RPCPayloadParams,
  UserPayload,
} from 'types/notes-types';
let amqplibConnection: amqplib.Connection | null = null;

export const isUserPayload = (payload: JwtPayload): payload is UserPayload => {
  return (
    payload &&
    typeof payload.email === 'string' &&
    mongoose.Types.ObjectId.isValid(payload._id)
  );
};

//Auth Operations
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

//*****************************************************************************

//Messagebroker Operations
const getChannel = async (): Promise<amqplib.Channel> => {
  if (amqplibConnection === null) {
    if (!MESSAGE_BROKER_URL) {
      throw new Error('APP_SECRET is not defined');
    }
    amqplibConnection = await amqplib.connect(MESSAGE_BROKER_URL);
  }
  return await amqplibConnection.createChannel();
};

export const CreateChannel = async (): Promise<amqplib.Channel> => {
  try {
    const channel = await getChannel();
    await channel.assertQueue(EXCHANGE_NAME, { durable: true });
    return channel;
  } catch (err) {
    throw err;
  }
};

export const publishMessage = ({
  channel,
  serviceName,
  msg,
}: MessageBrokerParams) => {
  channel.publish(EXCHANGE_NAME, serviceName, Buffer.from(msg));
  console.log('Sent: ', msg);
};

export const RPCObserver = async ({
  RPC_QUEUE_NAME,
  service,
}: RPCObserverParams): Promise<void> => {
  const channel: Channel = await getChannel();
  await channel.assertQueue(RPC_QUEUE_NAME, {
    durable: false,
  });
  channel.prefetch(1);
  channel.consume(
    RPC_QUEUE_NAME,
    async (msg: Message | null) => {
      if (msg && msg.content) {
        try {
          // DB Operation
          const payload: RPCPayloadParams = JSON.parse(msg.content.toString());
          const response = await service.serverRPCRequest(payload);
          channel.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(JSON.stringify(response)),
            {
              correlationId: msg.properties.correlationId,
            }
          );
          channel.ack(msg);
        } catch (error) {
          console.error('Error processing message', error);
        }
      }
    },
    {
      noAck: false,
    }
  );
};
