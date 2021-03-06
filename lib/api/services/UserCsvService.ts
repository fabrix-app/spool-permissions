// tslint:disable no-console
import { FabrixService as Service } from '@fabrix/fabrix/dist/common'
import { Enums } from '../../enums'
import * as csvParser from 'papaparse'
import * as _ from 'lodash'
import * as shortid from 'shortid'
import { readFileSync } from 'fs'

/**
 * @module UserCsvService
 * @description User CSV Service
 */
export class UserCsvService extends Service {
  publish(type, event, options: {save?: boolean, transaction?: any, include?: any} = {}) {
    if (this.app.services.EventsService) {
      options.include = options.include ||  [{
        model: this.app.models.EventItem.instance,
        as: 'objects'
      }]
      return this.app.services.EventsService.publish(type, event, options)
    }
    this.app.log.debug('spool-events is not installed, please install it to use publish')
    return Promise.resolve()
  }

  /**
   *
   * @param file
   * @returns {Promise}
   */
  userCsv(file) {
    // TODO validate csv
    console.time('csv')
    const uploadID = shortid.generate()

    return new Promise((resolve, reject) => {
      const options = {
        header: true,
        dynamicTyping: true,
        step: (results, parser) => {
          parser.pause()
          return this.csvUserRow(results.data[0], uploadID)
            .then(row => {
              parser.resume()
            })
            .catch(err => {
              this.app.log.error(err)
              parser.resume()
            })
        },
        complete: (results, _file) => {
          console.timeEnd('csv')
          results.upload_id = uploadID
          this.app.models.UserUpload.count({ where: { upload_id: uploadID }})
            .then(count => {
              results.users = count
              // Publish the event
              this.publish('user_upload.complete', results)
              return resolve(results)
            })
            // TODO handle this more gracefully
            .catch(err => {
              return reject(err)
            })
        },
        error: (err, _file) => {
          return reject(err)
        }
      }
      const fileString = readFileSync(file, 'utf8')
      // Parse the CSV/TSV
      csvParser.parse(fileString, options)
    })
  }

  /**
   *
   * @param row
   * @param uploadID
   */
  csvUserRow(row, uploadID) {
    const UserUpload = this.app.models.UserUpload
    const values = Object.values(Enums.USER_UPLOAD)
    const keys = Object.keys(Enums.USER_UPLOAD)
    const upload = {
      upload_id: uploadID,
      options: {}
    }
    _.each(row, (data, key) => {
      if (data === '') {
        row[key] = null
      }
    })

    row = _.omitBy(row, _.isNil)

    if (_.isEmpty(row)) {
      return Promise.resolve({})
    }

    _.each(row, (data, key) => {
      if (data !== '') {
        const i = values.indexOf(key.replace(/^\s+|\s+$/g, ''))
        const k = keys[i]
        if (i > -1 && k) {
          if (k === 'roles') {
            upload[k] = data.split(',').map(role => { return role.trim()})
          }
          else {
            upload[k] = data
          }
        }
      }
    })


    const newUser = UserUpload.build(upload)
    return newUser.save()
  }

  /**
   *
   * @param uploadId
   * @returns {Promise}
   */
  processUserUpload(uploadId) {
    return new Promise((resolve, reject) => {
      const UserUpload = this.app.models.UserUpload
      const errors = []
      let usersTotal = 0, errorsTotal = 0
      UserUpload.batch({
        where: {
          upload_id: uploadId
        }
      }, users => {
        const Sequelize = this.app.models.User.datastore

        return Sequelize.Promise.mapSeries(users, user => {

          const create = {
            username: user.username,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name
            // roles: user.roles
          }
          return this.app.models['User'].create(create)
            .then(() => {
              usersTotal++
              return
            })
            .catch(err => {
              errorsTotal++
              errors.push(err.message)
              return
            })
        })
      })
        .then(results => {
          return UserUpload.destroy({where: {upload_id: uploadId }})
        })
        .then(destroyed => {
          const results = {
            upload_id: uploadId,
            users: usersTotal,
            errors_count: errorsTotal,
            errors: errors
          }
          this.publish('user_process.complete', results)
          return resolve(results)
        })
        .catch(err => {
          return reject(err)
        })
    })
  }
}

