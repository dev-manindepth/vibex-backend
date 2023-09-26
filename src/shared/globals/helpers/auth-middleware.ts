import { NextFunction, Request, Response } from 'express';
import { NotAuthorizedError } from './error-handler';
import { AuthPayload } from '@auth/interfaces/auth.interface';
import JWT from 'jsonwebtoken';
import { config } from '@root/config';
class AuthMiddleware {
  public verifyUser(req: Request, res: Response, next: NextFunction): void {
    try {
      if (!req.session?.jwt) {
        throw new NotAuthorizedError('Token is not avaialble . Please try again');
      }
    } catch (err) {
      return next(err);
    }
    try {
      const payload: AuthPayload = JWT.verify(req.session?.jwt, config.JWT_TOKEN!) as AuthPayload;
      req.currentUser = payload;
      next();
    } catch (err) {
      return next(new NotAuthorizedError('Invalid token . Please try again'));
    }
  }
  public checkAuthentication(req: Request, res: Response, next: NextFunction): void {
    try {
      if (!req.currentUser) {
        throw new NotAuthorizedError('Authentication is required to access this route');
      }
      next();
    } catch (err) {
      next(err);
    }
  }
}
export const authMiddleware: AuthMiddleware = new AuthMiddleware();
