'use strict'
/* global describe, it */

const assert = require('assert')
const supertest = require('supertest')

describe('CheckPermissionsPolicy', () => {
  let request, agent, agentId

  before(done => {
    request = supertest('http://localhost:3000')
    agent = supertest.agent(global.app.spools.express.server)

    agent
      .post('/api/auth/local/register')
      .set('Accept', 'application/json') //set header for this test
      .send({username: 'jaumard', password: 'adminadmin', email: 'test@test.te'})
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.redirect, '/')
        assert.ok(res.body.user.id)
        agentId = res.body.user.id

        global.app.services.TapestryService.find('user', res.body.user.id).then(user => {
          return global.app.services.PermissionsService.addRoleToUser(user, 'test')
        }).then(user => done()).catch(done)
      })
  })

  it('should exist', () => {
    assert(global.app.api.policies['CheckPermissionsPolicy'])
    assert(global.app.policies['CheckPermissionsPolicy'])
  })

  describe('SuperAdmin', () => {
    it('should check that super admin exists', done => {
      global.app.services.TapestryService.find('user', {username: global.app.config.get('permissions.defaultAdminUsername')})
        .then(admins => {
          assert.equal(admins[0].username, global.app.config.get('permissions.defaultAdminUsername'))
          assert.equal(admins[0].roles[0].name, 'admin')
          done()
        })
        .catch(err => {
          done(err)
        })
    })
  })

  describe('CheckModelPermissions', () => {

    it('should check Model permissions on tapestries', () => {
      return global.app.services.PermissionsService.grant('test', 'apiGetRolesRoute', 'access')
        .then(perms => {
          return new Promise((resolve, reject) => {
            agent.get('/api/roles')
              .set('Accept', 'application/json') //set header for this test
              .expect(200)
              .end((err, res) => {
                if (err) {
                  return reject(err)
                }
                assert.equal(res.body.length, 5)
                resolve()
              })
          })
        })
    })

    it('should check Model permissions on tapestries', done => {
      agent.get('/api/resource')
        .set('Accept', 'application/json') //set header for this test
        .expect(403)
        .end((err, res) => {
          assert.equal(res.body.code, 'E_FORBIDDEN')
          assert.equal(res.body.message, 'You don\'t have permissions to access resource')
          done(err)
        })
    })

    it('should allow to retrieve Model with granted permissions on tapestries for non logged users', done => {
      request.get('/api/permission')
        .set('Accept', 'application/json') //set header for this test
        .expect(200)
        .end((err, res) => {
          assert.equal(res.body.length, 47)
          done(err)
        })
    })

    it('should not allow to retrieve Model with no permissions on tapestries for non logged users', done => {
      request.get('/api/resource')
        .set('Accept', 'application/json') //set header for this test
        .expect(403)
        .end((err, res) => {
          assert.equal(res.body.code, 'E_FORBIDDEN')
          assert.equal(res.body.message, 'You don\'t have permissions to access resource')
          done(err)
        })
    })
  })
  describe('CheckRoutePermissions', () => {
    it('should allow to access Route with granted permissions for non logged users', done => {
      request.get('/api/success/public/permissions')
        .expect(200)
        .end((err, res) => {
          done(err)
        })
    })

    it('should not allow to access Route with no permissions for non logged users', done => {
      request.get('/api/failure/public/permissions')
        .set('Accept', 'application/json') //set header for this test
        .expect(403)
        .end((err, res) => {
          assert.equal(res.body.code, 'E_FORBIDDEN')
          assert.equal(res.body.message, 'You don\'t have permissions to access /failure/public/permissions')
          done(err)
        })
    })

    it('should allow to access Route with granted permissions for logged users', done => {
      agent.get('/api/success/logged/permissions')
        .expect(200)
        .end((err, res) => {
          done(err)
        })
    })

    it('should not allow to access Route with no permissions for non logged users', done => {
      agent.get('/api/failure/logged/permissions')
        .set('Accept', 'application/json') //set header for this test
        .expect(403)
        .end((err, res) => {
          assert.equal(res.body.code, 'E_FORBIDDEN')
          assert.equal(res.body.message, 'You don\'t have permissions to access /failure/logged/permissions')
          done(err)
        })
    })
  })
  describe('CheckOwnersPermissions', () => {
    let adminAgent
    before(done => {
      adminAgent = supertest.agent(global.app.spools.express.server)

      adminAgent
        .post('/api/auth/local/register')
        .set('Accept', 'application/json') //set header for this test
        .send({username: 'anotheradmin', password: 'adminadmin', email: 'admin@admin.ad'})
        .expect(200)
        .end((err, res) => {
          assert.equal(res.body.redirect, '/')
          assert.ok(res.body.user.id)
          // console.log('THIS USER', res.body.user.id)
          global.app.services.TapestryService.find('user', res.body.user.id).then(user => {
            return global.app.services.PermissionsService.addRoleToUser(user, 'admin')
          }).then(user => {
            return global.app.services.TapestryService.create('item', {
              name: 'test'
            }).then(item => {
              return item.addOwner(agentId)
            }).then(item => {
              return global.app.services.TapestryService.create('item', {
                name: 'test'
              })
            }).then(() => done()).catch(done)
          })
        })
    })

    it('should allow to access to Model Item with owner permission and return only items for the owner', done => {
      agent.get('/api/item')
        .set('Accept', 'application/json') //set header for this test
        .expect(200)
        .end((err, res) => {
          console.log(res.body)
          assert.equal(res.body.length, 1)
          assert.equal(res.body[0].id, 1)
          assert.equal(res.body[0].name, 'test')
          done(err)
        })
    })

    it('should allow to access to all Model Item with no owner permission and return only items for the owner', done => {
      adminAgent.get('/api/item')
        .set('Accept', 'application/json') //set header for this test
        .expect(200)
        .end((err, res) => {
          assert.equal(res.body.length, 2)
          done(err)
        })
    })

    //TODO currrently Tapestries fails on setting updatedAt for underscored default models
    // it('should allow to update Model Item with owner permission', done => {
    //   agent.put('/api/item/1')
    //     .set('Accept', 'application/json') //set header for this test
    //     .send({
    //       name: 'testUpdated'
    //     })
    //     .expect(200)
    //     .end((err, res) => {
    //       assert.equal(res.body, 1)
    //       done(err)
    //     })
    // })
    it('should not allow to update Model Item with owner permission on another user', done => {
      adminAgent.put('/api/item/1')
        .set('Accept', 'application/json') //set header for this test
        .send({
          name: 'testUpdatedWrong'
        })
        .expect(403)
        .end((err, res) => {
          assert.equal(res.body.code, 'E_FORBIDDEN')
          assert.equal(res.body.message, 'You don\'t have permissions to update item:1')
          done(err)
        })
    })

    //TODO currently not working because sequelize doesn't support include in update/destroy
    it.skip('should allow to bulk update Model Item with owner permission', done => {
      agent.put('/api/item')
        .set('Accept', 'application/json') //set header for this test
        .send({
          name: 'testUpdatedWrong'
        })
        .expect(200)
        .end((err, res) => {
          assert.equal(res.body[0], 1) // Only one row affected
          done(err)
        })
    })

    //TODO currently not working because sequelize doesn't support include in update/destroy
    it.skip('should allow to bulk update Model Item with owner permission on another user', done => {
      adminAgent.put('/api/item')
        .set('Accept', 'application/json') //set header for this test
        .send({
          name: 'testUpdatedWrong'
        })
        .expect(200)
        .end((err, res) => {
          assert.equal(res.body[0], 0) // No row affected for admin
          done(err)
        })
    })
  })
})
