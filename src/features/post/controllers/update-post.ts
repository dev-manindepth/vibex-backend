import { joiValidation } from '@global/decorators/joi-validation-decorators';
import { uploads, videoUpload } from '@global/helpers/cloudinary-upload';
import { BadRequestError } from '@global/helpers/error-handler';
import { IPostDocument } from '@post/interfaces/post.interface';
import { postSchema, postWithImageSchema, postWithVideoSchema } from '@post/schemas/post.schema';
import { imageQueue } from '@service/queues/image.queue';
import { postQueue } from '@service/queues/post.queue';
import { PostCache } from '@service/redis/post.cache';
import { socketIOPostObject } from '@socket/post.socket';
import { UploadApiResponse } from 'cloudinary';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

const postCache: PostCache = new PostCache();
export class Update {
  @joiValidation(postSchema)
  public async post(req: Request, res: Response): Promise<void> {
    const { post, bgColor, feelings, privacy, gifUrl, profilePicture } = req.body;
    const { postId } = req.params;
    const updatedPost: IPostDocument = {
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      imgVersion: '',
      imgId: '',
      profilePicture,
      videoId: '',
      videoVersion: ''
    } as IPostDocument;
    const postUpdated: IPostDocument = await postCache.updatePostInCache(postId, updatedPost);
    socketIOPostObject.emit('update post', postUpdated);
    postQueue.addPostJob('updatePostInDB', { postId, updatedPost });
    res.status(HTTP_STATUS.OK).json({ message: 'Post udpated successfully' });
  }
  @joiValidation(postWithImageSchema)
  public async postWithImage(req: Request, res: Response): Promise<void> {
    const { imgId, imgVersion } = req.body;
    // If image is not being updated
    if (imgId && imgVersion) {
      Update.prototype.updatePost(req);
    } else {
      const result: UploadApiResponse = await Update.prototype.updateImageOrVideoToExistingPost(req);
      if (!result.public_id) {
        throw new BadRequestError(result.message);
      }
    }
    res.status(HTTP_STATUS.OK).json({ message: 'Post with image updated successfully' });
  }

  @joiValidation(postWithVideoSchema)
  public async postWithVideo(req: Request, res: Response): Promise<void> {
    const { videoVersion, videoId } = req.body;
    if (videoId && videoVersion) {
      await Update.prototype.updatePost(req);
    } else {
      const videoUploadResult: UploadApiResponse = await Update.prototype.updateImageOrVideoToExistingPost(req);
      if (!videoUploadResult.public_id) {
        throw new BadRequestError(videoUploadResult.message);
      }
    }
    res.status(HTTP_STATUS.OK).json({ message: 'Post with video updated successfully' });
  }

  private async updatePost(req: Request): Promise<void> {
    const { post, bgColor, feelings, privacy, gifUrl, profilePicture } = req.body;
    const { postId } = req.params;
    const updatedPost: IPostDocument = {
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      imgVersion: '',
      imgId: '',
      profilePicture,
      videoId: '',
      videoVersion: ''
    } as IPostDocument;
    const postUpdated: IPostDocument = await postCache.updatePostInCache(postId, updatedPost);
    socketIOPostObject.emit('update post', postUpdated);
    postQueue.addPostJob('updatePostInDB', { postId, updatedPost });
  }
  private async updateImageOrVideoToExistingPost(req: Request): Promise<UploadApiResponse> {
    const { image, video } = req.body;
    const { postId } = req.params;
    const uploadResult: UploadApiResponse = image
      ? ((await uploads(image)) as UploadApiResponse)
      : ((await videoUpload(video)) as UploadApiResponse);
    const updatedPost: IPostDocument = {
      ...req.body,
      imgVersion: image ? uploadResult?.version?.toString() : '',
      imgId: image ? uploadResult.public_id : '',
      videoId: video ? uploadResult.public_id : '',
      videoVersion: video ? uploadResult?.version?.toString() : ''
    } as IPostDocument;
    const postUpdated: IPostDocument = (await postCache.updatePostInCache(postId, updatedPost)) as IPostDocument;
    socketIOPostObject.emit('update post', postUpdated);
    postQueue.addPostJob('updatePostInDB', { postId, updatedPost });
    if (image) {
      // TODO ADD image to image queue
      imageQueue.addImageJob('addImageToDB', {
        userId: req.currentUser!.userId,
        imgId: uploadResult.public_id,
        imgVersion: uploadResult.version.toString()
      });
    } else if (video) {
      // TODO ADD video to video queue
    }
    return uploadResult;
  }
}
