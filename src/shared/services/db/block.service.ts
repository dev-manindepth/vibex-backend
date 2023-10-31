import { UserModel } from '@user/models/user.schema';
import mongoose, { Document } from 'mongoose';
import { PushOperator } from 'mongodb';

class BlockService {
  public async block(userId: string, usertToBlockId: string): Promise<void> {
    await UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: userId, blocked: { $ne: new mongoose.Types.ObjectId(usertToBlockId) } },
          update: {
            $push: {
              blocked: new mongoose.Types.ObjectId(usertToBlockId)
            } as PushOperator<Document>
          }
        }
      },
      {
        updateOne: {
          filter: { _id: usertToBlockId, blockedBy: { $ne: new mongoose.Types.ObjectId(userId) } },
          update: {
            $push: {
              blockedBy: new mongoose.Types.ObjectId(userId)
            } as PushOperator<Document>
          }
        }
      }
    ]);
  }
  public async unblock(userId: string, userToUnblockId: string): Promise<void> {
    await UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: userId },
          update: {
            $pull: {
              blocked: new mongoose.Types.ObjectId(userToUnblockId)
            } as PushOperator<Document>
          }
        }
      },
      {
        updateOne: {
          filter: { _id: userToUnblockId },
          update: {
            $pull: {
              blockedBy: new mongoose.Types.ObjectId(userId)
            } as PushOperator<Document>
          }
        }
      }
    ]);
  }
}

export const blockService: BlockService = new BlockService();
