import mongoose, { Document } from 'mongoose';
const { ObjectId } = mongoose.Types;
import { Channel } from 'amqplib';
import { Application } from 'express';
import SuggestionsService from '../services/suggestions-service';
import { JwtPayload } from 'jsonwebtoken';

//App
interface BaseAuthParams {
  email: string;
}

export interface AuthDocumentParams extends Document, BaseAuthParams {
  _id: typeof ObjectId;
}
export interface UserPayload extends JwtPayload, BaseAuthParams {
  _id: typeof ObjectId;
}

export interface AppParams {
  app: Application;
  channel: Channel;
}

//*****************************************************************************
//Suggestions

interface BaseSuggestionsParams {
  _id: typeof ObjectId;
}

export interface CreateSuggestionParams extends BaseSuggestionsParams {
  noteId: string;
  suggestion: string;
}

export interface GetSuggestionParams extends BaseSuggestionsParams {}

interface NoteParams {
  note: string;
}

export interface NoteServiceParams extends NoteParams {
  noteId: string;
  _id: typeof ObjectId;
}

export interface EnhanceRequestParams extends NoteParams {}

//*****************************************************************************
//Message Broker
export interface MessageBrokerParams {
  channel: Channel;
  serviceName: string;
  msg: string;
}

export interface MessageBrokerPayload {
  event: string;
  _id: typeof ObjectId;
  note: string;
  noteId: string;
}

export interface SubscibeMessageParams {
  channel: Channel;
  serviceName: SuggestionsService;
}

export interface RPCRequestParams {
  RPC_QUEUE_NAME: string;
  requestPayload: {
    type: string;
    noteIds: string[];
  };
}

export interface RPCRequestDataParams extends RPCRequestParams {
  uuid: string;
}
