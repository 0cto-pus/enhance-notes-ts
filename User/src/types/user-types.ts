import mongoose, { Document } from 'mongoose';
const { ObjectId } = mongoose.Types;

//User Service Params
interface UserParams {
  email: string;
  password: string;
  salt: string;
}

export interface UserDocument extends Document, UserParams {
  _id: typeof ObjectId;
}
export interface CreateUserParams extends UserParams {}

export interface FindUserParams extends Pick<UserParams, 'email'> {}

//Auth Params
export interface ValidatePasswordParams
  extends Pick<UserParams, 'password' | 'salt'> {
  savedPassword: string;
}
export interface GeneratePasswordParams
  extends Pick<UserParams, 'password' | 'salt'> {}

export interface AuthRequestBodyParams
  extends Pick<UserParams, 'email' | 'password'> {}

export interface SignInResponse {
  _id: typeof ObjectId;
  token: string;
}
