import { IPostDocument } from '@post/interfaces/post.interface';
import { PostModel } from '@post/models/post.model';
import { IUserDocument } from '@user/interfaces/user.interface';
import { UserModel } from '@user/models/user.schema';
import { UpdateQuery } from 'mongoose';

class PostService {
  public async addPostToDB(userId: string, createdPost: IPostDocument): Promise<void> {
    const post: Promise<IPostDocument> = PostModel.create(createdPost);
    const user: UpdateQuery<IUserDocument> = UserModel.updateOne({ _id: userId }, { $inc: { postsCount: 1 } });
    await Promise.all([post, user]);
  }
  public async updatePostInDB(postId: string, updatedPost: IPostDocument): Promise<void> {
    await PostModel.updateOne({ _id: postId }, { $set: updatedPost });
  }
}
export const postService: PostService = new PostService();
