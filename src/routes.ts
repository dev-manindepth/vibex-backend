import { authRoutes } from '@auth/routes/auth.routes';
import { currentUserRoute } from '@auth/routes/currentuser.routes';
import { authMiddleware } from '@global/helpers/auth-middleware';
import { postRoutes } from '@post/routes/post.route';
import { serverAdapter } from '@service/queues/base.queue';
import { Application } from 'express';
import { reactionRoute } from './features/reactions/routes/reaction.route';
import { commentRoute } from '@comment/routes/comments.routes';
import { followRoutes } from '@follow/routes/follow.routes';
import { notificationRoute } from '@notification/routes/notification.routes';
import { imageRoute } from '@image/routes/image.routes';
import { chatRoutes } from '@chat/routes/chat.routes';
import { userRoutes } from '@user/routes/user.route';
import { healthRoutes } from '@health/routes/health.routes';

const BASE_PATH = '/api/v1';
export default (app: Application) => {
  const routes = () => {
    app.use('/queues', serverAdapter.getRouter());
    app.use('', healthRoutes.routes());
    app.use(BASE_PATH, authRoutes.routes());
    app.use(BASE_PATH, authRoutes.signoutRoute());
    app.use(BASE_PATH, authMiddleware.verifyUser, currentUserRoute.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, postRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, reactionRoute.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, commentRoute.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, followRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, notificationRoute.routes());
    app.use(BASE_PATH, authMiddleware.checkAuthentication, imageRoute.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, chatRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, userRoutes.routes());
  };
  routes();
};
