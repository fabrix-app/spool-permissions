import { get, isString } from 'lodash'
import { Utils as RouterUtils } from '@fabrix/spool-router'

export const Utils = {
  /**
   *
   * @param app
   * @returns {Promise.<{resources: Array, permissions: Array}>}
   */
  buildRoutesFixtures: app => {
    const fixtures = {
      resources: [],
      permissions: []
    }
    app.routes.forEach((route, path) => {
      // const route = app.routes[path]
      const routeMethods = Object.keys(route).filter(value => -1 !== RouterUtils.methods.indexOf(value))

      routeMethods.forEach(method => {
        const config = get(route[method].config, 'app.permissions')
        if (config && config.roles && config.resource_name) {
          if (isString(config.roles)) {
            config.roles = [config.roles]
          }
          fixtures.resources.push({
            type: 'route',
            name: config.resource_name,
            public_name: config.resource_name
          })
          config.roles.forEach(role => {
            fixtures.permissions.push({
              resource_name: config.resource_name,
              role_name: role,
              action: 'access'
            })
          })
        }
      })
    })
    // app.log.debug('utils.buildRoutesFixtures', fixtures)
    return Promise.resolve(fixtures)
  },

  loadFixtures: app => {
    return Promise.all([
      app.models['Role'].findAll({limit: 1}).then(roles => {
        if (!roles || roles.length === 0) {
          app.log.debug('utils.loadFixtures: Roles empty, loadRoles...')
          return Utils.loadRoles(app)
        }
      }),
      app.models['Resource'].findAll({limit: 1}).then(resources => {
        if (!resources || resources.length === 0) {
          app.log.debug('utils.loadFixtures: Resources empty, loadResources...')
          return Utils.loadResources(app)
        }
      })
    ]).then(results => {
      return app.models['Permission'].findAll({limit: 1}).then(permissions => {
        if (!permissions || permissions.length === 0) {
          app.log.debug('utils.loadFixtures: Permissions empty, loadPermissions...')
          return Utils.loadPermissions(app)
        }
      })
    })
  },

  /**
   *
   * @param app
   * @returns {*}
   */
  loadRoles: app => {
    const roles = app.config.get('permissions.fixtures.roles')
    if (roles.length > 0) {
      return app.models.Role.bulkCreate(roles)
    }
  },

  /**
   *
   * @param app
   * @returns {Promise.<T>}
   */
  loadResources: app => {
    let resources = app.config.get('permissions.fixtures.resources')
      .concat(app.spools['permissions'].routesFixtures.resources)
    if (app.config.get('permissions.modelsAsResources')) {
      const models = []
      Object.keys(app.models).forEach(modelName => {
        models.push({
          type: 'model',
          name: modelName.toLowerCase(),
          public_name: modelName
        })
      })
      resources = resources.concat(models)
    }
    if (resources.length > 0) {
      app.log.debug('utils.loadResources bulkCreate()')
      return app.models.Resource.bulkCreate(resources)
        .catch(err => {
          app.log.error(err)
        })
    }
  },

  /**
   *
   * @param app
   * @returns {*}
   */
  loadPermissions: app => {
    const permissions = app.config.get('permissions.fixtures.permissions')
      .concat(app.spools['permissions'].routesFixtures.permissions)
    if (permissions.length > 0) {
      app.log.debug('utils.loadPermissions bulkCreate()')
      return app.models['Permission'].bulkCreate(permissions)
    }
  },

  buildAdminFixtures: app => {
    return app.models['User'].findAll({limit: 1, attributes: ['id']}).then(users => {
      if (!users || users.length === 0) {
        app.log.debug('utils.loadFixtures: Users empty, loadAdmin...')
        return Utils.loadAdmin(app)
      }
    })
  },
  loadAdmin: app => {
    return app.services.PassportService.register(null, {
      username: app.config.get('permissions.defaultAdminUsername'),
      password: app.config.get('permissions.defaultAdminPassword')
    })
      .then(admin => {
        return app.services.PermissionsService.addRoleToUser(admin, 'admin')
      })
  }
}
