import { IFileImageJobData } from '@image/interfaces/image.interface';
import { imageWorker } from '@root/shared/workers/image.worker';
import { BaseQueue } from '@service/queues/base.queue';

class ImageQueue extends BaseQueue {
  constructor() {
    super('imageQueue');
    this.processJob('addUserProfileImageToDB', 5, imageWorker.addUserProfileImageToDB);
    this.processJob('updateBGImageInDB', 5, imageWorker.updateBGImageInDB);
    this.processJob('addImageToDB', 5, imageWorker.addImageToDB);
    this.processJob('removeImageFromDB', 5, imageWorker.removeImageFromDB);
  }
  public addImageJob(name: string, data: IFileImageJobData) {
    this.addJob(name, data);
  }
}

export const imageQueue: ImageQueue = new ImageQueue();
