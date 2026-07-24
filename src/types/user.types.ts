export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  mobile?: string;
}
export interface JWTPayload { userId: string; email: string; } 
