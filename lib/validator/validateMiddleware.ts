import * as joi from 'joi'
import { permissionsMiddleware } from '../schemas/permissionsMiddleware'

export const validateMiddleware = {
  validateMiddleware (middlewares) {
    return new Promise((resolve, reject) => {
      joi.validate(middlewares, permissionsMiddleware, (err, value) => {
        if (err) {
          return reject(new TypeError('config.web.middlewares: ' + err))
        }
        return resolve(value)
      })
    })
  }
}
