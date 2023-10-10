import { ICommentDocument, ICommentJob } from '@comment/interfaces/comments.interface';
import { addCommentSchema } from '@comment/schemas/comments.schema';
import { joiValidation } from '@global/decorators/joi-validation-decorators';
import { commentQueue } from '@service/queues/comment.queue';
import { CommentCache } from '@service/redis/comment.cache';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ObjectId } from 'mongodb';

const commentCache: CommentCache = new CommentCache();
export class Add {
  @joiValidation(addCommentSchema)
  public async comments(req: Request, res: Response): Promise<void> {
    const { userTo, postId, profilePicture, comment } = req.body;
    const commentData: ICommentDocument = {
      _id: new ObjectId(),
      postId,
      username: `${req.currentUser!.username}`,
      avatarColor: `${req.currentUser!.avatarColor}`,
      profilePicture,
      comment,
      createdAt: new Date()
    } as ICommentDocument;
    await commentCache.savePostCommentToCache(postId, JSON.stringify(commentData));
    const databaseComment: ICommentJob = {
      postId,
      userTo,
      userFrom: req.currentUser!.userId,
      username: req.currentUser!.username,
      comment: commentData
    };
    commentQueue.addCommentJob('addCommentToDB', databaseComment);
    res.status(HTTP_STATUS.CREATED).json({ message: 'Comment added successfully' });
  }
}
