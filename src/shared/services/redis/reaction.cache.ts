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
      mulit.LREM(`reactions:${postId}`, 1, JSON.stringify(userPreviousReaction));
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
      reactionDocumentCollection.push(Helpers.parseJSON(reaction) as IReactionDocument);
    }
    return reactionDocumentCollection.find((reaction: IReactionDocument) => reaction.username === username);
  }
}
