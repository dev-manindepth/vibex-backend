import { Add } from '@chat/controllers/add-chat-message';
import { Delete } from '@chat/controllers/delete-chat-message';
import { Get } from '@chat/controllers/get-chat-message';
import { Update } from '@chat/controllers/update-chat-message';
import { authMiddleware } from '@global/helpers/auth-middleware';
import express, { Router } from 'express';

class ChatRoutes {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes() {
    this.router.get('/chat/message/user/:receiverId', authMiddleware.checkAuthentication, Get.prototype.messages);
    this.router.get('/chat/message/conversation-list', authMiddleware.checkAuthentication, Get.prototype.conversationList);
    this.router.post('/chat/message', authMiddleware.checkAuthentication, Add.prototype.message);
    this.router.post('/chat/message/add-chat-users', authMiddleware.checkAuthentication, Add.prototype.addChatUsers);
    this.router.delete('/chat/message/remove-chat-users', authMiddleware.checkAuthentication, Add.prototype.removeChatUsers);
    this.router.put('/chat/message/mark-as-read', authMiddleware.checkAuthentication, Update.prototype.message);
    this.router.delete(
      '/chat/message/mark-as-deleted/:messageId/:senderId/:receiverId/:type',
      authMiddleware.checkAuthentication,
      Delete.prototype.message
    );
    return this.router;
  }
}

export const chatRoutes: ChatRoutes = new ChatRoutes();
