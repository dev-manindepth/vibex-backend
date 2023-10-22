import { IFileImageDocuement } from '@image/interfaces/image.interface';
import mongoose, { Model, Schema, model } from 'mongoose';

const imageSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  bgImageVersion: { type: String, default: '' },
  bgImageId: { type: String, default: '' },
  imgVersion: { type: String, default: '' },
  imgId: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now, index: true }
});

export const ImageModel: Model<IFileImageDocuement> = model<IFileImageDocuement>('Image', imageSchema, 'Image');
