import { UserModel } from '../models';
import { APIError } from '../../utils/errors/app-errors';
import { FindUserParams, UserDocument, CreateUserParams } from '../../types';

class UserRepository {
  async createUser({ email, password, salt }: CreateUserParams) {
    try {
      const user = new UserModel({
        email,
        password,
        salt,
      });

      const userResult = await user.save();
      return userResult;
    } catch (err) {
      throw new APIError('Unable to Create User');
    }
  }

  async findUser({ email }: FindUserParams): Promise<UserDocument | null> {
    try {
      const existingUser = await UserModel.findOne({ email: email });
      return existingUser;
    } catch (err) {
      throw new APIError('Unable to Find User');
    }
  }
}

export default UserRepository;
