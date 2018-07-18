export const permissions = {
  // Prefix the routes
  prefix: '',
  // Role name to use for anonymous users
  defaultRole: null,
  // Role to Grant on user create
  defaultRegisteredRole: null,
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
