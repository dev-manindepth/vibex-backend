import { IFollowData, IFollowDocument } from '@follow/interfaces/follower.interface';
import { FollowModel } from '@follow/models/follower.schema';
import { INotificationDocument, INotificationTemplate } from '@notification/interfaces/notification.interface';
import { NotificationModel } from '@notification/models/notification.model';
import { IQueryComplete, IQueryDeleted } from '@post/interfaces/post.interface';
import { notificationTemplate } from '@service/emails/templates/notification/notification-template';
import { mailQueue } from '@service/queues/email.queue';
import { UserCache } from '@service/redis/user.cache';
import { socketIONotificationObject } from '@socket/notification';
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
  public async getFolloweesIds(userId: string): Promise<string[]> {
    const followees = await FollowModel.aggregate([
      {
        $match: { followerId: new mongoose.Types.ObjectId(userId) }
      },
      {
        $project: {
          followeeId: 1,
          _id: 0
        }
      }
    ]);
    console.log(followees);
    return followees.map((followee) => followee.followeeId.toString());
  }
  public async addFollowerToDB(userId: string, followeeId: string, username: string, followerDocumentId: ObjectId): Promise<void> {
    const followerObjectId: ObjectId = new mongoose.Types.ObjectId(userId);
    const followeeObjectId: ObjectId = new mongoose.Types.ObjectId(followeeId);

    const followDocument = await FollowModel.create({
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
    const response: [BulkWriteResult, IUserDocument | null] = await Promise.all([users, userCache.getUserDataFromCache(followeeId)]);
    if (response[1]?.notifications.follows && userId !== followeeId) {
      const notificationModel: INotificationDocument = new NotificationModel();
      const notifications = await notificationModel.insertNotification({
        userFrom: userId,
        userTo: followeeId,
        message: `${username} is now following you.`,
        notificationType: 'follows',
        entityId: new mongoose.Types.ObjectId(userId),
        createdItemId: new mongoose.Types.ObjectId(followDocument._id),
        createdAt: new Date(),
        comment: '',
        post: '',
        imgId: '',
        imgVersion: '',
        gifUrl: '',
        reaction: ''
      });
      socketIONotificationObject.emit('insert notification', notifications, { userTo: followeeId });
      const templateParams: INotificationTemplate = {
        username: response[1].username!,
        message: `${username} is now following you`,
        header: 'Follower Notification'
      };
      const template: string = notificationTemplate.notificationMessageTemplate(templateParams);
      mailQueue.addEmailJob('followersEmail', { receiverEmail: response[1].email!, template, subject: `${username} is now following you` });
    }
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
