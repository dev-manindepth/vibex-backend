import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
export class Signout {
  public async update(req: Request, res: Response) {
    req.session = null;
    res.status(HTTP_STATUS.OK).json({ message: 'logout successful', user: {}, token: '' });
  }
}
