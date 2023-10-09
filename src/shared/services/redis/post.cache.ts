import { ServerError } from '@global/helpers/error-handler';
import { Helpers } from '@global/helpers/helpers';
import { IPostDocument, ISavePostToCache } from '@post/interfaces/post.interface';
import { IReactions } from '@reactions/interfaces/reaction.interface';
import { RedisCommandRawReply } from '@redis/client/dist/lib/commands';
import { config } from '@root/config';
import { BaseCache } from '@service/redis/base.cache';
import Logger from 'bunyan';

const log: Logger = config.createLogger('postCache');
export type PostCacheMultiType = string | number | Buffer | IPostDocument | IPostDocument[] | RedisCommandRawReply[];
export class PostCache extends BaseCache {
  constructor() {
    super('postCache');
  }
  public async savePostToCache(data: ISavePostToCache): Promise<void> {
    const { postId, currentUserId, uId, createdPost } = data;

    const dataToSave = { ...createdPost, reactions: JSON.stringify(createdPost.reactions) };
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const postCount: string[] = await this.client.HMGET(`users:${currentUserId}`, 'postsCount');
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      await this.client.ZADD('post', { score: parseInt(uId, 10), value: `${postId}` });
      for (const [key, value] of Object.entries(dataToSave)) {
        multi.HSET(`posts:${postId}`, `${key}`, `${value}`);
      }
      const count: number = parseInt(postCount[0], 10) + 1;
      multi.HSET(`users:${currentUserId}`, 'postsCount', `${count}`);
      multi.exec();
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getPostsFromCache(key: string, start: number, end: number): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) {
        this.client.connect();
      }
      const postIdCollection: string[] = await this.client.ZRANGE(key, start, end, { REV: true });
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      for (const postId of postIdCollection) {
        multi.HGETALL(`posts:${postId}`);
      }
      const posts: PostCacheMultiType = (await multi.exec()) as PostCacheMultiType;
      const postCollection: IPostDocument[] = [];
      for (const post of posts as IPostDocument[]) {
        post.commentsCount = Helpers.parseJSON(`${post.commentsCount}`) as number;
        post.reactions = Helpers.parseJSON(`${post.reactions}`) as IReactions;
        post.createdAt = new Date(Helpers.parseJSON(`${post.createdAt}`)) as Date;
        postCollection.push(post);
      }
      return postCollection;
    } catch (err) {
      log.error(err);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getTotalPostsCountFromCache(): Promise<number> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const count: number = await this.client.ZCARD('post');
      return count;
    } catch (err) {
      log.error(err);
      throw new ServerError('Server error. Try again');
    }
  }

  public async getPostsWithImageFromCache(key: string, start: number, end: number): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const postIdCollection: string[] = await this.client.ZRANGE(key, start, end, { REV: true });
      const multi: ReturnType<typeof this.client.multi> = await this.client.multi();
      for (const postId of postIdCollection) {
        multi.HGETALL(`posts:${postId}`);
      }
      const posts: PostCacheMultiType = (await multi.exec()) as PostCacheMultiType;
      const postsWithImageCollection: IPostDocument[] = [];
      for (const post of posts as IPostDocument[]) {
        if ((post.imgId && post.imgVersion) || post.gifUrl) {
          post.commentsCount = Helpers.parseJSON(`${post.commentsCount}`) as number;
          post.reactions = Helpers.parseJSON(`${post.reactions}`) as IReactions;
          post.createdAt = new Date(Helpers.parseJSON(`${post.createdAt}`)) as Date;
          postsWithImageCollection.push(post);
        }
      }
      return postsWithImageCollection;
    } catch (err) {
      log.error(err);
      throw new ServerError('Server error. Try again');
    }
  }
  public async getTotalImagePostCountFromCache(): Promise<number> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const postIdCollection: string[] = await this.client.ZRANGE('post', 0, -1);
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      for (const postId of postIdCollection) {
        multi.HGETALL(`posts:${postId}`);
      }
      const posts: PostCacheMultiType = (await multi.exec()) as PostCacheMultiType;
      const postsWithImageCollection: IPostDocument[] = [];
      for (const post of posts as IPostDocument[]) {
        if ((post.imgId && post.imgVersion) || post.gifUrl) {
          postsWithImageCollection.push(post);
        }
      }
      return postsWithImageCollection.length;
    } catch (err) {
      log.error(err);
      throw new ServerError('Server error. Try again.');
    }
  }
  public async getTotalVideoPostCountFromCache(): Promise<number> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const postIdCollection: string[] = await this.client.ZRANGE('post', 0, -1);
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      for (const postId of postIdCollection) {
        multi.HGETALL(`posts:${postId}`);
      }
      const posts: PostCacheMultiType = (await multi.exec()) as PostCacheMultiType;
      const postsWithVideoCollection: IPostDocument[] = [];
      for (const post of posts as IPostDocument[]) {
        if ((post.videoId && post.videoVersion) || post.gifUrl) {
          postsWithVideoCollection.push(post);
        }
      }
      return postsWithVideoCollection.length;
    } catch (err) {
      log.error(err);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getPostsWithVideoFromCache(key: string, start: number, end: number): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const postIdCollection: string[] = await this.client.ZRANGE(key, start, end, { REV: true });
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      for (const postId of postIdCollection) {
        multi.HGETALL(`posts:${postId}`);
      }
      const posts: PostCacheMultiType = (await multi.exec()) as PostCacheMultiType;
      const postsWithVideoCollection: IPostDocument[] = [];
      for (const post of posts as IPostDocument[]) {
        if (post.videoId && post.videoVersion) {
          post.commentsCount = Helpers.parseJSON(`${post.commentsCount}`) as number;
          post.reactions = Helpers.parseJSON(`${post.reactions}`) as IReactions;
          post.createdAt = new Date(Helpers.parseJSON(`${post.createdAt}`)) as Date;
          postsWithVideoCollection.push(post);
        }
      }
      return postsWithVideoCollection;
    } catch (err) {
      log.error(err);
      throw new ServerError('Server error. Try again.');
    }
  }
  public async updatePostInCache(postId: string, data: IPostDocument): Promise<IPostDocument> {
    if (!this.client.isOpen) {
      this.client.connect();
    }
    // Update the redis cache
    for (const [key, value] of Object.entries(data)) {
      await this.client.HSET(`posts:${postId}`, `${key}`, `${value}`);
    }
    // Return the udpated data
    const multi: ReturnType<typeof this.client.multi> = this.client.multi();
    multi.HGETALL(`posts:${postId}`);
    const response: PostCacheMultiType = await multi.exec();
    const post = response as unknown as IPostDocument[];
    post[0].commentsCount = Helpers.parseJSON(`${post[0].commentsCount}`) as number;
    post[0].reactions = Helpers.parseJSON(`${post[0].reactions}`) as IReactions;
    post[0].createdAt = new Date(Helpers.parseJSON(`${post[0].createdAt}`)) as Date;
    return post[0];
  }
  public async deletePostFromCache(postId: string, userId: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const postCount: string[] = await this.client.HMGET(`users:${userId}`, 'postsCount');
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      multi.ZREM('post', postId);
      multi.DEL(`posts:${postId}`);
      multi.DEL(`comments:${postId}`);
      multi.DEL(`reactions:${postId}`);
      const count: number = parseInt(postCount[0], 10);
      multi.HSET(`users:${userId}`, 'postsCount', count);
      await multi.exec();
    } catch (err) {
      log.error(err);
      throw new ServerError('Server error . Try again.');
    }
  }
}
