import { IFollowData, IFollowDocument } from '@follow/interfaces/follower.interface';
import { FollowModel } from '@follow/models/follower.schema';
import { IQueryComplete, IQueryDeleted } from '@post/interfaces/post.interface';
import { UserCache } from '@service/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { UserModel } from '@user/models/user.schema';
import { ObjectId, BulkWriteResult } from 'mongodb';
import mongoose, { Query } from 'mongoose';

const userCache: UserCache = new UserCache();
class FollowService {
  // followerId -> current user (loggedin user)
  // followeeId -> the user who is being followed
  public async getFolloweeFromDB(userId: ObjectId): Promise<IFollowData[]> {
    const followee: IFollowData[] = await FollowModel.aggregate([
      // Give me all the documents where i (loggedin user) am the follower we are doing this because we don't know whom we are our followee thats why we are filtering the document where we are follower and obbiously the other person will automatically be followee
      {
        $match: { followerId: userId }
      },
      {
        $lookup: { from: 'User', localField: 'followeeId', foreignField: '_id', as: 'followeeUser' }
      },
      {
        $unwind: '$followeeUser'
      },
      {
        $lookup: { from: 'Auth', localField: 'followeeUser.authId', foreignField: '_id', as: 'followeeAuthUser' }
      },
      {
        $unwind: '$followeeAuthUser'
      },
      {
        $addFields: {
          _id: '$followeeUser._id',
          username: '$followeeAuthUser.username',
          avatarColor: '$followeeAuthUser.avatarColor',
          uId: '$followeeAuthUser.uId',
          postCount: '$followeeUser.postsCount',
          followersCount: '$followeeUser.followersCount',
          followingCount: '$followeeUser.followingCount',
          profilePicture: '$followeeUser.profilePicture',
          userProfile: '$followeeUser'
        }
      },
      {
        $project: {
          authId: 0,
          followerId: 0,
          followeeId: 0,
          createdAt: 0,
          __v: 0,
          followeeUser: 0,
          followeeAuthUser: 0
        }
      }
    ]);
    return followee;
  }
  public async getFollowersFromDB(userId: ObjectId): Promise<IFollowData[]> {
    const followers: IFollowData[] = await FollowModel.aggregate([
      {
        $match: { followeeId: userId }
      },
      {
        $lookup: { from: 'User', localField: 'followerId', foreignField: '_id', as: 'followerUser' }
      },
      {
        $unwind: '$followerUser'
      },
      {
        $lookup: { from: 'Auth', localField: 'followerUser.authId', foreignField: '_id', as: 'followerAuthUser' }
      },
      {
        $unwind: '$followerAuthUser'
      },
      {
        $addFields: {
          _id: '$followerUser._id',
          username: '$followerAuthUser.username',
          avatarColor: '$followerAuthUser.avatarColor',
          uId: '$followerAuthUser.uId',
          postCount: '$followerUser.postCount',
          followersCount: '$followerUser.followersCount',
          followingCount: '$followerUser.followingCount',
          profilePicture: '$followerUser.profilePicture',
          userProfile: '$followerUser'
        }
      },
      {
        $project: {
          authId: 0,
          followerId: 0,
          followeeId: 0,
          createdAt: 0,
          __v: 0,
          followerUser: 0,
          followerAuthUser: 0
        }
      }
    ]);
    return followers;
  }
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
