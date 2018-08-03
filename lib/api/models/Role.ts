import { FabrixModel as Model } from '@fabrix/fabrix/dist/common'
import { SequelizeResolver } from '@fabrix/spool-sequelize'

export class Role extends Model {
  static config(app, Sequelize): {[key: string]: any} {
    return {
      options: {
        underscored: true
      }
    }
  }

  static schema(app, Sequelize): {[key: string]: any} {
    return {
      name: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
      },
      public_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true
      }
    }
  }

  public static get resolver () {
    return SequelizeResolver
  }

  public static associate(models) {
    models.Role.hasMany(models.Permission, {
      as: 'permissions',
      onDelete: 'CASCADE',
      foreignKey: {
        name: 'role_name',
        allowNull: false
      },
      constraints: false
    })
    models.Role.belongsToMany(models.User, {
      as: 'users',
      through: {
        model: models.UserRole
      },
      foreignKey: 'role_name',
      // constraints: false
    })
  }
}
