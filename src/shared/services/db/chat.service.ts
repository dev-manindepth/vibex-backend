import { IMessageData } from '@chat/interfaces/chat.interace';
import { IConversationDocument } from '@chat/interfaces/conversation.interface';
import { MessageModel } from '@chat/models/chat.model';
import { ConversationModel } from '@chat/models/conversation.model';

class ChatService {
  public async addMessageToDB(data: IMessageData): Promise<void> {
    const conversation: IConversationDocument[] = await ConversationModel.find({ _id: data?.conversationId });
    if (conversation.length == 0) {
      await ConversationModel.create({
        _id: data?.conversationId,
        senderId: data.senderId,
        receiverId: data.receiverId
      });
    }
    await MessageModel.create(data);
  }
}
export const chatService: ChatService = new ChatService();
