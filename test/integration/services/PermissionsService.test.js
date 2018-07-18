'use strict'
/* global describe, it */

const assert = require('assert')

describe('PermissionsService', () => {
  it('should exist', () => {
    assert(global.app.api.services['PermissionsService'])
    assert(global.app.services['PermissionsService'])
  })

  it('should return Role based on name', () => {
    return global.app.services.PermissionsService.findRole('admin')
      .then(role => {
        assert.equal(role.name, 'admin')
      })
  })

  it('should return Resource based on name', () => {
    return global.app.services.PermissionsService.findResource('res1')
      .then(resource => {
        assert.equal(resource.name, 'res1')
      })
  })

  it('should grant permission by name', () => {
    return global.app.services.PermissionsService.grant('admin', 'res3', 'destroy')
      .then(permission => {
        assert.equal(permission.role_name, 'admin')
        assert.equal(permission.resource_name, 'res3')
        assert.equal(permission.action, 'destroy')
      })
  })

  it('should return permission on check permission', () => {
    return global.app.services.PermissionsService.isAllowed('admin', 'res3', 'destroy')
      .then(permission => {
        assert.equal(permission.role_name, 'admin')
        assert.equal(permission.resource_name, 'res3')
        assert.equal(permission.action, 'destroy')
      })
  })

  it('should revoke permission by name', () => {
    return global.app.services.PermissionsService.revoke('admin', 'res3', 'destroy')
      .then(_ => {
        return global.app.services.PermissionsService.isAllowed('admin', 'res3', 'destroy').then(result => {
          assert(!result)//not allowed
        })
      })
  })
})
