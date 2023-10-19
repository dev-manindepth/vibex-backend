import { IFollowDocument } from '@follow/interfaces/follower.interface';
import { FollowModel } from '@follow/models/follower.schema';
import { IQueryComplete, IQueryDeleted } from '@post/interfaces/post.interface';
import { UserCache } from '@service/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { UserModel } from '@user/models/user.schema';
import { ObjectId, BulkWriteResult } from 'mongodb';
import mongoose, { Query } from 'mongoose';

const userCache: UserCache = new UserCache();
class FollowService {
  public async addFollowerToDB(userId: string, followeeId: string, username: string, followerDocumentId: ObjectId): Promise<void> {
    const followerObjectId: ObjectId = new mongoose.Types.ObjectId(userId);
    const followeeObjectId: ObjectId = new mongoose.Types.ObjectId(followeeId);

    await FollowModel.create({
      _id: followerDocumentId,
      followeeId: followeeObjectId,
      followerId: followerObjectId
    });
    const users: Promise<BulkWriteResult> = UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: userId },
          update: { $inc: { followingCount: 1 } }
        }
      },
      {
        updateOne: {
          filter: { _id: followeeId },
          update: { $inc: { followersCount: 1 } }
        }
      }
    ]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const response: [BulkWriteResult, IUserDocument | null] = await Promise.all([users, userCache.getUserDataFromCache(followeeId)]);
  }
  public async removeFollowerFromDB(userId: string, followeeId: string): Promise<void> {
    const followerObjectId: ObjectId = new mongoose.Types.ObjectId(userId);
    const followeeObjectId: ObjectId = new mongoose.Types.ObjectId(followeeId);

    const deleteFollowDocument: Query<IQueryComplete & IQueryDeleted, IFollowDocument> = FollowModel.deleteOne({
      followeeId: followeeObjectId,
      followerId: followerObjectId
    });
    const updatedUser: Promise<BulkWriteResult> = UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: userId },
          update: { $inc: { followingCount: -1 } }
        }
      },
      {
        updateOne: {
          filter: { _id: followeeId },
          update: { $inc: { followersCount: -1 } }
        }
      }
    ]);
    await Promise.all([deleteFollowDocument, updatedUser]);
  }
}
export const followService: FollowService = new FollowService();
