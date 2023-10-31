import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';
import { IReactions } from '@root/features/reactions/interfaces/reaction.interface';
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
  updatedPost?: IPostDocument;
}

export interface IQueryComplete {
  ok?: number;
  n?: number;
}
export interface IQueryDeleted {
  deletedCount?: number;
}
