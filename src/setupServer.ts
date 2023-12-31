import { Application, json, urlencoded, Request, Response, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import compression from 'compression';
import cookieSession from 'cookie-session';
import HTTP_STATUS from 'http-status-codes';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import Logger from 'bunyan';
import apiStats from 'swagger-stats';
import { config } from '@root/config';
import applicationRoutes from '@root/routes';
import { CustomError, IErrorResponse } from '@global/helpers/error-handler';
import { PostSocketIO } from '@socket/post.socket';
import { FollowSocketIO } from '@socket/follow';
import { NotificationSocketIO } from '@socket/notification';
import { ImageSocketIO } from '@socket/image';
import { ChatSocketIO } from '@socket/chat';
import { UserSocketIO } from '@socket/user';

const log: Logger = config.createLogger('setupServer');
const SERVER_PORT = 5000;
export class VibeXServer {
  private app: Application;
  constructor(app: Application) {
    this.app = app;
  }
  public start(): void {
    this.securityMiddleware(this.app);
    this.standardMiddleware(this.app);
    this.routesMiddleware(this.app);
    this.apiMonitor(this.app);
    this.globalErrorHandler(this.app);
    this.startServer(this.app);
  }

  private securityMiddleware(app: Application): void {
    app.use(
      cookieSession({
        name: 'session',
        keys: [config.SECRET_KEY_ONE!, config.SECRET_KEY_TWO!],
        maxAge: 24 * 7 * 3600000,
        secure: config.NODE_ENV !== 'development'
      })
    );
    app.use(hpp());
    app.use(helmet());
    app.use(
      cors({
        origin: config.CLIENT_URL,
        credentials: true,
        optionsSuccessStatus: 200,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      })
    );
  }
  private standardMiddleware(app: Application): void {
    app.use(compression());
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));
  }
  private routesMiddleware(app: Application): void {
    applicationRoutes(app);
  }
  private apiMonitor(app: Application): void {
    app.use(apiStats.getMiddleware({ uriPath: '/api-monitor' }));
  }
  private globalErrorHandler(app: Application): void {
    app.all('*', (req: Request, res: Response) => {
      res.status(HTTP_STATUS.NOT_FOUND).json({ message: `${req.originalUrl} not found` });
    });
    app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
      log.error(error);
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json(error.serializeError());
      }
      next();
    });
  }
  private async startServer(app: Application): Promise<void> {
    try {
      const httpServer: http.Server = new http.Server(app);
      const socketIO: Server = await this.createSocketIO(httpServer);
      this.socketIOConnections(socketIO);
      this.startHTTPServer(httpServer);
    } catch (error) {
      log.error('Error in starting server', error);
    }
  }
  private async createSocketIO(httpServer: http.Server): Promise<Server> {
    try {
      const io: Server = new Server(httpServer, {
        cors: {
          origin: config.CLIENT_URL,
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
        }
      });
      const pubClient = createClient({ url: config.REDIS_HOST });
      const subClient = pubClient.duplicate();

      await Promise.all([pubClient.connect(), subClient.connect()]);
      io.adapter(createAdapter(pubClient, subClient));
      return io;
    } catch (error) {
      log.error('error in socketio', error);
      throw error;
    }
  }
  private startHTTPServer(httpServer: http.Server): void {
    httpServer.listen(SERVER_PORT, () => {
      log.info(`Server listening on PORT ${SERVER_PORT}`);
    });
  }

  private socketIOConnections(io: Server): void {
    const postSocketHandler: PostSocketIO = new PostSocketIO(io);
    const followSocketHandler: FollowSocketIO = new FollowSocketIO(io);
    const notificationSocketHandler: NotificationSocketIO = new NotificationSocketIO();
    const imageSocketHandler: ImageSocketIO = new ImageSocketIO();
    const chatSocketHandler: ChatSocketIO = new ChatSocketIO(io);
    const userSocketHandler: UserSocketIO = new UserSocketIO(io);

    postSocketHandler.listen();
    followSocketHandler.listen();
    notificationSocketHandler.listen(io);
    imageSocketHandler.listen(io);
    chatSocketHandler.listen();
    userSocketHandler.listen();
  }
}
