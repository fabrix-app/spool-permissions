import { FabrixModel as Model } from '@fabrix/fabrix/dist/common'
import { SequelizeResolver } from '@fabrix/spool-sequelize'

export class Permission extends Model {
  static config(app, Sequelize) {
    return {
      options: {
        underscored: true
      }
    }
  }

  static schema(app, Sequelize) {
    return {
      action: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true
      },
      relation: {
        type: Sequelize.ENUM,
        values: ['owner', 'owners']
      }
    }
  }

  public static get resolver () {
    return SequelizeResolver
  }

  public static associate(models) {
    models.Permission.belongsTo(models.Role, {
      as: 'role',
      onDelete: 'CASCADE',
      // foreignKey: 'role_name',
      foreignKey: {
        primaryKey: true,
        name: 'role_name',
        allowNull: false
      },
      constraints: false
    })
    models.Permission.belongsTo(models.Resource, {
      as: 'resource',
      onDelete: 'CASCADE',
      // foreignKey: 'resource_name',
      foreignKey: {
        primaryKey: true,
        name: 'resource_name',
        allowNull: false
      },
      constraints: false
    })
  }
}
