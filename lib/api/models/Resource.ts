import { FabrixModel as Model } from '@fabrix/fabrix/dist/common'
import { SequelizeResolver } from '@fabrix/spool-sequelize'

export class Resource extends Model {
  public static config(app, Sequelize): {[key: string]: any} {
    return {
      // More information about supported models options here : http://docs.sequelizejs.com/en/latest/docs/models-definition/#configuration
      options: {
        underscored: true
      }
    }
  }

  public static schema(app, Sequelize): {[key: string]: any} {
    return {
      type: {
        type: Sequelize.ENUM,
        values: ['model', 'controller', 'route', 'other'],
        defaultValue: 'other',
        allowNull: false
      },
      public_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
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
    models.Resource.hasMany(models.Permission, {
      as: 'permissions',
      onDelete: 'CASCADE',
      foreignKey: {
        name: 'resource_name',
        allowNull: false
      },
      constraints: false
    })
  }
}
