import { IGetPostsQuery, IPostDocument, IQueryComplete, IQueryDeleted } from '@post/interfaces/post.interface';
import { PostModel } from '@post/models/post.model';
import { IUserDocument } from '@user/interfaces/user.interface';
import { UserModel } from '@user/models/user.schema';
import { Query, UpdateQuery } from 'mongoose';

class PostService {
  public async addPostToDB(userId: string, createdPost: IPostDocument): Promise<void> {
    const post: Promise<IPostDocument> = PostModel.create(createdPost);
    const user: UpdateQuery<IUserDocument> = UserModel.updateOne({ _id: userId }, { $inc: { postsCount: 1 } });
    await Promise.all([post, user]);
  }
  public async getPosts(query: IGetPostsQuery, skip = 0, limit = 0, sort: Record<string, 1 | -1>): Promise<IPostDocument[]> {
    let postQuery = {};
    if (query?.imgId && query?.gifUrl) {
      postQuery = { $or: [{ imgId: { $ne: '' } }, { gifUrl: { $ne: '' } }] };
    } else if (query?.videoId) {
      postQuery = { $or: [{ videoId: { $ne: '' } }] };
    } else {
      postQuery = query;
    }
    const posts: IPostDocument[] = await PostModel.aggregate([
      {
        $match: postQuery
      },
      {
        $sort: sort
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      }
    ]);
    return posts;
  }
  public async postsCount(query: IGetPostsQuery): Promise<number> {
    let postQuery = {};
    if (query?.imgId && query?.gifUrl) {
      postQuery = { $or: [{ imgId: { $ne: '' } }, { gifUrl: { $ne: '' } }] };
    } else if (query?.videoId) {
      postQuery = { $or: [{ videoId: { $ne: '' } }] };
    } else {
      postQuery = query;
    }
    const postCount: number = await PostModel.countDocuments(postQuery);
    return postCount;
  }
  public async updatePostInDB(postId: string, updatedPost: IPostDocument): Promise<void> {
    await PostModel.updateOne({ _id: postId }, { $set: updatedPost });
  }
  public async deletePostFromDB(postId: string, userId: string): Promise<void> {
    const deletePost: Query<IQueryComplete & IQueryDeleted, IPostDocument> = PostModel.deleteOne({ _id: postId });
    const decrementPostCount: UpdateQuery<IUserDocument> = UserModel.updateOne({ _id: userId }, { $inc: { postsCount: -1 } });
    //TODO Delete from Reaction and comments Models as well
    await Promise.all([deletePost, decrementPostCount]);
  }
}
export const postService: PostService = new PostService();
