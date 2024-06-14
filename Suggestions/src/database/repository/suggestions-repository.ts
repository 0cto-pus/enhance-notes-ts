import { SuggestionsModel } from '../models';
import { APIError } from '../../utils/errors/app-errors';
import {
  CreateSuggestionParams,
  GetSuggestionParams,
} from 'types/suggestions-types';

class SuggestionsRepository {
  async createNewEnhanceNote({
    _id,
    noteId,
    suggestion,
  }: CreateSuggestionParams) {
    try {
      const user = await SuggestionsModel.findOne({ _id });
      if (!user) {
        return await SuggestionsModel.create({
          _id,
          suggestions: [{ noteId, suggestion }],
        });
      }
      user.suggestions.push({ noteId, suggestion });
      return await user.save();
    } catch (err) {
      throw new APIError('Unable to create enhanced note');
    }
  }

  async getAllSuggestions({ _id }: GetSuggestionParams) {
    try {
      return await SuggestionsModel.find({ _id });
    } catch (err) {
      throw new APIError('Unable to get enhanced note');
    }
  }
}

export default SuggestionsRepository;
