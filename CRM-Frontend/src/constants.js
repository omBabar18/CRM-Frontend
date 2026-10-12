export const ROLES = ['Admin', 'Manager', 'Sales Executive', 'Calling Executive', 'Accountant']

export const SOURCES = [
  'Google Ads',
  'Instagram',
  'Facebook',
  'WhatsApp',
  'Google Business Profile',
  'Referral',
  'Walk-in',
  'Existing Customer',
  'Other',
]

export const LEAD_STATUSES = [
  'New',
  'Contacted',
  'Interested',
  'Follow-up',
  'Visit Scheduled',
  'Visited',
  'Converted',
  'Not Interested',
  'Lost',
  'Invalid',
]

export const PIPELINE = ['New', 'Contacted', 'Interested', 'Follow-up', 'Visit Scheduled', 'Visited', 'Converted']

export const TERMINAL = ['Converted', 'Not Interested', 'Lost', 'Invalid']

export const PRIORITIES = ['High', 'Medium', 'Low']

export const LOCATIONS = [
  'Sangli',
  'Vishrambag',
  'Miraj',
  'Kupwad',
  'Madhavnagar',
  'Tasgaon',
  'Islampur',
  'Kolhapur',
  'Other',
]

export const REQUIREMENTS = ['Sell Gold', 'Gold Loan', 'Rate Inquiry', 'Sell + Loan', 'Visit Valuation']

export const OUTCOMES = [
  'Interested',
  'Not Interested',
  'Call Back',
  'Visit Fixed',
  'Rate Inquiry',
  'Gold Loan Inquiry',
  'Gold Selling Inquiry',
  'Converted',
  'Wrong Number',
  'No Response',
]

export const OUTCOME_STATUS = {
  Interested: 'Interested',
  'Not Interested': 'Not Interested',
  'Call Back': 'Follow-up',
  'Visit Fixed': 'Visit Scheduled',
  'Rate Inquiry': 'Interested',
  'Gold Loan Inquiry': 'Interested',
  'Gold Selling Inquiry': 'Interested',
  Converted: 'Converted',
  'Wrong Number': 'Invalid',
  'No Response': 'Contacted',
}

export const NO_NEXT_ACTION = ['Not Interested', 'Wrong Number', 'Converted']

export const GOLD_TYPES = ['Jewellery', 'Coins', 'Biscuits', 'Scrap', 'Bars']

export const PURITIES = [
  { id: '24K (995)', factor: 0.995, rateKey: 'k24' },
  { id: '22K (916)', factor: 0.916, rateKey: 'k22' },
  { id: '20K (833)', factor: 0.833, rateKey: 'k22' },
  { id: '18K (750)', factor: 0.75, rateKey: 'k18' },
]

export const PAYMENT_MODES = ['Cash', 'UPI', 'Bank Transfer', 'Cheque']

export const LOAN_STATUSES = ['Active', 'Payment Due', 'Overdue', 'Closed', 'Renewed']

export const TASK_TYPES = [
  'Call task',
  'Follow-up',
  'Customer visit',
  'Document collection',
  'KYC task',
  'Payment reminder',
  'Review request',
]

export const KYC_STATUSES = ['Pending', 'Submitted', 'Verified', 'Rejected']

export const REVIEW_STATUSES = ['Pending', 'Requested', 'Completed']

export const REWARD_STATUSES = ['Pending', 'Paid', 'Cancelled']

export const METRICS = [
  ['leads', 'Leads', false],
  ['calls', 'Calls', false],
  ['followups', 'Follow-ups', false],
  ['visits', 'Visits', false],
  ['conversions', 'Conversions', false],
  ['goldSale', 'Gold Sale', true],
  ['goldLoan', 'Gold Loan', true],
  ['revenue', 'Revenue', true],
  ['reviews', 'Google Reviews', false],
  ['referrals', 'Referrals', false],
]

export const TEMPLATES = [
  {
    id: 'new-lead',
    name: 'New lead',
    body: 'Namaste {{name}}, this is {{staff}} from DG Gold, Sangli. Thank you for your enquiry about {{requirement}}. We buy gold at a transparent rate and also offer gold loans. When is a good time to speak?',
  },
  {
    id: 'follow-up',
    name: 'Follow-up',
    body: 'Hello {{name}}, {{staff}} from DG Gold here. Following up on our last conversation. Today’s 22K rate is ₹{{rate}}/g. Shall I book your valuation?',
  },
  {
    id: 'rate',
    name: 'Gold rate update',
    body: 'DG Gold Sangli rate update: 22K ₹{{rate}}/g, 24K ₹{{rate24}}/g. Rates move through the day. Reply YES and we will reserve a slot for {{name}}.',
  },
  {
    id: 'loan-offer',
    name: 'Gold loan offer',
    body: 'Namaste {{name}}, DG Gold can release a gold loan against your jewellery with same-day valuation at our Sangli desk. Share a convenient time and {{staff}} will assist you.',
  },
  {
    id: 'visit',
    name: 'Visit confirmation',
    body: 'Confirmed, {{name}}. Your gold valuation visit at DG Gold, Sangli is on {{date}}. Please carry the gold and an ID proof. — {{staff}}',
  },
  {
    id: 'payment',
    name: 'Payment reminder',
    body: 'Hello {{name}}, this is a gentle reminder from DG Gold. An amount of {{amount}} is due on your gold loan. Reply here or visit the Sangli counter. — {{staff}}',
  },
  {
    id: 'thanks',
    name: 'Thank you message',
    body: 'Thank you {{name}} for choosing DG Gold. Your transaction {{txn}} is complete. We are glad to be your trusted gold buyer in Sangli. — {{staff}}',
  },
  {
    id: 'review',
    name: 'Review request',
    body: 'Thank you {{name}}. If the DG Gold experience was smooth, a short Google review helps local families find a trusted buyer: {{link}}',
  },
  {
    id: 'referral',
    name: 'Referral request',
    body: 'Hello {{name}}, if a friend or relative wants to sell gold or take a gold loan, share their number. DG Gold will take care of them and add your referral reward. — {{staff}}',
  },
]

export function permissionsFor(role) {
  if (role === 'Admin') {
    return { viewAllLeads: true, manageStaff: true, setTargets: true, viewReports: true, manageFinance: true }
  }
  if (role === 'Manager') {
    return { viewAllLeads: true, manageStaff: false, setTargets: true, viewReports: true, manageFinance: true }
  }
  if (role === 'Accountant') {
    return { viewAllLeads: true, manageStaff: false, setTargets: false, viewReports: true, manageFinance: true }
  }
  return { viewAllLeads: false, manageStaff: false, setTargets: false, viewReports: false, manageFinance: true }
}

export function can(user, key) {
  if (!user) return false
  if (user.role === 'Admin') return true
  return Boolean(user.permissions?.[key])
}

export function seesAllLeads(user) {
  return can(user, 'viewAllLeads')
}
