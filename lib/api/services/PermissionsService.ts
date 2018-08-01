import { FabrixService as Service } from '@fabrix/fabrix/dist/common'

export class PermissionsService extends Service {
  publish(type, event, options: {save?: boolean, transaction?: any} = {}) {
    if (this.app.services.EngineService) {
      return this.app.services.EngineService.publish(type, event, options)
    }
    this.app.log.debug('Spool-engine is not installed, please install it to use publish')
    return Promise.resolve()
  }

  /**
   *
   * @param roleName
   * @param options
   * @returns {Promise.<T>|*}
   */
  findRole(roleName, options: {[key: string]: any} = {}) {
    return this.app.models['Role']
      .findOne({
        where: {
          name: roleName
        },
        transaction: options.transaction || null
      })
  }

  /**
   *
   * @param resourceName
   * @param options
   * @returns {Promise.<T>|*}
   */
  findResource(resourceName, options: {[key: string]: any} = {}) {
    return this.app.models['Resource']
      .findOne({
        where: {
          name: resourceName
        },
        transaction: options.transaction || null
      })
  }

  /**
   *
   * @param roleName
   * @param resourceName
   * @param actionName
   * @param relation
   * @param options
   * @returns {permission}
   */
  grant(roleName, resourceName, actionName, relation, options: {[key: string]: any} = {}) {
    return this.app.models['Permission']
      .create({
        role_name: roleName,
        resource_name: resourceName,
        action: actionName,
        relation: relation || null
      }, {
        transaction: options.transaction || null
      })
  }

  /**
   *
   * @param roleName
   * @param resourceName
   * @param actionName
   * @param options
   * @returns {*}
   */
  revoke(roleName, resourceName, actionName, options: {[key: string]: any} = {}) {
    return this.app.models['Permission'].destroy({
      where: {
        role_name: roleName,
        resource_name: resourceName,
        action: actionName
      },
      transaction: options.transaction || null
    })
  }

  /**
   *
   * @param roleName
   * @param resourceName
   * @param actionName
   * @param options
   * @returns {T|*}
   */
  isAllowed(roleName, resourceName, actionName, options: {[key: string]: any} = {}) {
    return this.app.models['Permission'].findOne({
      where: {
        role_name: roleName,
        resource_name: resourceName,
        action: actionName
      },
      transaction: options.transaction || null
    })
  }

  /**
   *
   * @param user
   * @param resourceName
   * @param actionName
   * @param options
   * @returns {Promise.<TResult>|*}
   */
  isUserAllowed(reqUser, resourceName, actionName, options: {[key: string]: any} = {}) {
    // _.get(this.app.config, 'permissions.userRoleFieldName', 'roles')
    return this.app.models['User'].resolve(reqUser, {transaction: options.transaction || null})
      .then(user => {
        return user.getRoles({transaction: options.transaction || null})
      })
      .then(roles => {
        const promises = []
        roles.forEach(role => {
          promises.push(this.isAllowed(role.name, resourceName, actionName, options))
        })
        return Promise.all(promises).then(permissions => {
          const perms = []
          permissions.forEach(perm => {
            if (perm != null) {
              perms.push(perm)
            }
          })
          return Promise.resolve(perms)
        })
      })
  }

  /**
   * Add Role to User
   */
  addRoleToUser(reqUser, roleName, options: {[key: string]: any} = {}) {
    const User = this.app.models['User']
    let resUser
    return User.resolve(reqUser, { transaction: options.transaction || null })
      .then(user => {
        resUser = user
        return resUser.resolveRoles({transaction: options.transaction || null})
      })
      .then(() => {
        return resUser.hasRole(roleName, {transaction: options.transaction || null})
      })
      .then(hasRole => {
        if (!hasRole) {
          return resUser.addRole(roleName, {transaction: options.transaction || null})
            .then(() => resUser.getRoles({transaction: options.transaction || null}))
        }
        return resUser.roles
      })
      .then(roles => {
        resUser.roles = roles
        resUser.setDataValue('roles', roles)
        resUser.set('roles', roles)
        return resUser
      })
  }

  /**
   * Remove Role From User
   */
  removeRoleFromUser(reqUser, roleName, options: {[key: string]: any} = {}) {
    const User = this.app.models['User']
    let resUser
    return User.resolve(reqUser, { transaction: options.transaction || null })
      .then(user => {
        resUser = user
        return resUser.resolveRoles({transaction: options.transaction || null})
      })
      .then(() => {
        return resUser.hasRole(roleName, {transaction: options.transaction || null})
      })
      .then(hasRole => {
        if (hasRole) {
          return resUser.removeRole(roleName, {transaction: options.transaction || null})
            .then(() => resUser.getRoles({transaction: options.transaction || null}))
        }
        return resUser.roles
      })
      .then(roles => {
        resUser.roles = roles
        resUser.setDataValue('roles', roles)
        resUser.set('roles', roles)
        return resUser
      })
  }

  /**
   * Roles attached to the request
   */
  reqRoles(req, options: {[key: string]: any} = {}) {
    if (req.user) {
      let resUser
      return this.app.models['User'].resolve(req.user, {transaction: options.transaction || null})
        .then(user => {
          resUser = user
          return resUser.resolveRoles({transaction: options.transaction || null})
        })
        .then(() => {
          return resUser.roles.map(r => r.name)
        })
    }
    else {
      return Promise.resolve(['public'])
    }
  }

  /**
   * Sanatize a response by role
   */
  sanitizeResult(req, result) {
    return this.reqRoles(req)
      .then((roles) => {
        return result
      })
  }
}
