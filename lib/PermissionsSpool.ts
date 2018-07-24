import { Spool } from '@fabrix/fabrix/dist/common'
import { validateStores, validateConfig, validateMiddleware } from './validator'
import { Permissions } from './permissions'
import { Utils } from './utils'

import { includes } from 'lodash'

import * as config from './config/index'
import * as pkg from '../package.json'
import * as api from './api/index'

export class PermissionsSpool extends Spool {

  public routesFixtures

  constructor(app) {
    super(app, {
      config: config,
      pkg: pkg,
      api: api
    })
  }

  /**
   * Validate permissions config
   */
  async validate () {
    const requiredSpools = ['express', 'sequelize', 'passport']
    const spools = Object.keys(this.app.spools)

    if (!spools.some(v => requiredSpools.indexOf(v) >= 0)) {
      return Promise.reject(new Error(`spool-permissions requires spools: ${ requiredSpools.join(', ') }!`))
    }

    if (!this.app.config.get('permissions')) {
      return Promise.reject(
        new Error('config.permissions is absent, check it\'s present and loaded under index.js'))
    }

    if (!this.app.config.get('passport')) {
      return Promise.reject(new Error('No configuration found at config.passport!'))
    }

    // TODO REWRITE
    // if (
    //   this.app.config.get('policies')
    //   && this.app.config.get('policies')['*']
    //   && this.app.config.get('policies')['*'].indexOf('CheckPermissions.checkRoute') === -1
    // ) {
    //   this.app.log.warn('Permissions Routes are unlocked! add \'*\' : [\'CheckPermissions.checkRoute\'] to config/policies.ts')
    // }
    return Promise.all([
      validateStores.config(this.app.config.get('stores')),
      validateConfig.validateConfig(this.app.config.get('permissions')),
      validateMiddleware.validateMiddleware(this.app.config.get('web.middlewares'))
    ])
  }

  /**
   * Adds Routes, Policies, and Agenda
   */
  async configure () {
    return Promise.all([
      Permissions.configure(this.app),
      Permissions.copyDefaults(this.app)
    ])
  }

  /**
   * Setup routes permissions and load fixtures if needed
   */
  async initialize() {
    return Promise.all([
      Permissions.init(this.app),
      Utils.buildRoutesFixtures(this.app).then(fixtures => {
        this.routesFixtures = fixtures
        return Utils.loadFixtures(this.app)
      }),
      Utils.buildAdminFixtures(this.app)
    ])
  }
}

