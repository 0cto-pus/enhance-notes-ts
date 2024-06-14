import { NotesModel } from '../models';
import mongoose from 'mongoose';
import { APIError } from '../../utils/errors/app-errors';
import {
  CreateNoteParams,
  GetNoteParams,
  RPCViewNotesParams,
} from 'types/notes-types';

class NotesRepository {
  async createNewNote({ _id, note }: CreateNoteParams) {
    try {
      const user = await NotesModel.findOne({ _id });
      if (!user) {
        return await NotesModel.create({ _id, notes: [{ note }] });
      }
      user.notes.push({ note });
      return await user.save();
    } catch (err) {
      throw new APIError('Unable to Create Note');
    }
  }

  async findById({ _id }: CreateNoteParams) {
    try {
      return await NotesModel.findById(_id);
    } catch (err) {
      throw new APIError('Unable to Find Note');
    }
  }

  async findSelectedNotes({ noteIds }: RPCViewNotesParams) {
    try {
      const notes = await NotesModel.find({
        'notes._id': {
          $in: noteIds.map((id) => new mongoose.Types.ObjectId(id)),
        },
      }).exec();
      return notes;
    } catch (err) {
      throw new APIError('Unable to Find Notes');
    }
  }

  async allNotes({ _id }: GetNoteParams) {
    try {
      return await NotesModel.find({ _id });
    } catch (err) {
      throw new APIError('Unable to Find Notes');
    }
  }
}

export default NotesRepository;
