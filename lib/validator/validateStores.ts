import * as joi from 'joi'
import { storesConfig } from '../schemas/storesConfig'

export const validateStores = {
  // Validate Stores Config
  config(config) {
    return new Promise((resolve, reject) => {
      joi.validate(config, storesConfig, (err, value) => {
        if (err) {
          return reject(new TypeError('config.stores: ' + err))
        }
        return resolve(value)
      })
    })
  }
}
