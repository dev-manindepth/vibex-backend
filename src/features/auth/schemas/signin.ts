import Joi, { ObjectSchema } from 'joi';

export const signinSchema: ObjectSchema = Joi.object().keys({
  username: Joi.string().required().min(4).max(8).messages({
    'string.base': 'Username must be of type string',
    'string.min': 'Invalid username',
    'string.max': 'Invalid username',
    'string.empty': 'Username is a required field'
  }),
  password: Joi.string().required().min(4).max(8).messages({
    'string.base': 'password must be of type string',
    'string.min': 'Invalid password',
    'string.max': 'Invalid password',
    'string.empty': 'Password is a required field'
  })
});
