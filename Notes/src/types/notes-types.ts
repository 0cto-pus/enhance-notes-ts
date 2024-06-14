import mongoose, { Document } from 'mongoose';
const { ObjectId } = mongoose.Types;
import NotesService from '../services/notes-service';
import { Channel } from 'amqplib';
import { Application } from 'express';
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

// Service
export interface BaseNoteParams {
  note?: string;
  _id?: typeof ObjectId;
}

export interface AddNoteParams extends BaseNoteParams {
  note: string;
}

export interface CreateNoteParams extends BaseNoteParams {
  note: string;
  _id: typeof ObjectId;
}

export interface GetNoteParams extends BaseNoteParams {
  _id: typeof ObjectId;
}

//*****************************************************************************

//Message Broker
export interface MessageBrokerPayload {
  event: string;
  _id: typeof ObjectId;
  note: string;
  noteId: string;
}

export interface MessageBrokerParams {
  channel: Channel;
  serviceName: string;
  msg: string;
}

interface BaseRPCNoteParams {
  noteIds: string[];
}

export interface RPCObserverParams {
  RPC_QUEUE_NAME: string;
  service: NotesService;
}

export interface RPCPayloadParams extends BaseRPCNoteParams {
  type: string;
}

export interface RPCViewNotesParams extends BaseRPCNoteParams {}
