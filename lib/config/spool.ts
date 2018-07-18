/**
 * Spool Configuration
 *
 * @see {@link http://fabrixjs.io/doc/spool/config
 */
export const spool = {
  type: 'misc',
  /**
   * API and config resources provided by this Spool.
   */
  provides: {
    api: {
      controllers: ['RoleController', 'UserController'],
      services: ['PermissionsService'],
      models: ['Permission', 'Resource', 'Role', 'User', 'UserItem', 'UserRole', 'UserUpload']
    },
    config: ['permissions', 'routes', 'policies']
  },

  /**
   * Configure the lifecycle of this pack; that is, how it boots up, and which
   * order it loads relative to other spools.
   */
  lifecycle: {
    configure: {
      /**
       * List of events that must be fired before the configure lifecycle
       * method is invoked on this Spool
       */
      listen: [
        'spool:sequelize:configured',
        // 'spool:engine:configured',
        'spool:passport:configured',
        // 'spool:tapestries:configured'
      ],

      /**
       * List of events emitted by the configure lifecycle method
       */
      emit: [
        'spool:permission:configured'
      ]
    },
    initialize: {
      listen: [
        'spool:sequelize:initialized',
        // 'spool:engine:initialized',
        'spool:passport:initialized'
      ],
      emit: [
        'spool:permission:initialized'
      ]
    }
  }
}

