import { authRoutes } from '@auth/routes/auth.routes';
import { currentUserRoute } from '@auth/routes/currentuser.routes';
import { authMiddleware } from '@global/helpers/auth-middleware';
import { postRoutes } from '@post/routes/post.route';
import { serverAdapter } from '@service/queues/base.queue';
import { Application } from 'express';
import { reactionRoute } from './features/reactions/routes/reaction.route';

const BASE_PATH = '/api/v1';
export default (app: Application) => {
  const routes = () => {
    app.use('/queues', serverAdapter.getRouter());
    app.use(BASE_PATH, authRoutes.routes());
    app.use(BASE_PATH, authRoutes.signoutRoute());
    app.use(BASE_PATH, authMiddleware.verifyUser, currentUserRoute.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, postRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, reactionRoute.routes());
  };
  routes();
};
