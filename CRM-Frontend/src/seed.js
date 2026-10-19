import { permissionsFor } from './constants'
import { isoOffset } from './utils'

const period = { leads: 0, calls: 0, followups: 0, visits: 0, conversions: 0, purchases: 0, customers: 0, goldSale: 0, goldLoan: 0, revenue: 0, reviews: 0, referrals: 0 }

export function createSeed() {
  return {
    version: 3,
    staff: [{
      id: 's1',
      name: 'Super Admin',
      mobile: '9876500001',
      email: 'dggold0001@gmail.com',
      password: 'Super@0001',
      role: 'Super Admin',
      active: true,
      emailVerified: true,
      permissions: permissionsFor('Super Admin'),
    }],
    customers: [],
    leads: [],
    purchases: [],
    loans: [],
    reviews: [],
    referrals: [],
    tasks: [],
    activities: [],
    campaigns: [],
    automations: [],
    targets: { daily: { ...period }, weekly: { ...period }, monthly: { ...period } },
    rates: { k24: 0, k22: 0, k18: 0, updatedAt: isoOffset(0, 9, 0) },
    settings: { reviewLink: '', city: 'Sangli, Maharashtra' },
  }
}
