import { joiValidation } from '@global/decorators/joi-validation-decorators';
import { IPostDocument } from '@post/interfaces/post.interface';
import { postSchema, postWithImageSchema } from '@post/schemas/post.schema';
import { postQueue } from '@service/queues/post.queue';
import { PostCache } from '@service/redis/post.cache';
import { socketIOPostObject } from '@socket/post.socket';
import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import HTTP_STATUS from 'http-status-codes';
import { UploadApiResponse } from 'cloudinary';
import { uploads, videoUpload } from '@global/helpers/cloudinary-upload';
import { BadRequestError } from '@global/helpers/error-handler';
import { imageQueue } from '@service/queues/image.queue';

const postCache: PostCache = new PostCache();
export class Create {
  @joiValidation(postSchema)
  public async post(req: Request, res: Response): Promise<void> {
    const { post, bgColor, privacy, gifUrl, profilePicture, feelings } = req.body;
    const postObjectId: ObjectId = new ObjectId();
    const createdPost: IPostDocument = {
      _id: postObjectId,
      userId: req.currentUser!.userId,
      username: req.currentUser!.username,
      email: req.currentUser!.email,
      avatarColor: req.currentUser!.avatarColor,
      profilePicture,
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      commentsCount: 0,
      imgVersion: '',
      imgId: '',
      videoId: '',
      videoVersion: '',
      createdAt: new Date(),
      reactions: { like: 0, love: 0, happy: 0, sad: 0, wow: 0 }
    } as unknown as IPostDocument;
    socketIOPostObject.emit('add post', createdPost);
    await postCache.savePostToCache({
      postId: postObjectId,
      currentUserId: req.currentUser!.userId,
      uId: req.currentUser!.uId,
      createdPost
    });
    postQueue.addPostJob('addPostToDB', { userId: req.currentUser!.userId, createdPost: createdPost });
    res.status(HTTP_STATUS.CREATED).json({ message: 'post created successfully' });
  }
  @joiValidation(postWithImageSchema)
  public async postWithImage(req: Request, res: Response): Promise<void> {
    const { post, bgColor, privacy, gifUrl, profilePicture, feelings, image } = req.body;
    const imageUploadResult: UploadApiResponse = (await uploads(image)) as UploadApiResponse;
    if (!imageUploadResult?.public_id) {
      throw new BadRequestError('Error in uploading image' + imageUploadResult.message);
    }
    const postObjectId: ObjectId = new ObjectId();
    const createdPost: IPostDocument = {
      _id: postObjectId,
      userId: req.currentUser!.userId,
      username: req.currentUser!.username,
      email: req.currentUser!.email,
      avatarColor: req.currentUser!.avatarColor,
      profilePicture,
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      commentsCount: 0,
      imgVersion: imageUploadResult.version.toString(),
      imgId: imageUploadResult.public_id,
      videoId: '',
      videoVersion: '',
      createdAt: new Date(),
      reactions: { like: 0, love: 0, happy: 0, sad: 0, wow: 0, angry: 0 }
    } as IPostDocument;
    socketIOPostObject.emit('add post', createdPost);
    await postCache.savePostToCache({
      postId: postObjectId,
      currentUserId: req.currentUser!.userId,
      uId: req.currentUser!.uId,
      createdPost
    });
    postQueue.addPostJob('addPostToDB', { userId: req.currentUser!.userId, createdPost });
    // TODO ADD image to assets queue
    imageQueue.addImageJob('addImageToDB', {
      userId: req.currentUser!.userId,
      imgId: imageUploadResult.public_id,
      imgVersion: imageUploadResult.version.toString()
    });
    res.status(HTTP_STATUS.CREATED).json({ message: 'post with image created successfully' });
  }
  public async postWithVideo(req: Request, res: Response): Promise<void> {
    const { post, bgColor, privacy, gifUrl, profilePicture, feelings, video } = req.body;
    const uploadResponse: UploadApiResponse = (await videoUpload(video)) as UploadApiResponse;
    if (!uploadResponse?.public_id) {
      throw new BadRequestError(uploadResponse.message);
    }
    const postObjectId: ObjectId = new ObjectId();
    const createdPost: IPostDocument = {
      _id: postObjectId,
      userId: req.currentUser!.userId,
      username: req.currentUser!.username,
      email: req.currentUser!.email,
      avatarColor: req.currentUser!.avatarColor,
      profilePicture,
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      commentsCount: 0,
      imgVersion: '',
      imgId: '',
      videoId: uploadResponse.public_id,
      videoVersion: uploadResponse.version.toString(),
      createdAt: new Date(),
      reactions: { like: 0, love: 0, happy: 0, sad: 0, angry: 0, wow: 0 }
    } as IPostDocument;
    socketIOPostObject.emit('add post', createdPost);
    await postCache.savePostToCache({
      postId: postObjectId,
      currentUserId: req.currentUser!.userId,
      uId: req.currentUser!.uId,
      createdPost
    });
    postQueue.addPostJob('addPostToDB', { userId: req.currentUser!.userId, createdPost });
    // TODO add video assets queue
    res.status(HTTP_STATUS.CREATED).json({ message: 'Post created with video' });
  }
}
