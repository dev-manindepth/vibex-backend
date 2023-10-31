import { ServerError } from '@global/helpers/error-handler';
import { Helpers } from '@global/helpers/helpers';
import { config } from '@root/config';
import { IReactionDocument, IReactions } from '@root/features/reactions/interfaces/reaction.interface';
import { BaseCache } from '@service/redis/base.cache';
import Logger from 'bunyan';

const log: Logger = config.createLogger('reaction');
export class ReactionCache extends BaseCache {
  constructor() {
    super('reactionsCache');
  }
  public async savePostReactionToCache(
    postId: string,
    reaction: IReactionDocument,
    postReactions: IReactions,
    type: string,
    previousReaction: string
  ): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      if (previousReaction) {
        // Remove previous reaction
        this.removePostReactionFromCache(postId, reaction.username, postReactions);
      }
      if (type) {
        await this.client.LPUSH(`reactions:${postId}`, JSON.stringify(reaction));
        await this.client.HSET(`posts:${postId}`, 'reactions', JSON.stringify(postReactions));
      }
    } catch (err) {
      log.error(err);
      throw new ServerError('Server error. Try again');
    }
  }
  public async removePostReactionFromCache(postId: string, username: string, postReactions: IReactions): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const reactionListCollection: string[] = await this.client.LRANGE(`reactions:${postId}`, 0, -1);
      const mulit: ReturnType<typeof this.client.multi> = this.client.multi();
      const userPreviousReaction: IReactionDocument = this.getPreviousReaction(reactionListCollection, username) as IReactionDocument;
      console.log(userPreviousReaction);
      if (userPreviousReaction) {
        mulit.LREM(`reactions:${postId}`, 1, JSON.stringify(userPreviousReaction));
      }

      await mulit.exec();

      await this.client.HSET(`posts:${postId}`, 'reactions', JSON.stringify(postReactions));
    } catch (err) {
      log.error(err);
      throw new ServerError('Server error. Try again.');
    }
  }

  private getPreviousReaction(reactionCollectionList: string[], username: string): IReactionDocument | undefined {
    const reactionDocumentCollection: IReactionDocument[] = [];
    for (const reaction of reactionCollectionList) {
      console.table(Helpers.parseJSON(reaction));
      reactionDocumentCollection.push(Helpers.parseJSON(reaction) as IReactionDocument);
    }
    return reactionDocumentCollection.find((reaction: IReactionDocument) => reaction.username === username);
  }
  public async getReactionsFromCache(postId: string): Promise<[IReactionDocument[], number]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const reactionCount: number = await this.client.LLEN(`reactions:${postId}`);
      const rawReactionDocumentList: string[] = await this.client.LRANGE(`reactions:${postId}`, 0, -1);
      const reactionDocumentList: IReactionDocument[] = [];
      for (const reactionDocument of rawReactionDocumentList) {
        reactionDocumentList.push(Helpers.parseJSON(reactionDocument));
      }
      return rawReactionDocumentList.length ? [reactionDocumentList, reactionCount] : [[], 0];
    } catch (err) {
      log.error(err);
      throw new ServerError('Server Error.Try again.');
    }
  }
  public async getSingleReactionByUsernameForCache(postId: string, username: string): Promise<[IReactionDocument, number] | []> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const rawReactionCollection: string[] = await this.client.LRANGE(`reactions:${postId}`, 0, -1);
      const reactionCollection: IReactionDocument[] = [];
      for (const reaction of rawReactionCollection) {
        reactionCollection.push(Helpers.parseJSON(reaction));
      }
      const reaction: IReactionDocument = reactionCollection.find(
        (r: IReactionDocument) => r.postId === postId && r.username === username
      ) as IReactionDocument;
      return reaction ? [reaction, 1] : [];
    } catch (err) {
      log.error(err);
      throw new ServerError('Server Error.Try again.');
    }
  }
}
