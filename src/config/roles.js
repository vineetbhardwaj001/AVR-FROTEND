export const ROLES = {
  SUPERADMIN: 'SUPERADMIN',
  BUSINESS_ADMIN: 'BUSINESS_ADMIN',
  STAFF: 'STAFF'
}

export const CAN = (role, action) => {
  const permissions = {
    SUPERADMIN: {
      adminOnboard: true,
      allBusinesses: true,
      crudBusinesses: true,
      staffAll: true,
      staffProvision: true,
      servicesAll: true,
      appointmentsAll: true,
      customersAll: true,
      conversationsAll: true,
      staffSelfService: true
    },
    BUSINESS_ADMIN: {
      adminOnboard: false,
      allBusinesses: false,
      crudBusinesses: 'own',
      staffAll: false,
      staffProvision: 'own',
      servicesAll: 'own',
      appointmentsAll: 'own',
      customersAll: 'own',
      conversationsAll: 'own',
      staffSelfService: false
    },
    STAFF: {
      adminOnboard: false,
      allBusinesses: false,
      crudBusinesses: false,
      staffAll: false,
      staffProvision: false,
      servicesAll: 'readOwn',
      appointmentsAll: 'assigned',
      customersAll: 'assigned',
      conversationsAll: false,
      staffSelfService: true
    }
  }

  const perm = permissions[role]
  if (!perm) return false
  return perm[action] === true || ['own', 'readOwn', 'assigned'].includes(perm[action])
}

export default { ROLES, CAN }
