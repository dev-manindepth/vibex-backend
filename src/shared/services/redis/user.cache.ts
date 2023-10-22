import { ServerError } from '@global/helpers/error-handler';
import { Helpers } from '@global/helpers/helpers';
import { config } from '@root/config';
import { BaseCache } from '@service/redis/base.cache';
import { INotificationSettings, ISocialLinks, IUserDocument } from '@user/interfaces/user.interface';
import Logger from 'bunyan';

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
