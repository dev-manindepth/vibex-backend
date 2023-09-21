import { userService } from '@service/db/user.service';
import { userCache } from '@service/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { NextFunction, Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
export class CurrentUser {
  public async read(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cachedUser: IUserDocument = await userCache.getUserDataFromCache(`${req.currentUser?.userId}`);
      const existingUser: IUserDocument = cachedUser ? cachedUser : await userService.getUserByUserId(`${req.currentUser?.userId}`);
      if (Object.keys(existingUser).length) {
        res.status(HTTP_STATUS.OK).json({ user: existingUser, token: req.session?.jwt, isUser: true });
      } else {
        res.status(HTTP_STATUS.OK).json({ user: null, token: null, isUser: false });
      }
    } catch (err) {
      next(err);
    }
  }
}
