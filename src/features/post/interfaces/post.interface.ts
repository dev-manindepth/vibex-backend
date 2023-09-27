import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';
export interface IPostDocument extends Document {
  _id?: string | ObjectId;
  userId: string | ObjectId;
  username: string;
  email: string;
  avatarColor: string;
  profilePicture: string;
  post: string;
  bgColor: string;
  commentsCount: number;
  imgVersion?: string;
  imgId?: string;
  videoId: string;
  videoVersion: string;
  feelings?: string;
  gifUrl?: string;
  privacy?: string;
  reactions?: IReactions;
  createdAt?: Date;
}
interface IReactions {
  like: number;
  love: number;
  happy: number;
  wow: number;
  sad: number;
  angry: number;
}
export interface IReactionJob {
  postId: string;
  username: string;
  previousReaction: string;
  userTo?: string;
  userFrom?: string;
  type?: string;
  reactionObject?: IReactionDocument;
}

interface IReactionDocument {
  _id?: string | ObjectId;
  postId: string | ObjectId;
  username: string;
  avatarColor: string;
  type: string;
  profilePicture: string;
  createdAt?: Date;
  userTo?: string | ObjectId;
  comment?: string;
}

export interface IGetPostsQuery {
  _id?: ObjectId | string;
  username?: string;
  imgId?: string;
  gifUrl?: string;
  videoId?: string;
}
export interface ISavePostToCache {
  postId: ObjectId | string;
  currentUserId: string;
  uId: string;
  createdPost: IPostDocument;
}

export interface IPostJob {
  userId?: string | ObjectId;
  createdPost?: IPostDocument;
  postId?: string | ObjectId;
}

export interface IQueryComplete {
  ok?: number;
  n?: number;
}
export interface IQueryDeleted {
  deletedCount?: number;
}
