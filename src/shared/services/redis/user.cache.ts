import { ServerError } from '@global/helpers/error-handler';
import { Helpers } from '@global/helpers/helpers';
import { RedisCommandRawReply } from '@redis/client/dist/lib/commands';
import { config } from '@root/config';
import { BaseCache } from '@service/redis/base.cache';
import { INotificationSettings, ISocialLinks, IUserDocument } from '@user/interfaces/user.interface';
import Logger from 'bunyan';

type UserCacheMulitiType = string | number | Buffer | RedisCommandRawReply[] | IUserDocument | IUserDocument[];
type UserPropValue = string | ISocialLinks | INotificationSettings;
const log: Logger = config.createLogger('userCache');
export class UserCache extends BaseCache {
  constructor() {
    super('userCache');
  }
  public async saveUserToCache(key: string, userUId: string, createdUser: IUserDocument): Promise<void> {
    const createdAt = new Date();
    const {
      _id,
      uId,
      username,
      email,
      avatarColor,
      blocked,
      blockedBy,
      postsCount,
      profilePicture,
      followersCount,
      followingCount,
      notifications,
      work,
      location,
      school,
      quote,
      bgImageId,
      bgImageVersion,
      social
    } = createdUser;

    const dataToSave = {
      _id: `${_id}`,
      uId: `${uId}`,
      username: `${username}`,
      email: `${email}`,
      avatarColor: `${avatarColor}`,
      createdAt: `${createdAt}`,
      postsCount: `${postsCount}`,
      blocked: JSON.stringify(blocked),
      blockedBy: JSON.stringify(blockedBy),
      profilePicture: `${profilePicture}`,
      followersCount: `${followersCount}`,
      followingCount: `${followingCount}`,
      notifications: JSON.stringify(notifications),
      social: JSON.stringify(social),
      work: `${work}`,
      location: `${location}`,
      school: `${school}`,
      quote: `${quote}`,
      bgImageVersion: `${bgImageVersion}`,
      bgImageId: `${bgImageId}`
    };

    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.ZADD('user', { score: parseInt(userUId), value: `${key}` });
      for (const [itemKey, itemValue] of Object.entries(dataToSave)) {
        await this.client.HSET(`users:${key}`, `${itemKey}`, `${itemValue}`);
      }
    } catch (err) {
      log.error(err);
      throw new ServerError('Server error . Try again');
    }
  }
  public async getUserDataFromCache(userObjectId: string): Promise<IUserDocument> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const userDocument: IUserDocument = (await this.client.HGETALL(`users:${userObjectId}`)) as unknown as IUserDocument;
      const { blocked, blockedBy, notifications, social, createdAt, followersCount, followingCount, postsCount } = userDocument;
      userDocument.blocked = Helpers.parseJSON(`${blocked}`);
      userDocument.blockedBy = Helpers.parseJSON(`${blockedBy}`);
      userDocument.notifications = Helpers.parseJSON(`${notifications}`);
      userDocument.social = Helpers.parseJSON(`${social}`);
      userDocument.followersCount = Helpers.parseJSON(`${followersCount}`);
      userDocument.followingCount = Helpers.parseJSON(`${followingCount}`);
      userDocument.postsCount = Helpers.parseJSON(`${postsCount}`);
      userDocument.createdAt = new Date(`${createdAt}`);
      return userDocument;
    } catch (err) {
      throw new ServerError('Something went wrong . Please Try again');
    }
  }
  public async getUsersFromCache(start: number, end: number, excludedUserId: string): Promise<IUserDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const userIdList: string[] = await this.client.ZRANGE('user', start, end, { REV: true });
      const mulit: ReturnType<typeof this.client.multi> = this.client.multi();
      for (const userId of userIdList) {
        if (userId !== excludedUserId) {
          mulit.HGETALL(`users:${userId}`);
        }
      }
      const usersList: UserCacheMulitiType = (await mulit.exec()) as UserCacheMulitiType;
      const users: IUserDocument[] = [];
      for (const user of usersList as IUserDocument[]) {
        user.createdAt = new Date(Helpers.parseJSON(`${user.createdAt}`)) as Date;
        user.blocked = Helpers.parseJSON(`${user.blocked}`);
        user.blockedBy = Helpers.parseJSON(`${user.blockedBy}`);
        user.notifications = Helpers.parseJSON(`${user.notifications}`);
        user.social = Helpers.parseJSON(`${user.social}`);
        user.postsCount = Helpers.parseJSON(`${user.postsCount}`);
        user.followersCount = Helpers.parseJSON(`${user.followersCount}`);
        user.followingCount = Helpers.parseJSON(`${user.followingCount}`);
        user.bgImageId = Helpers.parseJSON(`${user.bgImageId}`);
        user.bgImageVersion = Helpers.parseJSON(`${user.bgImageVersion}`);
        user.profilePicture = Helpers.parseJSON(`${user.profilePicture}`);
        user.work = Helpers.parseJSON(`${user.work}`);
        user.school = Helpers.parseJSON(`${user.school}`);
        user.location = Helpers.parseJSON(`${user.location}`);
        user.quote = Helpers.parseJSON(`${user.quote}`);
        users.push(user);
      }
      return users;
    } catch (err) {
      log.error(err);
      throw new ServerError('Server Error.Try again.');
    }
  }
  public async getTotalUsersInCache(): Promise<number> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const count: number = await this.client.ZCARD('user');
      return count;
    } catch (err) {
      log.error(err);
      throw new ServerError('Server error.Try again.');
    }
  }
  public async getRandomUsersFromCache(userId: string, excludedUsername: string): Promise<IUserDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const userIdList: string[] = await this.client.ZRANGE('user', 0, -1);
      const randomUsers: string[] = Helpers.shuffle(userIdList).slice(0, 10);
      const followers: string[] = await this.client.LRANGE(`follower:${userId}`, 0, -1);

      let users: IUserDocument[] = [];
      for (const user of randomUsers) {
        const followerIndex = followers.indexOf(user);
        if (followerIndex < 0) {
          const userHash: IUserDocument = (await this.client.HGETALL(`users:${user}`)) as unknown as IUserDocument;
          users.push(userHash);
        }
      }
      users = users.filter((user) => user.username != excludedUsername);
      for (const user of users) {
        user.createdAt = new Date(Helpers.parseJSON(`${user.createdAt}`)) as Date;
        user.blocked = Helpers.parseJSON(`${user.blocked}`);
        user.blockedBy = Helpers.parseJSON(`${user.blockedBy}`);
        user.notifications = Helpers.parseJSON(`${user.notifications}`);
        user.social = Helpers.parseJSON(`${user.social}`);
        user.postsCount = Helpers.parseJSON(`${user.postsCount}`);
        user.followersCount = Helpers.parseJSON(`${user.followersCount}`);
        user.followingCount = Helpers.parseJSON(`${user.followingCount}`);
        user.bgImageId = Helpers.parseJSON(`${user.bgImageId}`);
        user.bgImageVersion = Helpers.parseJSON(`${user.bgImageVersion}`);
        user.profilePicture = Helpers.parseJSON(`${user.profilePicture}`);
        user.work = Helpers.parseJSON(`${user.work}`);
        user.school = Helpers.parseJSON(`${user.school}`);
        user.location = Helpers.parseJSON(`${user.location}`);
        user.quote = Helpers.parseJSON(`${user.quote}`);
      }
      return users;
    } catch (err) {
      log.error(err);
      throw new ServerError('Server Error.Try again');
    }
  }
  public async updateSingleUserPropInCache(userId: string, prop: string, value: UserPropValue): Promise<IUserDocument | null> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.HSET(`users:${userId}`, prop, JSON.stringify(value));
      const updateUser: IUserDocument = (await this.getUserDataFromCache(userId)) as IUserDocument;
      return updateUser;
    } catch (err) {
      log.error(err);
      throw new ServerError('Server Error. Try again.');
    }
  }
}
