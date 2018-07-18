import { FabrixApp } from '@fabrix/fabrix'
import { FabrixModel as Model } from '@fabrix/fabrix/dist/common'
import { SequelizeResolver } from '@fabrix/spool-sequelize'
import { merge } from 'lodash'
import { queryDefaults } from '../utils'

export interface User {
  resolveRoles(app: FabrixApp, options): any
}

export class UserResolver extends SequelizeResolver {
  findByIdDefault(criteria, options = {}) {
    options = merge(options, queryDefaults.User.default(this.app))
    return this.findById(criteria, options)
  }

  findOneDefault(options = {}) {
    options = merge(options, queryDefaults.User.default(this.app))
    return this.findOne(options)
  }
}

export class User extends Model {

  static config(app, Sequelize) {
    return {
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
    }
  }

  static schema(app, Sequelize) {
    return {}
  }

  public static get resolver () {
    return UserResolver
  }

  // If you need associations, put them here
  // More information about associations here: http://docs.sequelizejs.com/en/latest/docs/associations/
  public static associate(models) {
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

User.prototype.resolveRoles = function(app, options = {}) {
  if (
    this.roles
    && this.roles.every(t => t instanceof app.models['Role'].resolver.sequelizeModel)
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
