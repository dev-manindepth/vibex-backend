import { postQueue } from '@service/queues/post.queue';
import { PostCache } from '@service/redis/post.cache';
import { socketIOPostObject } from '@socket/post.socket';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
const postCache: PostCache = new PostCache();
export class Delete {
  public async post(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    await postCache.deletePostFromCache(postId, req.currentUser!.userId);
    postQueue.addPostJob('deletePostFromDB', { postId, userId: req.currentUser!.userId });
    socketIOPostObject.emit('delete post', postId);
    res.status(HTTP_STATUS.OK).json({ message: 'Post deleted successfully' });
  }
}
