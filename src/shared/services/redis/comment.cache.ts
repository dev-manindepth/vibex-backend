import { BaseCache } from './base.cache';
import Logger from 'bunyan';
import { config } from '@root/config';
import { ServerError } from '@global/helpers/error-handler';
import { Helpers } from '@global/helpers/helpers';
import { ICommentDocument, ICommentNameList } from '@comment/interfaces/comments.interface';

const log: Logger = config.createLogger('commentCache');
export class CommentCache extends BaseCache {
  constructor() {
    super('commentCache');
  }
  public async savePostCommentToCache(postId: string, commentData: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.LPUSH(`comments:${postId}`, commentData);
      const commentsCount: string[] = await this.client.HMGET(`posts:${postId}`, 'commentsCount');
      let count: number = Helpers.parseJSON(commentsCount[0]);
      count++;
      await this.client.HSET(`posts:${postId}`, 'commentsCount', count);
    } catch (err) {
      log.error(err);
      throw new ServerError('Server error. Please Try again.');
    }
  }
  public async getCommentsFromCache(postId: string): Promise<ICommentDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const rawCommentCollection: string[] = await this.client.LRANGE(`comments:${postId}`, 0, -1);
      const commentsCollection: ICommentDocument[] = [];
      for (const comment of rawCommentCollection) {
        commentsCollection.push(Helpers.parseJSON(comment));
      }
      return commentsCollection;
    } catch (err) {
      log.error(err);
      throw new ServerError('Server errro. Try again.');
    }
  }
  public async getCommentsNamesFromCache(postId: string): Promise<ICommentNameList[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const rawCommentCollection: string[] = await this.client.LRANGE(`comments:${postId}`, 0, -1);
      const commentCount: number = await this.client.LLEN(`comments:${postId}`);
      const commentNameCollection: string[] = [];
      for (const comment of rawCommentCollection) {
        const name = (Helpers.parseJSON(comment) as ICommentDocument).username;
        commentNameCollection.push(name);
      }
      return [{ count: commentCount, names: commentNameCollection }];
    } catch (err) {
      log.error(err);
      throw new ServerError('Server error.Try again.');
    }
  }
  public async getSingleCommentFromCache(postId: string, commentId: string): Promise<ICommentDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const rawCommentCollection: string[] = await this.client.LRANGE(`comments:${postId}`, 0, -1);
      const singleComment: ICommentDocument[] = [];
      for (const comment of rawCommentCollection) {
        singleComment.push(Helpers.parseJSON(comment));
      }
      const result: ICommentDocument = singleComment.find((comment) => comment._id === commentId) as ICommentDocument;
      return [result];
    } catch (err) {
      log.error(err);
      throw new ServerError('Server Error.Try again.');
    }
  }
}
