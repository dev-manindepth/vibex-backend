import { ImageModel } from '@image/models/image.model';
import { UserModel } from '@user/models/user.schema';

class ImageService {
  public async addUserProfileImageToDB(userId: string, url: string, imgId: string, imgVersion: string): Promise<void> {
    await UserModel.updateOne(
      { _id: userId },
      {
        $set: { profilePicture: url }
      }
    );
    await this.addImage(userId, imgId, imgVersion, 'profile');
  }
  public async addImage(userId: string, imgId: string, imgVersion: string, type: string): Promise<void> {
    await ImageModel.create({
      userId,
      bgImageVersion: type == 'background' ? imgVersion : '',
      bgImageId: type == 'background' ? imgId : '',
      imgVersion,
      imgId
    });
  }
  public async addBackgroundImageToDB(userId: string, imgId: string, imgVersion: string): Promise<void> {
    await UserModel.updateOne({ _id: userId }, { $set: { bgImageId: imgId, bgImageVersion: imgVersion } });
    await this.addImage(userId,imgId,imgVersion,'background');
  }
}
export const imageService: ImageService = new ImageService();
