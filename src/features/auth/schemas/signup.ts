import Joi, { ObjectSchema } from 'joi';

export const signupSchema: ObjectSchema = Joi.object().keys({
  username: Joi.string().required().min(4).max(8).messages({
    'string.base': 'Username must be of type string',
    'string.min': 'Invalid username',
    'string.max': 'Invalid username',
    'string.empty': 'Username is required field'
  }),
  password: Joi.string().required().min(4).max(8).messages({
    'string.base': 'password must be of type string',
    'string.min': 'Invalid password',
    'string.max': 'Invalid password',
    'string.empty': 'Password is required field'
  }),
  email: Joi.string().required().email().messages({
    'string.base': 'email must be of type string',
    'string.email': 'email must be valid',
    'string.empty': 'email is a required field'
  }),
  avatarColor: Joi.string().required().messages({
    'any.required': 'Avatar color is required'
  }),
  avatarImage: Joi.string().required().messages({
    'any.required': 'Avatar image is required'
  })
});
