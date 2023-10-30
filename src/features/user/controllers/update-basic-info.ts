import { joiValidation } from '@global/decorators/joi-validation-decorators';
import { userQueue } from '@service/queues/user.queue';
import { UserCache } from '@service/redis/user.cache';
import { basicInfoSchema, socialLinksSchema } from '@user/schemas/user';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

const userCache: UserCache = new UserCache();
export class Edit {
  @joiValidation(basicInfoSchema)
  public async info(req: Request, res: Response): Promise<void> {
    for (const [prop, value] of Object.entries(req.body)) {
      await userCache.updateSingleUserPropInCache(req.currentUser!.userId, prop, `${value}`);
    }
    userQueue.addUserJob('updateBasicInfoInDB', { key: `${req.currentUser!.userId}`, value: req.body });
    res.status(HTTP_STATUS.OK).json({ message: 'Updated successfully' });
  }

  @joiValidation(socialLinksSchema)
  public async social(req: Request, res: Response): Promise<void> {
    await userCache.updateSingleUserPropInCache(req.currentUser!.userId, 'social', req.body);
    userQueue.addUserJob('updateSocialLinksInDB', { key: req.currentUser!.userId, value: req.body });
    res.status(HTTP_STATUS.OK).json({ message: 'Updated successfully' });
  }
}
