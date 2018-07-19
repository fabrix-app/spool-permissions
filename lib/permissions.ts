import { FabrixApp } from '@fabrix/fabrix'
import { clone } from 'lodash'
// const routes = require('./config/routes')
// const policies = require('./config/policies')

export const Permissions = {
  configure: (app: FabrixApp) => {
    return Promise.resolve()
  },
  /**
   * init - Initialize
   * @param app
   */
  init: (app) => {
    return Promise.resolve()
  },

  /**
   * copyDefaults - Copies the default configuration so that it can be restored later
   */
  copyDefaults: (app) => {
    app.config.set('permissionsDefaults', clone(app.config.get('permissions')))
    return Promise.resolve({})
  }
}
