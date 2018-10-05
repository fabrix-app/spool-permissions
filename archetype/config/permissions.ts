export const permissions = {
  // Role name to use for anonymous users
  defaultRole: 'registered',
  // Role to grant on user create
  defaultRegisteredRole: 'registered',
  // Name of the association field for Role under User model
  userRoleFieldName: 'roles',
  // add all models as resources in database on initialization
  modelsAsResources: true,
  // Initial data added when DB is empty
  fixtures: {
    roles: [
      {
        name: 'admin',
        public_name: 'Admin'
      }, {
        name: 'registered' ,
        public_name: 'Registered'
      }
    ],
    resources: [],
    permissions: []
  },
  // The default super admin username
  defaultAdminUsername: 'admin',
  // The default super admin password
  defaultAdminPassword: 'admin1234'
}
