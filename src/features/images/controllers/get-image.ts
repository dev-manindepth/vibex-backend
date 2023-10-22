import { IFileImageDocuement } from '@image/interfaces/image.interface';
import { imageService } from '@service/db/image.service';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

export class Get {
  public async image(req: Request, res: Response): Promise<void> {
    const images: IFileImageDocuement[] = await imageService.getImages(req.currentUser!.userId);
    res.status(HTTP_STATUS.OK).json({ message: 'User images', images });
  }
}
