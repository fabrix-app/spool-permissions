import { FabrixController as Controller } from '@fabrix/fabrix/dist/common'
import { NotFoundError } from '../../errors/NotFoundError'
import * as _ from 'lodash'

/**
 * @module UserController
 * @description Generated Fabrix.js Controller.
 */
export class UserController extends Controller {
  generalStats(req, res) {
    res.json({})
  }
  /**
   * count the amount of user
   * @param req
   * @param res
   */
  count(req, res) {
    this.app.models.User.count()
      .then(count => {
        const counts = {
          users: count
        }
        return res.json(counts)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
  findById(req, res) {
    const orm = this.app.models
    const User = orm['User']
    let id = req.params.id
    if (!id && req.user) {
      id = req.user.id
    }
    User.findById(id, {
      include: [
        {
          model: this.app.models['Passport'].resolver.sequelizeModel,
          as: 'passports'
        },
        {
          model: this.app.models['Role'].resolver.sequelizeModel,
          as: 'roles'
        },
        {
          model: this.app.models['Event'].resolver.sequelizeModel,
          as: 'events'
        }
      ],
      order: [
        [
          {
            model: this.app.models['Event'].resolver.sequelizeModel,
            as: 'events'
          },
          'created_at', 'DESC'
        ]
      ]
    })
      .then(user => {
        if (!user) {
          throw new NotFoundError(`User id ${id} not found`)
        }
        return this.app.services.PermissionsService.sanitizeResult(req, user)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  findAll(req, res) {
    const User = this.app.models['User']
    const limit = req.query.limit || 10
    const offset = req.query.offset || 0
    const sort = req.query.sort || [['created_at', 'DESC']]
    const where = req.jsonCriteria(req.query.where)

    User.findAndCountAll({
      order: sort,
      offset: offset,
      limit: limit,
      where: where,
      include: [
        {
          model: this.app.models['Role'].resolver.sequelizeModel,
          as: 'roles'
        }
      ]
    })
      .then(users => {
        res.paginate(users.count, limit, offset, sort)
        // return res.json(users.rows)
        return this.app.services.PermissionsService.sanitizeResult(req, users.rows)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  search(req, res) {
    const orm = this.app.models
    const User = orm['User']
    const limit = req.query.limit || 10
    const offset = req.query.offset || 0
    const sort = req.query.sort || [['created_at', 'DESC']]
    const term = req.query.term

    User.findAndCountAll({
      order: sort,
      offset: offset,
      limit: limit,
      where: {
        $or: [
          {
            email: {
              $iLike: `%${term}%`
            }
          },
          {
            username: {
              $iLike: `%${term}%`
            }
          }
          // {
          //   first_name: {
          //     $like: `%${term}%`
          //   }
          // },
          // {
          //   last_name: {
          //     $like: `%${term}%`
          //   }
          // }
        ]
      },
      include: [
        {
          model: this.app.models['Role'].resolver.sequelizeModel,
          as: 'roles'
        }
      ]
    })
      .then(users => {
        res.paginate(users.count, limit, offset, sort)
        return this.app.services.PermissionsService.sanitizeResult(req, users.rows)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  create(req, res) {

    this.app.models['User'].create(req.body)
      .then(user => {
        return this.app.services.PermissionsService.sanitizeResult(req, user)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
  /**
   *
   * @param req
   * @param res
   */
  update(req, res) {
    // const UserService = this.app.services.UserService
    let id = req.params.id
    if (!id && req.user) {
      id = req.user.id
    }
    // console.log('this user',id, req.user)
    this.app.models['User'].findById(id)
      .then(user => {

        if (!user) {
          // TODO not found error
          throw new NotFoundError(`User ${id} not found`)
        }
        user = _.extend(user, req.body)
        return user.save()
      })
      .then(user => {
        return this.app.services.PermissionsService.sanitizeResult(req, user)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
  /**
   * upload CSV
   * @param req
   * @param res
   */
  uploadCSV(req, res) {
    const UserCsvService = this.app.services.UserCsvService
    const csv = req.file

    if (!csv) {
      const err = new Error('File failed to upload')
      return res.serverError(err)
    }

    UserCsvService.userCsv(csv.path)
      .then(result => {
        return res.json({
          file: req.file,
          result: result
        })
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  processUpload(req, res) {
    console.log('BROKE!', req.params.id)
    const UserCsvService = this.app.services.UserCsvService
    UserCsvService.processUserUpload(req.params.id)
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
  /**
   *
   * @param req
   * @param res
   */
  exportUsers(req, res) {
    //
  }

  /**
   *
   * @param req
   * @param res
   */
  roles(req, res) {
    // const Role = this.app.models['Role']
    let userId = req.params.id

    if (!userId && !req.user) {
      const err = new Error('A user id and a user in session are required')
      return res.send(401, err)
    }
    if (!userId) {
      userId = req.user.id
    }

    const orm = this.app.models
    const Role = orm['Role']
    const limit = req.query.limit || 10
    const offset = req.query.offset || 0
    const sort = req.query.sort || [['created_at', 'DESC']]

    Role.findAndCountAll({
      order: sort,
      offset: offset,
      limit: limit,
      where: {
        '$users.id$': userId,
      },
      include: [
        {
          model: this.app.models['User'].resolver.sequelizeModel,
          as: 'users',
          attributes: ['id'],
          duplicating: false
        }
      ]
    })
      .then(roles => {
        res.paginate(roles.count, limit, offset, sort)
        return this.app.services.PermissionsService.sanitizeResult(req, roles.rows)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  addRole(req, res) {
    this.app.services.PermissionsService.addRoleToUser(req.params.id, req.params.role)
      .then(user => {
        return this.app.services.PermissionsService.sanitizeResult(req, user)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  removeRole(req, res) {
    this.app.services.PermissionsService.removeRoleFromUser(req.params.id, req.params.role)
      .then(user => {
        return this.app.services.PermissionsService.sanitizeResult(req, user)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  event(req, res) {
    const Event = this.app.models['Event']
    const eventId = req.params.event
    const userId = req.params.id

    if (!userId || !eventId || !req.user) {
      const err = new Error('A user id and a user in session are required')
      res.send(401, err)

    }
    Event.findById(eventId)
      .then(event => {
        return this.app.services.PermissionsService.sanitizeResult(req, event)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  events(req, res) {
    const Event = this.app.models['Event']
    const userId = req.params.id

    if (!userId && !req.user) {
      const err = new Error('A user id and a user in session are required')
      return res.send(401, err)
    }

    const limit = req.query.limit || 10
    const offset = req.query.offset || 0
    const sort = req.query.sort || [['created_at', 'DESC']]

    Event.findAndCountAll({
      order: sort,
      where: {
        object_id: userId,
        object: 'user'
      },
      offset: offset,
      limit: limit
    })
      .then(events => {
        res.paginate(events.count, limit, offset, sort)
        return this.app.services.PermissionsService.sanitizeResult(req, events.rows)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
}

