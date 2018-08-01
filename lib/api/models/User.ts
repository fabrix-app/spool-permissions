import { FabrixApp } from '@fabrix/fabrix'
import {
  User as PassportUser,
  UserResolver as PassportUserResolver
} from '@fabrix/spool-passport/dist/api/models/User'
import { merge, defaultsDeep } from 'lodash'
import { queryDefaults } from '../utils'

export class UserResolver extends PassportUserResolver {
  findByIdDefault(criteria, options = {}) {
    options = merge(options, queryDefaults.User.default(this.app))
    return this.findById(criteria, options)
  }

  findOneDefault(options = {}) {
    options = merge(options, queryDefaults.User.default(this.app))
    return this.findOne(options)
  }
}

export class User extends PassportUser {

  static config(app, Sequelize) {
    return defaultsDeep(PassportUser.config, {
      options: {
        underscored: true,
        hooks: {
          afterCreate: [
            (values, options) => {
              return app.services.PermissionsService.addRoleToUser(
                values,
                app.config.get('permissions.defaultRegisteredRole'),
                options
              )
            }
          ]
        }
      }
    })
  }

  public static get resolver () {
    return UserResolver
  }

  // If you need associations, put them here
  // More information about associations here: http://docs.sequelizejs.com/en/latest/docs/associations/
  public static associate(models) {
    PassportUser.associate(models)
    models.User.belongsToMany(models.Role, {
      as: 'roles',
      through: {
        model: models.UserRole,
      },
      foreignKey: 'user_id'
      // constraints: false
    })
    if (models.Event) {
      models.User.hasMany(models.Event, {
        as: 'events',
        foreignKey: 'object_id',
        scope: {
          object: 'user'
        },
        constraints: false
      })
    }
  }

}

export interface User {
  resolveRoles(options): any
}

/**
 *
 */
User.prototype.resolveRoles = function(options = {}) {
  if (
    this.roles
    && this.roles.every(t => t instanceof this.app.models['Role'].instance)
    && options.reload !== true
  ) {
    return Promise.resolve(this)
  }
  else {
    return this.getRoles({transaction: options.transaction || null})
      .then(roles => {
        roles = roles || []
        this.roles = roles
        this.setDataValue('roles', roles)
        this.set('roles', roles)
        return this
      })
  }
}
