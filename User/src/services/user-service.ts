import { UserRepository } from '../database';
import {
  generatePassword,
  generateSalt,
  generateSignature,
  validatePassword,
} from '../utils';
import { BadRequestError, APIError } from '../utils/errors/app-errors';
import { AuthRequestBodyParams, UserDocument, SignInResponse } from '../types';

class UserService {
  private repository: UserRepository;

  constructor() {
    this.repository = new UserRepository();
  }

  async signUp(userInputs: AuthRequestBodyParams) {
    const { email, password } = userInputs;
    try {
      const existingUser = await this.repository.findUser({ email });

      if (existingUser) {
        throw new BadRequestError('Email in use');
      }

      let salt = await generateSalt();
      let userPassword = await generatePassword({ password, salt });
      const newUser = await this.repository.createUser({
        email,
        password: userPassword,
        salt,
      });
      const token = await generateSignature({ email: email, _id: newUser._id });
      return { id: newUser._id, token };
    } catch (err) {
      throw err;
    }
  }

  async signIn(userInputs: AuthRequestBodyParams): Promise<SignInResponse> {
    try {
      const { email, password } = userInputs;
      const existingUser: UserDocument | null = await this.repository.findUser({
        email,
      });

      if (!existingUser) throw new BadRequestError('Invalid credentials');

      const validPassword = await validatePassword({
        password,
        savedPassword: existingUser.password,
        salt: existingUser.salt,
      });

      if (!validPassword) throw new BadRequestError('Invalid credentials');

      const token = await generateSignature({
        email: existingUser.email,
        _id: existingUser._id,
      });

      return { _id: existingUser._id, token };
    } catch (error) {
      if (error instanceof BadRequestError) {
        throw error;
      }
      throw new APIError('An unexpected error occurred during sign in');
    }
  }
}

export default UserService;
