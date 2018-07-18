import * as joi from 'joi'
import { permissions } from '../schemas/permissions'

export const validateConfig = {
  validateConfig (config) {
    return new Promise((resolve, reject) => {
      joi.validate(config, permissions, (err, value) => {
        if (err) {
          return reject(new TypeError('config.permissions: ' + err))
        }
        return resolve(value)
      })
    })
  }
}
