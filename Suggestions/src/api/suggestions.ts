import SuggestionsService from '../services/suggestions-service';
import { AppParams } from '../types/suggestions-types';
import { subsribeMessage, getUser } from '../utils';
import UserAuth from './middlewares/auth';

export default ({ app, channel }: AppParams) => {
  const SuggestionService = new SuggestionsService();
  subsribeMessage({ channel, serviceName: SuggestionService });

  app.get('/', UserAuth, async (req, res, next) => {
    const user = getUser(req);
    const { _id } = user;
    try {
      const data = await SuggestionService.getSuggestions({ _id });
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  });

  app.get('/compare', UserAuth, async (req, res, next) => {
    const user = getUser(req);
    const { _id } = user;
    try {
      const data = await SuggestionService.getNotesAndSuggestions({ _id });
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  });
};
