import { FabrixPolicy as Policy } from '@fabrix/fabrix/dist/common'
import * as multer from 'multer'

/**
 * @module UserPolicy
 * @description User Policy
 */
export class UserPolicy extends Policy {
  csv(req, res, next) {
    const upload = multer({dest: 'test/uploads/'})
    upload.single('file')(req, res, err => {
      if (err) {
        this.log.info(err)
      }
      next()
    })
  }
}

