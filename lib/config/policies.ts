export const policies = {
  UserController: {
    // update: [ 'CheckPermissionsPolicy.checkModel' ],
    uploadCSV: [ 'UserPolicy.csv' ]
  }
}
