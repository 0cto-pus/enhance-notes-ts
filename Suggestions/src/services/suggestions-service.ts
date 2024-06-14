import {
  CreateSuggestionParams,
  GetSuggestionParams,
  NoteServiceParams,
  MessageBrokerPayload,
} from 'types/suggestions-types';
import { SuggestionsRepository } from '../database';
import { APIError } from '../utils/errors/app-errors';
import { enhanceRequest, rpcRequest } from '../utils';

class SuggestionsService {
  private repository: SuggestionsRepository;

  constructor() {
    this.repository = new SuggestionsRepository();
  }

  async createEnhancedNote({ _id, noteId, note }: NoteServiceParams) {
    try {
      const suggestion = await enhanceRequest(note);
      if (!suggestion) {
        throw new APIError('External API Error');
      }
      const noteResult = await this.repository.createNewEnhanceNote({
        _id,
        noteId,
        suggestion,
      });
      return { noteResult };
    } catch (error) {
      throw new APIError('Data Not Found');
    }
  }

  async subscribeEvents(payload: string) {
    const parsedPayload: MessageBrokerPayload = JSON.parse(payload);
    const { event, _id, noteId, note } = parsedPayload;
    switch (event) {
      case 'ENHANCE_NOTE':
        this.createEnhancedNote({ _id, noteId, note });
        break;
      default:
        break;
    }
  }

  async getSuggestions({ _id }: GetSuggestionParams) {
    try {
      return await this.repository.getAllSuggestions({ _id });
    } catch (err) {
      throw new APIError('Data Not found');
    }
  }

  async getNotesAndSuggestions({ _id }: GetSuggestionParams) {
    try {
      const allSuggestions = await this.repository.getAllSuggestions({ _id });
      if (!allSuggestions) {
        return {};
      }
      const [{ suggestions }] = allSuggestions;
      if (!suggestions) {
        return {};
      }

      if (Array.isArray(suggestions)) {
        const noteIds = suggestions.map(({ noteId }) => noteId);
        // Perform RPC call
        const notesResponse = await rpcRequest({
          RPC_QUEUE_NAME: 'NOTES_RPC',
          requestPayload: { type: 'VIEW_NOTES', noteIds: noteIds },
        });

        if (notesResponse) {
          return { notesResponse, suggestions };
        }
      }
      return {};
    } catch (error) {
      //console.log(error);
      throw new APIError('Data Not found');
    }
  }
}

export default SuggestionsService;
