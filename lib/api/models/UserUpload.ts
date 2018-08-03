import { FabrixModel as Model } from '@fabrix/fabrix/dist/common'
import { SequelizeResolver } from '@fabrix/spool-sequelize'


export class UserUploadResolver extends SequelizeResolver {
  batch(options, batch) {
    const self = this

    options.limit = options.limit || 100
    options.offset = options.offset || 0

    const recursiveQuery = function(opts) {
      let count = 0
      return self.findAndCountAll(opts)
        .then(results => {
          count = results.count
          return batch(results.rows)
        })
        .then(batched => {
          if (count > opts.offset + opts.limit) {
            opts.offset = opts.offset + opts.limit
            return recursiveQuery(opts)
          }
          else {
            return batched
          }
        })
    }
    return recursiveQuery(options)
  }
}

/**
 * @module UserUpload
 * @description User Upload Model
 */
export class UserUpload extends Model {

  static config (app, Sequelize): {[key: string]: any} {
    return {
      // migrate: 'drop', // override default models configurations if needed
      // store: 'uploads',
      options: {
        underscored: true
      }
    }
  }

  static schema (app, Sequelize): {[key: string]: any} {
    return {
      // Upload ID
      upload_id: {
        type: Sequelize.STRING
      },
      username: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      // First Name
      first_name: {
        type: Sequelize.STRING
      },
      // Last Name
      last_name: {
        type: Sequelize.STRING
      },
      // 'Roles'
      roles: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        defaultValue: []
      }
    }
  }

  public static get resolver() {
    return UserUploadResolver
  }
}
