import { ICommentDocument, ICommentJob, ICommentNameList, IQueryComment } from '@comment/interfaces/comments.interface';
import { CommentModel } from '@comment/models/comments.schema';
import { INotificationDocument, INotificationTemplate } from '@notification/interfaces/notification.interface';
import { NotificationModel } from '@notification/models/notification.model';
import { IPostDocument } from '@post/interfaces/post.interface';
import { PostModel } from '@post/models/post.model';
import { notificationTemplate } from '@service/emails/templates/notification/notification-template';
import { mailQueue } from '@service/queues/email.queue';
import { UserCache } from '@service/redis/user.cache';
import { socketIONotificationObject } from '@socket/notification';
import { IUserDocument } from '@user/interfaces/user.interface';
import mongoose, { Query } from 'mongoose';

const userCache: UserCache = new UserCache();
class CommentService {
  public async addCommentDataToDB(data: ICommentJob): Promise<void> {
    const { postId, userTo, userFrom, comment, username } = data;
    const comments: Promise<ICommentDocument> = CommentModel.create(comment);
    const post: Query<IPostDocument, IPostDocument> = PostModel.findOneAndUpdate(
      {
        _id: postId
      },
      { $inc: { commentsCount: 1 } },
      { new: true }
    ) as Query<IPostDocument, IPostDocument>;
    const user: Promise<IUserDocument> = userCache.getUserDataFromCache(userTo) as Promise<IUserDocument>;
    const response: [ICommentDocument, IPostDocument, IUserDocument] = await Promise.all([comments, post, user]);

    if (response[2].notifications.comments && userFrom !== userTo) {
      const notificationModel: INotificationDocument = new NotificationModel();
      const notifications = await notificationModel.insertNotification({
        userFrom,
        userTo,
        message: `${username} commented on your post.`,
        notificationType: 'comment',
        entityId: new mongoose.Types.ObjectId(postId),
        createdItemId: new mongoose.Types.ObjectId(response[0]._id!),
        createdAt: new Date(),
        comment: comment.comment,
        post: response[1].post,
        imgId: response[1].imgId!,
        imgVersion: response[1].imgVersion!,
        gifUrl: response[1].gifUrl!,
        reaction: ''
      });
      socketIONotificationObject.emit('insert notification', notifications, { userTo });
      const templateParams: INotificationTemplate = {
        username: response[2].username!,
        message: `${username} commented on your post.`,
        header: 'Comment Notification'
      };
      const template: string = notificationTemplate.notificationMessageTemplate(templateParams);
      mailQueue.addEmailJob('commentsEmail', { receiverEmail: response[2].email!, template, subject: 'Post notification' });
    }
  }
  public async getCommentFromDB(query: IQueryComment, sort: Record<string, 1 | -1>): Promise<ICommentDocument[]> {
    const comments: ICommentDocument[] = await CommentModel.aggregate([
      {
        $match: query
      },
      {
        $sort: sort
      }
    ]);
    return comments;
  }
  public async getCommentNamesFromDB(query: IQueryComment, sort: Record<string, 1 | -1>): Promise<ICommentNameList[]> {
    const commentsNameList: ICommentNameList[] = await CommentModel.aggregate([
      {
        $match: query
      },
      {
        $sort: sort
      },
      {
        $group: { _id: null, names: { $addToSet: '$username' }, count: { $sum: 1 } }
      },
      {
        $project: { _id: 0 }
      }
    ]);
    return commentsNameList;
  }
}
export const commentService: CommentService = new CommentService();
