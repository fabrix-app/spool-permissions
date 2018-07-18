'use strict'
/* global describe, it */

const assert = require('assert')

describe('Permission', () => {
  it('should exist', () => {
    assert(global.app.api.models['Permission'])
    assert(global.app.orm['Permission'])
  })
  it('should add Permissions', () => {

    return global.app.orm.Permission.bulkCreate([{
      role_name: 'admin',
      resource_name: 'res1',
      action: 'create'
    }, {
      role_name: 'user',
      resource_name: 'res1',
      action: 'create'
    }, {
      role_name: 'public',
      resource_name: 'res3',
      action: 'access'
    }, {
      role_name: 'public',
      resource_name: 'permission',
      action: 'access'
    }]).then(permissions => {
      assert.equal(permissions.length, 4)
      assert.equal(permissions[0].role_name, 'admin')
      assert.equal(permissions[0].resource_name, 'res1')
      assert.equal(permissions[0].action, 'create')
      assert.equal(permissions[1].role_name, 'user')
      assert.equal(permissions[1].resource_name, 'res1')
      assert.equal(permissions[1].action, 'create')
      assert.equal(permissions[2].role_name, 'public')
      assert.equal(permissions[2].resource_name, 'res3')
      assert.equal(permissions[2].action, 'access')
      assert.equal(permissions[3].role_name, 'public')
      assert.equal(permissions[3].resource_name, 'permission')
      assert.equal(permissions[3].action, 'access')
    })
  })
})
