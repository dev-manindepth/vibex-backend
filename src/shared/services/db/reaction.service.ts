import { IPostDocument } from '@post/interfaces/post.interface';
import { PostModel } from '@post/models/post.model';
import { IReactionDocument, IReactionJob } from '@root/features/reactions/interfaces/reaction.interface';
import { ReactionModel } from '@root/features/reactions/models/reaction.model';
import { UserCache } from '@service/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';

const userCache: UserCache = new UserCache();
class ReactionService {
  public async addReactionDataToDB(reactionData: IReactionJob): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { postId, userTo, userFrom, username, type, previousReaction, reactionObject } = reactionData;

    if (previousReaction) {
      delete reactionObject?._id;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const updatedReaction: [IUserDocument, IReactionDocument, IPostDocument] = (await Promise.all([
      userCache.getUserDataFromCache(`${userTo}`),
      ReactionModel.replaceOne({ postId, type: previousReaction, username }, reactionObject, { upsert: true }),
      PostModel.findOneAndUpdate(
        { _id: postId },
        {
          $inc: {
            [`reactions.${previousReaction}`]: -1,
            [`reactions.${type}`]: 1
          }
        },
        { new: true }
      )
    ])) as unknown as [IUserDocument, IReactionDocument, IPostDocument];
    // send reactions notifications
  }
}

export const reactionService: ReactionService = new ReactionService();
