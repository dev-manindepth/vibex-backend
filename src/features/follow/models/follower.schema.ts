import mongoose, { Model, Schema, model } from 'mongoose';
import { IFollowDocument } from '../interfaces/follower.interface';

const followSchema: Schema = new Schema({
  followerId: { type: mongoose.Types.ObjectId, ref: 'User', index: true },
  followeeId: { type: mongoose.Types.ObjectId, ref: 'User', index: true },
  createdAt: { type: Date, default: Date.now() }
});

export const FollowModel: Model<IFollowDocument> = model<IFollowDocument>('Follower', followSchema, 'Follower');
