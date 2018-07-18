import { FabrixController as Controller } from '@fabrix/fabrix/dist/common'
import { NotFoundError } from '../../errors/NotFoundError'

/**
 * @module RoleController
 * @description Generated Fabrix.js Controller.
 */
export class RoleController extends Controller {
  /**
   *
   * @param req
   * @param res
   */
  generalStats(req, res) {
    res.json({})
  }

  /**
   *
   * @param req
   * @param res
   */
  count(req, res) {
    this.app.models.Role.count()
      .then(count => {
        const counts = {
          carts: count
        }
        return res.json(counts)
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
  findOne(req, res) {
    const orm = this.app.models
    const Role = orm['Role']
    const role = req.params.role

    Role.findOne({
      where: {
        name: role
      }
    })
      .then(_role => {
        if (!_role) {
          throw new NotFoundError(Error(`Role name '${ _role }' not found`))
        }
        return this.app.services.PermissionsService.sanitizeResult(req, _role)
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
    const orm = this.app.models
    const Role = orm['Role']
    const limit = req.query.limit || 10
    const offset = req.query.offset || 0
    const sort = req.query.sort || [['created_at', 'DESC']]
    const where = req.jsonCriteria(req.query.where)

    Role.findAndCountAll({
      order: sort,
      offset: offset,
      limit: limit,
      where: where
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
}

