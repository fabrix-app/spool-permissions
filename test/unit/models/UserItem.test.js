'use strict'
/* global describe, it */
const assert = require('assert')

describe('UserItem Model', () => {
  it('should exist', () => {
    assert(global.app.api.models['UserItem'])
  })
})
