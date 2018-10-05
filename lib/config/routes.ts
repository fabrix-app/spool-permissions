import * as joi from 'joi'

export const routes = {
  '/roles': {
    'GET': 'RoleController.findAll',
    config: {
      prefix: 'permissions.prefix',
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.object()
        }
      },
      app: {
        permissions: {
          resource_name: 'apiGetRolesRoute',
          roles: ['admin']
        }
      }
    }
  },
  '/role/count': {
    'GET': 'RoleController.count',
    config: {
      prefix: 'permissions.prefix',
      app: {
        permissions: {
          resource_name: 'apiGetRoleCountRoute',
          roles: ['admin']
        }
      }
    }
  },
  '/role/generalStats': {
    'GET': 'RoleController.generalStats',
    config: {
      prefix: 'permissions.prefix',
      app: {
        permissions: {
          resource_name: 'apiGetRoleGeneralStatsRoute',
          roles: ['admin']
        }
      }
    }
  },
  '/role/name/:role': {
    'GET': 'RoleController.findOne',
    config: {
      prefix: 'permissions.prefix',
      validate: {
        params: {
          role: joi.any().required()
        }
      },
      app: {
        permissions: {
          resource_name: 'apiGetRoleNameRoleRoute',
          roles: ['admin']
        }
      }
    }
  },
  '/users': {
    'GET': 'UserController.findAll',
    config: {
      prefix: 'permissions.prefix',
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.object()
        }
      },
      app: {
        permissions: {
          resource_name: 'apiGetUsersRoute',
          roles: ['admin']
        }
      }
    }
  },
  '/user': {
    config: {
      prefix: 'permissions.prefix',
    },
    'PUT': {
      handler: 'UserController.update',
      config: {
        app: {
          permissions: {
            resource_name: 'apiPutUserRoute',
            roles: ['admin', 'registered']
          }
        }
      }
    },
    'POST': {
      handler: 'UserController.create',
      config: {
        app: {
          permissions: {
            resource_name: 'apiPostUserRoute',
            roles: ['admin']
          }
        }
      }
    }
  },
  '/user/:id': {
    config: {
      prefix: 'permissions.prefix',
    },
    'GET': {
      handler: 'UserController.findById',
      config: {
        validate: {
          params: {
            id: joi.any().required()
          }
        },
        app: {
          permissions: {
            resource_name: 'apiGetUserIdRoute',
            roles: ['admin']
          }
        }
      }
    },
    'POST': {
      handler: 'UserController.update',
      config: {
        validate: {
          params: {
            id: joi.alternatives().try(
              joi.number(),
              joi.string()
            ).required()
          }
        },
        app: {
          permissions: {
            resource_name: 'apiPostUserIdRoute',
            roles: ['admin', 'registered']
          }
        }
      }
    }
  },
  '/user/:id/roles': {
    'GET': 'UserController.roles',
    config: {
      prefix: 'permissions.prefix',
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        permissions: {
          resource_name: 'apiGetUserIdRolesRoute',
          roles: ['admin']
        }
      }
    }
  },
  '/user/:id/events': {
    'GET': 'UserController.events',
    config: {
      prefix: 'permissions.prefix',
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        permissions: {
          resource_name: 'apiGetUserIdEventsRoute',
          roles: ['admin']
        }
      }
    }
  },
  '/user/:id/addRole/:role': {
    'POST': 'UserController.addRole',
    config: {
      prefix: 'permissions.prefix',
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          role: joi.string().required()
        }
      },
      app: {
        permissions: {
          resource_name: 'apiPostUserIdAddRoleRoleRoute',
          roles: ['admin']
        }
      }
    }
  },
  '/user/:id/role/:role': {
    config: {
      prefix: 'permissions.prefix'
    },
    'POST': {
      handler: 'UserController.addRole',
      config: {
        validate: {
          params: {
            id: joi.alternatives().try(
              joi.number(),
              joi.string()
            ).required(),
            role: joi.string().required()
          }
        },
        app: {
          permissions: {
            resource_name: 'apiPostUserIdRoleRoleRoute',
            roles: ['admin']
          }
        }
      }
    },
    'DELETE': {
      handler: 'UserController.removeRole',
      config: {
        validate: {
          params: {
            id: joi.alternatives().try(
              joi.number(),
              joi.string()
            ).required(),
            role: joi.string().required()
          }
        },
        app: {
          permissions: {
            resource_name: 'apiDeleteUserIdRoleRoleRoute',
            roles: ['admin']
          }
        }
      }
    }
  },
  '/user/:id/removeRole/:role': {
    'POST': 'UserController.removeRole',
    config: {
      prefix: 'permissions.prefix',
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          role: joi.string().required()
        }
      },
      app: {
        permissions: {
          resource_name: 'apiPostUserIdRemoveRoleRoleRoute',
          roles: ['admin']
        }
      }
    }
  },
  '/user/:id/events/:event': {
    'GET': 'UserController.event',
    config: {
      prefix: 'permissions.prefix',
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          event: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        permissions: {
          resource_name: 'apiGetUserIdEventsEventRoute',
          roles: ['admin']
        }
      }
    }
  },
  '/user/count': {
    'GET': 'UserController.count',
    config: {
      prefix: 'permissions.prefix',
      app: {
        permissions: {
          resource_name: 'apiGetUserCountRoute',
          roles: ['admin']
        }
      }
    }
  },
  '/users/search': {
    'GET': 'UserController.search',
    config: {
      prefix: 'permissions.prefix',
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          term: joi.any()
        }
      },
      app: {
        permissions: {
          resource_name: 'apiGetUsersSearchRoute',
          roles: ['admin']
        }
      }
    }
  },
  '/user/generalStats': {
    'GET': 'UserController.generalStats',
    config: {
      prefix: 'permissions.prefix',
      app: {
        permissions: {
          resource_name: 'apiGetUserGeneralStatsRoute',
          roles: ['admin']
        }
      }
    }
  },
  '/users/upload/csv': {
    'POST': 'UserController.uploadCSV',
    config: {
      prefix: 'permissions.prefix',
      app: {
        permissions: {
          resource_name: 'apiPostUserUploadCsvRoute',
          roles: ['admin']
        }
      },
      pre: ['User.csv']
    }
  },
  '/users/upload/process/:uploadId': {
    'POST': 'UserController.processUpload',
    config: {
      prefix: 'permissions.prefix',
      validate: {
        params: {
          // this will only ever be a string
          uploadId: joi.string()
        }
      },
      app: {
        permissions: {
          resource_name: 'apiPostUserProcessUploadRoute',
          roles: ['admin']
        }
      }
    }
  }
}
