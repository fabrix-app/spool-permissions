import { FabrixModel as Model } from '@fabrix/fabrix/dist/common'
import { SequelizeResolver } from '@fabrix/spool-sequelize'

/**
 * @module UserRole
 * @description User Role
 */
export class UserRole extends Model {

  static config (app, Sequelize) {
    return {
      options: {
        underscored: true
      }
    }
  }

  static schema (app, Sequelize) {
    return {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        unique: 'user_role'
      },
      role_name: {
        type: Sequelize.STRING,
        unique: 'user_role'
      }
    }
  }

  public static get resolver () {
    return SequelizeResolver
  }
}
