export const User = {
  default: (app) => {
    return {
      include: [
        {
          model: app.models['Role'].resolver.sequelizeModel,
          as: 'roles'
        },
        {
          model: app.models['Passport'].resolver.sequelizeModel,
          as: 'passports'
        }
      ]
    }
  }
}
