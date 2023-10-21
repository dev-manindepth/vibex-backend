import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { signinSchema } from '@auth/schemas/signin';
import { joiValidation } from '@global/decorators/joi-validation-decorators';
import { BadRequestError } from '@global/helpers/error-handler';
import { config } from '@root/config';
import { authService } from '@service/db/auth.service';
import { userService } from '@service/db/user.service';
import { IUserDocument } from '@user/interfaces/user.interface';
import { Request, Response } from 'express';
import JWT from 'jsonwebtoken';
import HTTP_STATUS from 'http-status-codes';
export class Signin {
  @joiValidation(signinSchema)
  public async read(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;
    const existingAuthUser: IAuthDocument = await authService.getUserByUsername(username);
    if (!existingAuthUser) {
      throw new BadRequestError('Invalid username credentials');
    }
    const passwordMatch: boolean = await existingAuthUser.comparePassword(password);
    if (!passwordMatch) {
      throw new BadRequestError('Invalid Password credentials');
    }
    const user: IUserDocument = await userService.getUserByAuthId(`${existingAuthUser._id}`);
    const userToken: string = JWT.sign(
      {
        userId: user._id,
        uId: existingAuthUser.uId,
        email: existingAuthUser.email,
        username: existingAuthUser.username,
        avatarColor: existingAuthUser.avatarColor
      },
      config.JWT_TOKEN!
    );
    req.session = { jwt: userToken };
    const userDocument: IUserDocument = {
      ...user,
      authId: existingAuthUser!._id,
      username: existingAuthUser!.username,
      email: existingAuthUser!.email,
      avatarColor: existingAuthUser!.avatarColor,
      uId: existingAuthUser!.uId,
      createdAt: existingAuthUser!.createdAt
    } as IUserDocument;
    res.status(HTTP_STATUS.OK).json({ message: 'user login successful', user: userDocument, token: userToken });
  }
}
