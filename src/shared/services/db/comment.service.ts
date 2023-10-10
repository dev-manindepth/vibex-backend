import { ICommentDocument, ICommentJob } from '@comment/interfaces/comments.interface';
import { CommentModel } from '@comment/models/comments.schema';
import { IPostDocument } from '@post/interfaces/post.interface';
import { PostModel } from '@post/models/post.model';
import { UserCache } from '@service/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { Query } from 'mongoose';

const userCache: UserCache = new UserCache();
class CommentService {
  public async addCommentDataToDB(data: ICommentJob): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { postId, userTo, userFrom, comment, username } = data;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const comments: Promise<ICommentDocument> = CommentModel.create(comment);
    const post: Query<IPostDocument, IPostDocument> = PostModel.findOneAndUpdate(
      {
        _id: postId
      },
      { $inc: { commentsCount: 1 } },
      { new: true }
    ) as Query<IPostDocument, IPostDocument>;
    const user: Promise<IUserDocument> = userCache.getUserDataFromCache(userTo) as Promise<IUserDocument>;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const response: [ICommentDocument, IPostDocument, IUserDocument] = await Promise.all([comment, post, user]);
  }
}
export const commentService: CommentService = new CommentService();
