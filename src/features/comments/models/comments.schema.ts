import { ICommentDocument } from '@comment/interfaces/comments.interface';
import mongoose, { Model, Schema, model } from 'mongoose';

const commentSchema: Schema = new Schema({
  postId: { type: mongoose.Types.ObjectId, ref: 'Post', index: true },
  comment: { type: String, default: '' },
  username: { type: String },
  avatarColor: { type: String },
  profilePicture: { type: String },
  createdAt: { type: Date, default: Date.now() }
});

export const CommentModel: Model<ICommentDocument> = model<ICommentDocument>('Comment', commentSchema, 'Comment');
