# spool-permission

[![Gitter][gitter-image]][gitter-url]
[![NPM version][npm-image]][npm-url]
[![Build Status][ci-image]][ci-url]
[![Test Coverage][coverage-image]][coverage-url]
[![Dependency Status][daviddm-image]][daviddm-url]
[![Follow @FabrixApp on Twitter][twitter-image]][twitter-url]


## Permissions built for speed, security, and scalability

The Permissions spool is built to be used on Fabrix.
It's purpose is to allow for complex ERP style permissions down to the model level as well as restrict routes based on permissions.

## Dependencies
### Supported ORMs
| Repo          |  Build Status (edge)                  |
|---------------|---------------------------------------|
| [spool-sequelize](https://github.com/fabrix-app/spool-sequelize) | [![Build status][ci-sequelize-image]][ci-sequelize-url] |

### Supported Webserver
| Repo          |  Build Status (edge)                  |
|---------------|---------------------------------------|
| [spool-express](https://github.com/fabrix-app/spool-express) | [![Build status][ci-express-image]][ci-express-url] |

## Install

```sh
$ npm install --save spool-permission
```

## Configuration

First you need to add this spool to your __main__ configuration : 
```js
// config/main.ts

export const main = {
   // ...

   spools: [
      // ...
      require('@fabirx/spool-permission').PermissionsSpool,
      // ...
   ]
   // ...
}
```

Then permissions config:  
```js
// config/permissions.ts
export const permissions = {
  //Role name to use for anonymous users
  defaultRole: 'public',
  //Role name to add to users on create
  defaultRegisteredRole: 'registered',
  // Name of the association field for Role under User model
  userRoleFieldName: 'roles',
  // add all models as resources in database on initialization
  modelsAsResources: true,
  // Initial data added when DB is empty
  fixtures: {
    roles: [],
    resources: [],
    permissions: []
  },
  // The default super admin username
  defaultAdminUsername: 'admin',
  // The default super admin password
  defaultAdminPassword: 'admin1234'
}
```

You also need to have a User model like: 

```js
import { User as PermissionsUser } from '@fabrix/spool-permissions/dist/models'
import { defaults, defaultsDeep } from 'lodash'

class User extends PermissionsUser {
  static config(app, Sequelize) {
    return defaultsDeep(PermissionsUser.config, {
      options: {
        // your options
      }
    })
  }
  static schema(app, Sequelize) {
    return defaults(PermissionsUser.schema, {
     // your schema
    })
  }
  static associate(models) {
    PermissionsUser.associate(models)
    // your associations
  }
}
```

## Usage

### Default Admin
When your applications starts, if there are no users in your database, permission will create a super admin using your defaults

### Manage roles
Use the native sequelize model under `this.app.models.Roles`, if you need initial roles just add them on permissions config file under `fixtures.roles`.

### Manage resources
Use the native sequelize model under `this.app.models.Resources`, if you need initial resources just add them on permissions config file under `fixtures.resources`.

### Manage model permissions
#### Static declaration under config
```js
//config/permissions.ts
export const permissions = {
// ...  

fixtures: {
    roles: [{
      name: 'role_name',
      public_name: 'Role name'
    }],
    resources: [{
      type: 'model',
      name: 'modelName',
      public_name: 'Model name'
    }],
    permissions: [{
       role_name: 'role_name',
       resourceName: 'modelName',
       action: 'create'
     }, {
       role_name: 'role_name',
       resourceName: 'modelName',
       action: 'update'
     }, {
       role_name: 'role_name',
       resourceName: 'modelName',
       action: 'destroy'
     }, {
       role_name: 'role_name',
       resourceName: 'modelName',
       action: 'access'
     }]
  }
}
```

#### Owner permissions
This spool can manage owner permissions on model instance, to do this you need to declare your permissions like this : 
```
{
  roleName: 'roleName',
  relation: 'owner',
  resourceName: 'modelName',
  action: 'create'
}
```
You can create this permissions with sequelize model, with fixtures options or with PermissionsService like this:
 
```js
this.app.services.PermissionsService.grant('roleName', 'modelName', 'create', 'owner').then(perm => () => {})
.catch(err => this.app.log.error(err))
```

Then you need to declare an `owners` attributes on your models like this : 
```js
export class Item extends Model {
  static config(app, Sequelize) {
    return {
      options: { }
    }
  }

  public static get resolver() {
    return SequelizeResolver
  }

  public static associate (models) {
    models.Item.belongsToMany(models.User, {
      as: 'owners',
      through: 'UserItem'//If many to many is needed
    })
  }
}
```
If the model is under a spool and you don't have access to it you can add a model with same name on your project, 
let's do this for the model User witch is already in spool-permission and spool-proxy-passport:
 
```js
import { User as PermissionsUser } from '@fabrix/spool-permissions/dist/models'
import { defaults, defaultsDeep } from 'lodash'

class User extends PermissionsUser {
  static config(app, Sequelize) {
    return defaultsDeep(PermissionsUser.config, {
      options: {
        // your options
      }
    })
  }
  static schema(app, Sequelize) {
    return defaults(PermissionsUser.schema, {
     // your schema
    })
  }
  static associate(models) {
    PermissionsUser.associate(models)
    // your associations
  }
}
```

Like this you can add `owners` permissions on all preferred models.

WARNING! Currently `owner` permissions are not supported for `update` `destroy` actions on multiple items (with no ID) 

#### Dynamically with PermissionsService
```js
// Grant a permission to create 'modelName' to 'roleName'
this.app.services.PermissionsService.grant('roleName', 'modelName', 'create').then(perm => () => {})
.catch(err => this.app.log.error(err))

// Revoke a permission to create 'modelName' to 'roleName'
this.app.services.PermissionsService.revoke('roleName', 'modelName', 'create').then(perm => () => {})
.catch(err => this.app.log.error(err))
```

### Manage route permissions
Route permissions can be added directly under route definition: 
```js
export const routes = {
  // ...
  '/api/myroute': {
    'GET': 'DefaultController.myroute',
    config: {
      app: {
        permissions: {
          resourceName: 'myrouteId',
          roles: ['roleName']
        }
      }
    }
  }
  // ...
}
```
When the DB is empty all routes permissions will be created, if you make any change after this you'll have to update permissions yourself.

You can use PermissionsService anytime you want to grant or revoke routes permissions.

### Policies 
You have 2 policies to manage permissions, they return a 403 when user is not allowed : 

#### CheckPermissions.checkRoute
This one will check your route permissions, if they are no explicit permissions then the route _is_ accessible. 
The easy way to setup is : 

```js
//config/policies.ts
'*': [ 'CheckPermissions.checkRoute' ]
//or
ViewController: [ 'CheckPermissions.checkRoute' ] 

```

#### CheckPermissions.checkModel
This one will check your model permissions, if there are no explicit permissions models _are not_ accessible
```js
//config/policies.ts
TapestryController: [ 'CheckPermissions.checkModel' ] // To check permissions on models
```

[npm-image]: https://img.shields.io/npm/v/spool-permissions.svg?style=flat-square
[npm-url]: https://npmjs.org/package/spool-permissions
[npm-download]: https://img.shields.io/npm/dt/spool-permissions.svg
[ci-image]: https://img.shields.io/circleci/project/github/fabrix-app/spool-permissions/master.svg
[ci-url]: https://circleci.com/gh/fabrix-app/spool-permissions/tree/master
[daviddm-image]: http://img.shields.io/david/fabrix-app/spool-permissions.svg?style=flat-square
[daviddm-url]: https://david-dm.org/fabrix-app/spool-permissions
[codeclimate-image]: https://img.shields.io/codeclimate/github/fabrix-app/spool-permissions.svg?style=flat-square
[codeclimate-url]: https://codeclimate.com/github/fabrix-app/spool-permissions
[gitter-image]: http://img.shields.io/badge/+%20GITTER-JOIN%20CHAT%20%E2%86%92-1DCE73.svg?style=flat-square
[gitter-url]: https://gitter.im/fabrix-app/Lobby
[twitter-image]: https://img.shields.io/twitter/follow/FabrixApp.svg?style=social
[twitter-url]: https://twitter.com/FabrixApp

[ci-sequelize-image]: https://img.shields.io/circleci/project/github/fabrix-app/spool-sequelize/master.svg
[ci-sequelize-url]: https://circleci.com/gh/fabrix-app/spool-sequelize/tree/master

[ci-express-image]: https://img.shields.io/circleci/project/github/fabrix-app/spool-express/master.svg
[ci-express-url]: https://circleci.com/gh/fabrix-app/spool-express/tree/master

