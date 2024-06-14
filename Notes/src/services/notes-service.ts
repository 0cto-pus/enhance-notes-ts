import {
  CreateNoteParams,
  GetNoteParams,
  RPCPayloadParams,
  MessageBrokerPayload,
} from 'types/notes-types';
import { NotesRepository } from '../database';
import { NotFoundError, APIError } from '../utils/errors/app-errors';

class NotesService {
  private repository: NotesRepository;

  constructor() {
    this.repository = new NotesRepository();
  }

  async createNote({ _id, note }: CreateNoteParams) {
    try {
      const notesResult = await this.repository.createNewNote({ _id, note });
      if (notesResult) {
        const lastestNote = notesResult.notes[notesResult.notes.length - 1];
        const payload: MessageBrokerPayload = {
          event: 'ENHANCE_NOTE',
          _id,
          noteId: lastestNote._id,
          note: lastestNote.note,
        };
        return { notesResult, payload };
      } else {
        throw new NotFoundError('Unable to create note');
      }
    } catch (err) {
      throw new APIError('Data Not Found');
    }
  }

  async serverRPCRequest(payload: RPCPayloadParams) {
    const { type, noteIds } = payload;
    switch (type) {
      case 'VIEW_NOTES':
        return this.repository.findSelectedNotes({ noteIds });
      default:
        break;
    }
  }

  async getNotes({ _id }: GetNoteParams) {
    try {
      return await this.repository.allNotes({ _id });
    } catch (err) {
      throw new NotFoundError('Data Not found');
    }
  }
}

export default NotesService;
