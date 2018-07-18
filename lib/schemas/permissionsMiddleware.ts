import * as joi from 'joi'

export const permissionsMiddleware = joi.object().keys({
  order: joi.array().items(
    joi.string(),
    joi.string().label('passportInit', 'passportSession').required())
}).unknown()
