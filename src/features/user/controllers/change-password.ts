import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { BadRequestError } from '@global/helpers/error-handler';
import { authService } from '@service/db/auth.service';
import { userService } from '@service/db/user.service';
import { IResetPasswordParams } from '@user/interfaces/user.interface';
import { Request, Response } from 'express';
import publicIP from 'ip';
import { format } from 'date-fns';
import HTTP_STATUS from 'http-status-codes';
import { resetPasswordTemplate } from '@service/emails/templates/reset-password/reset-password-template';
import { mailQueue } from '@service/queues/email.queue';
import { changePasswordSchema } from '@user/schemas/user';
import { joiValidation } from '@global/decorators/joi-validation-decorators';

export class Update {
  @joiValidation(changePasswordSchema)
  public async password(req: Request, res: Response): Promise<void> {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
      throw new BadRequestError('Passwords donot match');
    }
    const existingUser: IAuthDocument = await authService.getUserByUsername(req.currentUser!.username);
    const passwordMatch: boolean = await existingUser.comparePassword(currentPassword);
    if (!passwordMatch) {
      throw new BadRequestError('Invalid credentials');
    }
    const hashedPassword: string = await existingUser.hashPassword(newPassword);
    await userService.updatePassword(req.currentUser!.username, hashedPassword);

    const templateParams: IResetPasswordParams = {
      username: existingUser.username!,
      email: existingUser.email!,
      ipaddress: publicIP.address(),
      date: format(new Date(), 'dd/MM/yyyy HH:mm')
    };
    const template: string = resetPasswordTemplate.createTemplate(templateParams);
    mailQueue.addEmailJob('changePassword', { template, receiverEmail: existingUser.email!, subject: 'Password update confirmation' });

    res.status(HTTP_STATUS.OK).json({ message: 'Password updated successfully. You will be redirected shortly to login page' });
  }
}
