import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { emailSchema, passwordSchema } from '@auth/schemas/password';
import { joiValidation } from '@global/decorators/joi-validation-decorators';
import { BadRequestError } from '@global/helpers/error-handler';
import { authService } from '@service/db/auth.service';
import { Request, Response } from 'express';
import crypto from 'crypto';
import { config } from '@root/config';
import { forgotPasswordTemplate } from '@service/emails/templates/forgot-password/forgot-password-template';
import { mailQueue } from '@service/queues/email.queue';
import HTTP_STATUS from 'http-status-codes';
import { IResetPasswordParams } from '@user/interfaces/user.interface';
import publicIP from 'ip';
import { format } from 'date-fns';
import { resetPasswordTemplate } from '@service/emails/templates/reset-password/reset-password-template';

export class Password {
  @joiValidation(emailSchema)
  public async create(req: Request, res: Response) {
    const { email } = req.body;
    const existingAuthUser: IAuthDocument = await authService.getUserByEmail(email);
    if (!existingAuthUser) {
      throw new BadRequestError('Invalid email');
    }
    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
    const randomCharacters: string = randomBytes.toString('hex');
    await authService.updatePasswordToken(`${existingAuthUser._id}`, randomCharacters, Date.now() * 60 * 60 * 1000);
    const resetLink: string = `${config.CLIENT_URL}/reset-password?token=${randomCharacters}`;
    const template: string = forgotPasswordTemplate.createTemplate(existingAuthUser.username, resetLink);
    mailQueue.addEmailJob('forgotPasswordEmail', { template, receiverEmail: email, subject: 'Reset Your Password' });
    res.status(HTTP_STATUS.OK).json({ message: 'Password resent link sent successfully' });
  }

  @joiValidation(passwordSchema)
  public async update(req: Request, res: Response): Promise<void> {
    const { password, confirmPassword } = req.body;
    // TODO create another joivalidator to validate req.params
    const { token } = req.params;
    if (password !== confirmPassword) {
      throw new BadRequestError('Password do not match');
    }
    const existingAuthUser: IAuthDocument = await authService.getAuthUserByPasswordToken(token);
    if (!existingAuthUser) {
      throw new BadRequestError('Reset token has expired');
    }
    existingAuthUser.password = password;
    existingAuthUser.passwordResetExpires = undefined;
    existingAuthUser.passwordResetToken = undefined;
    await existingAuthUser.save();

    const templateParams: IResetPasswordParams = {
      username: existingAuthUser.username,
      email: existingAuthUser.email,
      ipaddress: publicIP.address(),
      date: format(new Date(), 'dd/MM/yyyy HH:mm')
    };
    const template: string = resetPasswordTemplate.createTemplate(templateParams);
    mailQueue.addEmailJob('resetPasswordEmail', {
      template,
      receiverEmail: existingAuthUser.email,
      subject: 'Password Reset Confirmation'
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Password successfully updated' });
  }
}
