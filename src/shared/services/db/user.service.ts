import { IUserDocument } from '@user/interfaces/user.interface';
import { UserModel } from '@user/models/user.schema';
import mongoose from 'mongoose';
import { followService } from '@service/db/follow.service';

class UserService {
  public async createUser(data: IUserDocument): Promise<void> {
    await UserModel.create(data);
  }
  public async getUserByAuthId(authId: string): Promise<IUserDocument> {
    const userQueryPipeline = [
      {
        $match: { authId: new mongoose.Types.ObjectId(authId) }
      },
      {
        $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authId' }
      },
      {
        $unwind: '$authId'
      },
      {
        $project: this.aggregateProject()
      }
    ];
    const users: IUserDocument[] = await UserModel.aggregate(userQueryPipeline);
    return users[0];
  }
  public async getUserByUserId(userId: string): Promise<IUserDocument> {
    const userQueryPipeline = [
      {
        $match: { _id: new mongoose.Types.ObjectId(userId) }
      },
      {
        $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authId' }
      },
      {
        $unwind: '$authId'
      },
      {
        $project: this.aggregateProject()
      }
    ];
    const users: IUserDocument[] = await UserModel.aggregate(userQueryPipeline);
    return users[0];
  }
  public async getAllUsers(userId: string, skip: number, limit: number): Promise<IUserDocument[]> {
    const users: IUserDocument[] = await UserModel.aggregate([
      {
        $match: { _id: { $ne: new mongoose.Types.ObjectId(userId) } }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authId' }
      },
      {
        $unwind: '$authId'
      },
      {
        $project: this.aggregateProject()
      }
    ]);
    return users;
  }
  public async getTotalUsersInDB(): Promise<number> {
    const userCount: number = await UserModel.find({}).countDocuments();
    return userCount;
  }
  public async getRandomUsers(userId: string): Promise<IUserDocument[]> {
    const randomUsers: IUserDocument[] = [];
    const users: IUserDocument[] = await UserModel.aggregate([
      {
        $match: { _id: { $ne: new mongoose.Types.ObjectId(userId) } }
      },
      {
        $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authUser' }
      },
      {
        $unwind: '$authUser'
      },
      {
        $sample: { size: 10 }
      },
      {
        $addFields: {
          username: '$authUser.username',
          email: '$authUser.email',
          avatarColor: '$authUser.avatarColor',
          uId: '$authUser.uId',
          createdAt: '$authUser.createdAt'
        }
      },
      {
        $project: {
          authId:0,
          authUser: 0,
          __v: 0
        }
      }
    ]);
    const followers: string[] = await followService.getFolloweesIds(userId);
    for (const user of users) {
      const followIndex = followers.indexOf(`${user._id}`);
      if (followIndex < 0) {
        randomUsers.push(user);
      }
    }
    return randomUsers;
  }
  private aggregateProject() {
    return {
      _id: 1,
      username: '$authId.username',
      uId: '$authId.uId',
      email: '$authId.email',
      avatarColor: '$authId.avatarColor',
      createdAt: '$authId.createdAt',
      postsCount: 1,
      work: 1,
      school: 1,
      quote: 1,
      location: 1,
      blocked: 1,
      blockedBy: 1,
      followersCount: 1,
      followingCount: 1,
      notifications: 1,
      social: 1,
      bgImageVersion: 1,
      bgImageId: 1,
      profilePicture: 1
    };
  }
}
export const userService: UserService = new UserService();
