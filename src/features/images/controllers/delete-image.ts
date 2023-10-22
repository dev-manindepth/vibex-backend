import { IFileImageDocuement } from '@image/interfaces/image.interface';
import { imageService } from '@service/db/image.service';
import { imageQueue } from '@service/queues/image.queue';
import { UserCache } from '@service/redis/user.cache';
import { socketIOImageObject } from '@socket/image';
import { IUserDocument } from '@user/interfaces/user.interface';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

const userCache: UserCache = new UserCache();

export class Delete {
  public async image(req: Request, res: Response): Promise<void> {
    const { imageId } = req.params;
    socketIOImageObject.emit('delete image', imageId);
    imageQueue.addImageJob('removeImageFromDB', { imageId });
    res.status(HTTP_STATUS.OK).json({ message: 'Image deleted' });
  }
  public async backgroundImage(req: Request, res: Response): Promise<void> {
    const image: IFileImageDocuement = await imageService.getImageByBackgroundImageId(req.params.bgImageId);
    socketIOImageObject.emit('delete image', image?._id);
    const updateBgImageId: Promise<IUserDocument> = userCache.updateSingleUserPropInCache(
      req.currentUser!.userId,
      'bgImageId',
      ''
    ) as Promise<IUserDocument>;
    const updateImageVersion: Promise<IUserDocument> = userCache.updateSingleUserPropInCache(
      req.currentUser!.userId,
      'bgImageVersion',
      ''
    ) as Promise<IUserDocument>;
    await Promise.all([updateBgImageId, updateImageVersion]);
    imageQueue.addImageJob('removeImageFromDB', { imageId: image?._id });
    res.status(HTTP_STATUS.OK).json({ message: 'Image deleted successfully' });
  }
}
