'use strict'
const _ = require('lodash')
const smokesignals = require('smokesignals')
const fs = require('fs')
const ModelPassport = require('@fabrix/spool-passport/dist/api/models').User
const ModelPermissions = require('../../dist/api/models/User').User
const Model = require('@fabrix/fabrix/dist/common').FabrixModel
const Controller = require('@fabrix/fabrix/dist/common').FabrixController
const SequelizeResolver = require('@fabrix/spool-sequelize').SequelizeResolver

const DIALECT = process.env.DIALECT || 'postgres'

const stores = {
  sqlitedev: {
    orm: 'sequelize',
    database: 'Sequelize',
    storage: './test/test.sqlite',
    host: '127.0.0.1',
    dialect: 'sqlite',
    migrate: 'drop'
  },
  uploads: {
    orm: 'sequelize',
    database: 'Sequelize',
    storage: './test/test.uploads.sqlite',
    host: '127.0.0.1',
    dialect: 'sqlite',
    migrate: 'drop'
  }
}

if (DIALECT === 'postgres') {
  stores.sqlitedev = {
    orm: 'sequelize',
    database: 'Sequelize',
    host: '127.0.0.1',
    dialect: 'postgres',
    migrate: 'drop'
  }
  stores.uploads = {
    orm: 'sequelize',
    database: 'Sequelize',
    host: '127.0.0.1',
    dialect: 'postgres',
    migrate: 'drop'
  }
}
else {
  stores.sqlitedev = {
    orm: 'sequelize',
    database: 'Sequelize',
    storage: './test/test.sqlite',
    host: '127.0.0.1',
    dialect: 'sqlite',
    migrate: 'drop'
  }
  stores.uploads = {
    orm: 'sequelize',
    database: 'Sequelize',
    storage: './test/test.uploads.sqlite',
    host: '127.0.0.1',
    dialect: 'sqlite',
    migrate: 'drop'
  }
}

const App = {
  pkg: {
    name: 'spool-permission-test',
    version: '1.0.0'
  },
  api: {
    controllers: {
      TestController: class TestController extends Controller {
        success(req, res){
          res.status(200).end()
        }
        failure(req, res){
          res.status(400).end()
        }
      }
    },
    models: {
      User: class User extends ModelPermissions {
        static config(app, Sequelize) {
          return _.defaultsDeep({}, ModelPermissions.config(app, Sequelize), {
            options: {
              underscored: true
            }
          })
        }

        static associate(models) {
          // ModelPassport.associate(models)
          ModelPermissions.associate(models)
          models.User.belongsToMany(models.Item, {
            as: 'items',
            through: {
              model: models.UserItem,
              foreignKey: 'user_id'
            },
            constraints: false
          })
        }
      },
      Item: class Item extends Model {
        static config(app, Sequelize) {
          return {
            options: {
              underscored: true,
              classMethods: {

              }
            }
          }
        }
        static schema(app, Sequelize) {
          return {
            name: {
              type: Sequelize.STRING,
              allowNull: false
            }
          }
        }
        static get resolver() {
          return SequelizeResolver
        }

        static associate(models) {
          models.Item.belongsToMany(models.User, {
            as: 'owners',
            through: {
              model: models.UserItem,
              foreignKey: 'item_id',
              scope: {
                item: 'item'
              }
            },
            constraints: false
          })
        }
      }
    }
  },
  config: {
    router: {
      prefix: '/api'
    },
    stores: stores,
    models: {
      defaultStore: 'sqlitedev',
      migrate: 'drop'
    },
    passport: {
      strategies: {
        //Enable local strategy
        local: {
          strategy: require('passport-local').Strategy,
          options: {
            usernameField: 'username'// If you want to enable both username and email just remove this field
          }
        }
      },
      onUserLogin: {
        user: (req, app, user) => {
          return Promise.resolve(user)
        }
      }
    },
    routes: {
      '/success/public/permissions': {
        'GET': 'TestController.success',
        config: {
          app: {
            permissions: {
              resource_name: 'successRoute',
              roles: ['public']
            }
          }
        }
      },
      '/failure/public/permissions': {
        'GET': 'TestController.failure',
        config: {
          app: {
            permissions: {
              resource_name: 'failureRoute',
              roles: ['test']
            }
          }
        }
      },
      '/success/logged/permissions': {
        'GET': 'TestController.success',
        config: {
          app: {
            permissions: {
              resource_name: 'successLoggedRoute',
              roles: ['test']
            }
          }
        }
      },
      '/failure/logged/permissions': {
        'GET': 'TestController.failure',
        config: {
          app: {
            permissions: {
              resource_name: 'failureLoggedRoute',
              roles: ['admin']
            }
          }
        }
      }
    },
    permissions: {
      defaultRole: 'public',
      defaultRegisteredRole: 'registered',
      modelsAsResources: true,
      fixtures: {
        roles: [{
          name: 'test',
          public_name: 'test'
        }, {
          name: 'admin',
          public_name: 'Admin'
        }, {
          name: 'registered',
          public_name: 'Registered'
        },{
          name: 'public' ,
          public_name: 'Public'
        }],
        resources: [{
          type: 'route',
          name: 'fixture',
          public_name: 'fixture'
        }],
        permissions: [{
          role_name: 'test',
          resource_name: 'fixture',
          action: 'action'
        }, {
          role_name: 'test',
          relation: 'owner',
          resource_name: 'item',
          action: 'access'
        }, {
          role_name: 'test',
          relation: 'owner',
          resource_name: 'item',
          action: 'create'
        }, {
          role_name: 'test',
          relation: 'owner',
          resource_name: 'item',
          action: 'update'
        }, {
          role_name: 'test',
          relation: 'owner',
          resource_name: 'item',
          action: 'destroy'
        }, {
          role_name: 'admin',
          resource_name: 'item',
          action: 'access'
        }, {
          role_name: 'admin',
          relation: 'owner',
          resource_name: 'item',
          action: 'create'
        }, {
          role_name: 'admin',
          relation: 'owner',
          resource_name: 'item',
          action: 'update'
        }, {
          role_name: 'admin',
          relation: 'owner',
          resource_name: 'item',
          action: 'destroy'
        }, {
          role_name: 'admin',
          resource_name: 'user',
          action: 'create'
        }, {
          role_name: 'admin',
          resource_name: 'user',
          action: 'update'
        }, {
          role_name: 'admin',
          resource_name: 'user',
          action: 'destroy'
        }]
      }
    },
    tapestries: {
      controllers: {
        ignore: ['UserController', 'RoleController', 'AuthController', 'EventController']
      }
    },
    policies: {
      '*': {
        '*': ['CheckPermissions.checkRoute']
      },
      'TapestryController': {
        '*': {
          '*': ['CheckPermissions.checkModel']
        }
      }
    },
    main: {
      spools: [
        require('@fabrix/spool-router').RouterSpool,
        require('@fabrix/spool-tapestries').TapestriesSpool,
        require('@fabrix/spool-express').ExpressSpool,
        require('@fabrix/spool-sequelize').SequelizeSpool,
        require('@fabrix/spool-passport').PassportSpool,
        require('../../dist/index').PermissionsSpool // spool
      ]
    },
    session: {
      secret: 'ok'
    },
    engine: {
      live_mode: false,
      profile: 'test'
    },
    web: {
      express: require('express'),
      middlewares: {
        order: [
          'addMethods',
          'cookieParser',
          'session',
          'passportInit',
          'passportSession',
          'bodyParser',
          'compression',
          'methodOverride',
          'www',
          'router'
        ]
      }
    }
  }
}

const dbPath = __dirname + './test.sqlite'
const dbUploadPath = __dirname + './test.uploads.sqlite'
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath)
}

if (fs.existsSync(dbUploadPath)) {
  fs.unlinkSync(dbUploadPath)
}

_.defaultsDeep(App, smokesignals.FailsafeConfig)
module.exports = App
