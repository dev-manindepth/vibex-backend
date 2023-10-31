import { blockQueue } from '@service/redis/block.queue';
import { FollowCache } from '@service/redis/follow.cache';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
const followCache: FollowCache = new FollowCache();

export class User {
  public async block(req: Request, res: Response): Promise<void> {
    const { userToBlockId } = req.params;
    User.prototype.updateBlockUser(userToBlockId, req.currentUser!.userId, 'block');
    blockQueue.addBlockUnblockJob('addBlockedUserToDB', {
      userId: req.currentUser!.userId,
      userToBlockOrUnblockId: userToBlockId,
      type: 'block'
    });
    res.status(HTTP_STATUS.OK).json({ message: 'User blocked' });
  }
  public async unblock(req: Request, res: Response): Promise<void> {
    const { userToUnblockId } = req.params;
    User.prototype.updateBlockUser(userToUnblockId, req.currentUser!.userId, 'unblock');
    blockQueue.addBlockUnblockJob('removeBlockedUserFromDB', {
      userId: req.currentUser!.userId,
      userToBlockOrUnblockId: userToUnblockId,
      type: 'unblock'
    });
    res.status(HTTP_STATUS.OK).json({ message: 'User unblocked' });
  }
  private async updateBlockUser(userToBlockOrUnblockId: string, currentUserId: string, type: 'block' | 'unblock') {
    const blocked: Promise<void> = followCache.updateBlockedUserPropInCache(currentUserId, 'blocked', userToBlockOrUnblockId, type);
    const blockedBy: Promise<void> = followCache.updateBlockedUserPropInCache(userToBlockOrUnblockId, 'blockedBy', currentUserId, type);
    await Promise.all([blocked, blockedBy]);
  }
}
