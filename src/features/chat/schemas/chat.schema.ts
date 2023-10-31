import Joi, { ObjectSchema } from 'joi';

export const addChatSchema: ObjectSchema = Joi.object().keys({
  conversationId: Joi.string().optional().allow(null, ''),
  receiverId: Joi.string().required(),
  receiverUsername: Joi.string().required(),
  receiverAvatarColor: Joi.string().required(),
  receiverProfilePicture: Joi.string().required(),
  body: Joi.string().optional().allow(null, ''),
  gifUrl: Joi.string().optional().allow(null, ''),
  selectedImage: Joi.string().optional().allow(null, ''),
  isRead: Joi.boolean().optional()
});

export const markChatSchema: ObjectSchema = Joi.object().keys({
  senderId: Joi.string().required(),
  receiverId: Joi.string().required()
});
