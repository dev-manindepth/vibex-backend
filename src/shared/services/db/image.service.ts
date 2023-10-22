import { IFileImageDocuement } from '@image/interfaces/image.interface';
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
    await this.addImage(userId, imgId, imgVersion, 'background');
  }
  public async getImageByBackgroundImageId(bgImageId: string): Promise<IFileImageDocuement> {
    const image: IFileImageDocuement = (await ImageModel.findOne({ _id: bgImageId })) as IFileImageDocuement;
    return image;
  }
  public async removeImageFromDB(imageId: string): Promise<void> {
    await ImageModel.deleteOne({ _id: imageId });
  }
}
export const imageService: ImageService = new ImageService();
