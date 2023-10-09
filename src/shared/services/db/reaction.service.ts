import { Helpers } from '@global/helpers/helpers';
import { IPostDocument } from '@post/interfaces/post.interface';
import { PostModel } from '@post/models/post.model';
import { IQueryReaction, IReactionDocument, IReactionJob } from '@root/features/reactions/interfaces/reaction.interface';
import { ReactionModel } from '@root/features/reactions/models/reaction.model';
import { UserCache } from '@service/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import mongoose from 'mongoose';

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
  public async removeReactionDataFromDB(reactionData: IReactionJob): Promise<void> {
    const { postId, previousReaction, username } = reactionData;
    await Promise.all([
      ReactionModel.deleteOne({ postId, type: previousReaction, username }),
      PostModel.updateOne({ _id: postId }, { $inc: { [`reactions.${previousReaction}`]: -1 } }, { new: true })
    ]);
  }
  public async getPostReactions(query: IQueryReaction, sort: Record<string, 1 | -1>): Promise<[IReactionDocument[], number]> {
    const reactions: IReactionDocument[] = await ReactionModel.aggregate([{ $match: query }, { $sort: sort }]);
    return [reactions, reactions.length];
  }
  public async getSingleReactionByUsername(postId: string, username: string): Promise<[IReactionDocument, number] | []> {
    const reactions: IReactionDocument[] = await ReactionModel.aggregate([
      { $match: { postId: new mongoose.Types.ObjectId(postId), username: Helpers.firstLetterUppercase(username) } }
    ]);
    return reactions.length ? [reactions[0], 1] : [];
  }
  public async getReactionsByUsername(username: string): Promise<IReactionDocument[]> {
    const reactions: IReactionDocument[] = await ReactionModel.aggregate([
      {
        $match: { username: Helpers.firstLetterUppercase(username) }
      }
    ]);
    return reactions;
  }
}

export const reactionService: ReactionService = new ReactionService();
