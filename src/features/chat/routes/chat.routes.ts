import { Add } from '@chat/controllers/add-chat-message';
import { authMiddleware } from '@global/helpers/auth-middleware';
import express, { Router } from 'express';

class ChatRoutes {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes() {
    this.router.post('/chat/message', authMiddleware.checkAuthentication, Add.prototype.message);
    return this.router;
  }
}

export const chatRoutes: ChatRoutes = new ChatRoutes();
