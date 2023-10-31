import mongoose, { Document } from 'mongoose';

export interface IFileImageDocuement extends Document {
  userId: mongoose.Types.ObjectId | string;
  bgImageVersion: string;
  bgImageId: string;
  imgId: string;
  imgVersion: string;
  createdAt: Date;
}
export interface IFileImageJobData {
  userId?: string;
  url?: string;
  imgId?: string;
  imgVersion?: string;
  imageId?: string;
}
export interface IBgUploadResponse {
  version: string;
  publicId: string;
  public_id?: string;
}
