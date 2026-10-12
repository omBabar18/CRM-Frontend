import { permissionsFor } from './constants'
import { isoOffset } from './utils'

const at = isoOffset

function person(id, name, mobile, role) {
  return { id, name, mobile, role, password: 'gold123', active: true, permissions: permissionsFor(role) }
}

export function createSeed() {
  const staff = [
    person('s1', 'Aarti Deshmukh', '9876543210', 'Admin'),
    person('s2', 'Rahul Patil', '9876500002', 'Manager'),
    person('s3', 'Sneha Kulkarni', '9876500003', 'Sales Executive'),
    person('s4', 'Amit Jadhav', '9876500004', 'Calling Executive'),
    person('s5', 'Neha Shah', '9876500005', 'Accountant'),
  ]

  const customers = [
    customer('DG-C-501', 'Lata Chavan', '9765432108', 'Miraj', 's3', -140, 'Verified', '4412', 'CHVPL4412K'),
    customer('DG-C-502', 'Ramesh Patil', '9765432201', 'Sangli', 's3', -80, 'Verified', '2281', 'PATPR2281Q'),
    customer('DG-C-503', 'Sunita Kamble', '9765432302', 'Kupwad', 's3', -45, 'Submitted', '9033', 'KMBPS9033L'),
    customer('DG-C-504', 'Imran Shaikh', '9765432404', 'Vishrambag', 's4', -70, 'Verified', '1188', 'SHKIM1188A'),
    customer('DG-C-505', 'Kavita Joshi', '9765432505', 'Tasgaon', 's3', -200, 'Verified', '7740', 'JSHKV7740B'),
    customer('DG-C-506', 'Harish Mane', '9765432606', 'Islampur', 's4', -190, 'Pending', '6601', ''),
    customer('DG-C-507', 'Rekha Desai', '9822099001', 'Madhavnagar', 's3', 0, 'Submitted', '5520', 'DSERK5520C'),
    customer('DG-C-508', 'Jeevan Naik', '9822088112', 'Sangli', 's3', 0, 'Verified', '3091', 'NAKjV3091D'),
    customer('DG-C-509', 'Suresh Bhosale', '9822077003', 'Miraj', 's5', -50, 'Verified', '6408', 'BHSLS6408E'),
  ]

  const leads = [
    lead('DG-L-2401', 'Vikram More', '9822011101', '9822011191', 'Vishrambag', 'Google Ads', 'Sell Gold', 185000, 28, 's3', 'Follow-up', 'High', -1, 0, at(0, 16, 30), '22K jewellery. Wants cash after 4 PM.', 'Interested'),
    lead('DG-L-2402', 'Pooja Nikam', '9822011102', '', 'Miraj', 'Instagram', 'Gold Loan', 120000, 18, 's4', 'New', 'Medium', 0, null, at(1, 11, 0), 'Asked for same-day release.', ''),
    lead('DG-L-2403', 'Santosh Bhore', '9822011103', '', 'Kupwad', 'WhatsApp', 'Sell Gold', 90000, 12, 's4', 'Contacted', 'High', -4, -1, at(-1, 11, 0), 'No answer on two calls.', 'No Response'),
    lead('DG-L-2404', 'Asha Pawar', '9822011104', '9822011184', 'Madhavnagar', 'Facebook', 'Rate Inquiry', 60000, 8, 's3', 'Interested', 'Medium', 0, 0, at(0, 12, 30), 'Comparing 22K rate with another shop.', 'Rate Inquiry'),
    lead('DG-L-2405', 'Nitin Koli', '9822011105', '', 'Sangli', 'Google Business Profile', 'Gold Loan', 250000, 40, 's3', 'Visit Scheduled', 'High', 0, 0, at(0, 18, 0), 'Visit confirmed for this evening.', 'Visit Fixed'),
    lead('DG-L-2406', 'Farida Mulla', '9822011106', '', 'Tasgaon', 'Referral', 'Sell Gold', 70000, 10, 's4', 'Follow-up', 'Low', -2, -1, at(1, 15, 0), 'Referred by Rekha Desai.', 'Call Back'),
    lead('DG-L-2407', 'Ganesh Yadav', '9822011107', '', 'Vishrambag', 'Walk-in', 'Sell Gold', 210000, 32, 's3', 'Visited', 'High', -1, 0, at(0, 15, 0), 'Visited counter. Wants final quote.', 'Gold Selling Inquiry'),
    lead('DG-L-2408', 'Meena Salunkhe', '9822011108', '', 'Islampur', 'Existing Customer', 'Gold Loan', 150000, 22, 's3', 'Follow-up', 'Medium', -12, -3, at(-3, 10, 0), 'Old customer, interest in renewal.', 'Gold Loan Inquiry'),
    lead('DG-L-2409', 'Yusuf Patel', '9822011109', '', 'Kolhapur', 'Other', 'Sell Gold', 50000, 7, 's4', 'Contacted', 'Medium', -6, -2, null, 'Spoke once. No next step saved.', 'Interested'),
    lead('DG-L-2410', 'Deepak Mane', '9822011110', '', 'Kupwad', 'Google Ads', 'Sell + Loan', 300000, 45, 's4', 'New', 'High', 0, null, at(0, 17, 0), 'Wants both sale and loan options.', ''),
    lead('DG-L-2411', 'Rekha Desai', '9822099001', '', 'Madhavnagar', 'Walk-in', 'Sell Gold', 160000, 24, 's3', 'Converted', 'High', 0, 0, null, 'Converted at the counter this morning.', 'Converted', 'DG-C-507'),
    lead('DG-L-2412', 'Swati Jagtap', '9822011112', '', 'Sangli', 'Facebook', 'Rate Inquiry', 0, 0, 's4', 'Invalid', 'Low', -8, -8, null, 'Wrong number.', 'Wrong Number'),
    lead('DG-L-2413', 'Anil Shinde', '9822011113', '', 'Miraj', 'WhatsApp', 'Sell Gold', 40000, 5, 's4', 'Lost', 'Low', -15, -9, null, 'Sold elsewhere.', 'Not Interested'),
    lead('DG-L-2414', 'Kiran Bhagat', '9822011114', '', 'Sangli', 'Instagram', 'Gold Loan', 80000, 11, 's2', 'Interested', 'Medium', 0, 0, at(2, 11, 30), 'Manager callback requested.', 'Interested'),
  ]

  const purchases = [
    purchase('DG-GP-801', 'DG-C-501', 's3', 0, 26.4, 25.1, '22K (916)', 6640, 14800, 'UPI'),
    purchase('DG-GP-802', 'DG-C-507', 's3', 0, 24.2, 23.4, '22K (916)', 6640, 9200, 'Cash', 'DG-L-2411'),
    purchase('DG-GP-803', 'DG-C-503', 's3', -45, 18, 16.8, '22K (916)', 6480, 7400, 'Bank Transfer'),
    purchase('DG-GP-804', 'DG-C-504', 's4', -70, 15, 14.2, '22K (916)', 6410, 6100, 'UPI'),
    purchase('DG-GP-805', 'DG-C-506', 's4', -190, 31, 29.4, '24K (995)', 7100, 18000, 'Cash'),
    purchase('DG-GP-806', 'DG-C-501', 's3', -20, 12, 11.2, '18K (750)', 5430, 4200, 'UPI'),
    purchase('DG-GP-807', 'DG-C-502', 's3', -6, 22, 20.5, '22K (916)', 6580, 11000, 'Bank Transfer'),
    purchase('DG-GP-808', 'DG-C-505', 's3', -15, 19, 18.1, '22K (916)', 6600, 8600, 'Cash'),
    purchase('DG-GP-809', 'DG-C-504', 's4', -9, 28, 26.6, '22K (916)', 6610, 13400, 'UPI'),
    purchase('DG-GP-810', 'DG-C-503', 's3', -12, 21, 19.8, 'Coins', 6640, 10200, 'Cash'),
    purchase('DG-GP-811', 'DG-C-502', 's2', -3, 16, 15.4, '22K (916)', 6630, 7800, 'UPI'),
    purchase('DG-GP-812', 'DG-C-507', 's3', -2, 10, 9.6, 'Scrap', 6500, 3900, 'Cash'),
  ].map(withPurchaseMath)

  const loans = [
    {
      id: 'DG-LN-301',
      customerId: 'DG-C-502',
      staffId: 's3',
      weight: 32,
      purity: '22K (916)',
      rate: 6640,
      loanAmount: 145000,
      interestRate: 12,
      processingFee: 1450,
      startDate: at(-10, 12, 0),
      dueDate: at(20, 12, 0),
      status: 'Active',
      payments: [{ id: 'pay-1', date: at(-2, 13, 0), amount: 15000, mode: 'UPI', note: 'Part payment' }],
    },
    {
      id: 'DG-LN-302',
      customerId: 'DG-C-508',
      staffId: 's3',
      weight: 40,
      purity: '22K (916)',
      rate: 6640,
      loanAmount: 180000,
      interestRate: 11.5,
      processingFee: 1800,
      startDate: at(0, 11, 20),
      dueDate: at(90, 11, 0),
      status: 'Active',
      payments: [],
    },
    {
      id: 'DG-LN-303',
      customerId: 'DG-C-509',
      staffId: 's5',
      weight: 22,
      purity: '22K (916)',
      rate: 6500,
      loanAmount: 90000,
      interestRate: 13,
      processingFee: 900,
      startDate: at(-40, 11, 0),
      dueDate: at(-5, 11, 0),
      status: 'Overdue',
      payments: [{ id: 'pay-2', date: at(-20, 12, 0), amount: 10000, mode: 'Cash', note: 'Interest' }],
    },
    {
      id: 'DG-LN-304',
      customerId: 'DG-C-505',
      staffId: 's3',
      weight: 18,
      purity: '24K (995)',
      rate: 7000,
      loanAmount: 80000,
      interestRate: 12,
      processingFee: 800,
      startDate: at(-160, 11, 0),
      dueDate: at(-100, 11, 0),
      status: 'Closed',
      payments: [{ id: 'pay-3', date: at(-100, 16, 0), amount: 80000, mode: 'Bank Transfer', note: 'Closed' }],
    },
  ]

  const reviews = [
    { id: 'rv-1', customerId: 'DG-C-501', staffId: 's3', status: 'Requested', requestedAt: at(0, 11, 0), completedAt: null },
    { id: 'rv-2', customerId: 'DG-C-507', staffId: 's3', status: 'Pending', requestedAt: null, completedAt: null },
    { id: 'rv-3', customerId: 'DG-C-503', staffId: 's3', status: 'Completed', requestedAt: at(-40, 12, 0), completedAt: at(-38, 18, 0) },
    { id: 'rv-4', customerId: 'DG-C-504', staffId: 's4', status: 'Completed', requestedAt: at(-8, 12, 0), completedAt: at(-7, 19, 0) },
    { id: 'rv-5', customerId: 'DG-C-502', staffId: 's2', status: 'Requested', requestedAt: at(-2, 14, 0), completedAt: null },
    { id: 'rv-6', customerId: 'DG-C-505', staffId: 's3', status: 'Completed', requestedAt: at(-14, 12, 0), completedAt: at(-13, 17, 0) },
  ]

  const referrals = [
    { id: 'rf-1', referrerId: 'DG-C-507', referredName: 'Farida Mulla', referredMobile: '9822011106', date: at(-2, 12, 0), converted: false, reward: 500, rewardStatus: 'Pending', staffId: 's3' },
    { id: 'rf-2', referrerId: 'DG-C-503', referredName: 'Imran Shaikh', referredMobile: '9765432404', date: at(-70, 12, 0), converted: true, reward: 750, rewardStatus: 'Paid', staffId: 's3' },
    { id: 'rf-3', referrerId: 'DG-C-506', referredName: 'Anil Shinde', referredMobile: '9822011113', date: at(-15, 12, 0), converted: false, reward: 500, rewardStatus: 'Cancelled', staffId: 's4' },
    { id: 'rf-4', referrerId: 'DG-C-501', referredName: 'Nitin Koli', referredMobile: '9822011105', date: at(0, 9, 40), converted: false, reward: 500, rewardStatus: 'Pending', staffId: 's3' },
  ]

  const tasks = [
    task('t1', 'Call task', 'Call Vikram More before 4 PM', 'DG-L-2401', null, 's3', at(0, 16, 0), 'Open'),
    task('t2', 'Customer visit', 'Evening valuation for Nitin Koli', 'DG-L-2405', null, 's3', at(0, 18, 0), 'Open'),
    task('t3', 'Follow-up', 'Second attempt to Santosh Bhore', 'DG-L-2403', null, 's4', at(0, 13, 0), 'Open'),
    task('t4', 'KYC task', 'Collect PAN for Rekha Desai', null, 'DG-C-507', 's5', at(0, 15, 30), 'Open'),
    task('t5', 'Payment reminder', 'Suresh Bhosale overdue loan', null, 'DG-C-509', 's5', at(-1, 11, 0), 'Open'),
    task('t6', 'Review request', 'Ask Lata Chavan for Google review', null, 'DG-C-501', 's3', at(0, 17, 30), 'Open'),
    task('t7', 'Document collection', 'Gold photo for Jeevan Naik loan', null, 'DG-C-508', 's3', at(1, 11, 0), 'Open'),
    task('t8', 'Call task', 'Welcome call to Deepak Mane', 'DG-L-2410', null, 's4', at(0, 12, 0), 'Done'),
  ]

  const activities = [
    act('a1', 'call', 's4', 'DG-L-2403', 0, 9, 20, 'No Response'),
    act('a2', 'call', 's3', 'DG-L-2401', 0, 9, 40, 'Interested'),
    act('a3', 'call', 's3', 'DG-L-2404', 0, 10, 5, 'Rate Inquiry'),
    act('a4', 'call', 's4', 'DG-L-2410', 0, 10, 30, 'Interested'),
    act('a5', 'call', 's2', 'DG-L-2414', 0, 11, 10, 'Interested'),
    act('a6', 'visit', 's3', 'DG-L-2407', 0, 11, 40, 'Gold Selling Inquiry'),
    act('a7', 'followup', 's3', 'DG-L-2401', 0, 9, 40, 'Interested'),
    act('a8', 'followup', 's4', 'DG-L-2403', 0, 9, 20, 'No Response'),
    act('a9', 'conversion', 's3', 'DG-L-2411', 0, 11, 50, 'Converted'),
  ]

  for (let i = 1; i <= 28; i += 1) {
    activities.push(act(`ah-${i}`, i % 5 === 0 ? 'visit' : i % 3 === 0 ? 'followup' : 'call', ['s3', 's4', 's2', 's4'][i % 4], 'DG-L-2401', -((i % 16) + 1), 10 + (i % 6), 10, 'Interested'))
  }

  return {
    version: 1,
    staff,
    customers,
    leads,
    purchases,
    loans,
    reviews,
    referrals,
    tasks,
    activities,
    campaigns: [],
    automations: [
      { id: 'assign', name: 'Auto lead assignment', detail: 'New leads rotate to the sales or calling executive with the lightest open queue.', enabled: true },
      { id: 'followup', name: 'Follow-up reminders', detail: 'Remind the owner on the morning a follow-up is due.', enabled: true },
      { id: 'overdue', name: 'Overdue alerts', detail: 'Keep overdue follow-ups pinned for the owner, manager, and admin.', enabled: true },
      { id: 'noresponse', name: 'No-response lead reminders', detail: 'If a lead has two no-response outcomes, remind the owner the next morning.', enabled: true },
      { id: 'review', name: 'Review request after transaction', detail: 'After a gold sale or loan disbursement, create a Google review task.', enabled: true },
      { id: 'reactivate', name: 'Old customer reactivation', detail: 'Surface customers silent for 30, 60, 90, and 180 days.', enabled: true },
      { id: 'summary', name: 'Daily task summary', detail: 'Each employee sees today’s calls, visits, and overdue items on the dashboard.', enabled: true },
      { id: 'manager', name: 'Daily manager summary', detail: 'Managers see team conversions, revenue, and overdue load.', enabled: true },
    ],
    targets: {
      daily: { leads: 8, calls: 10, followups: 8, visits: 3, conversions: 2, goldSale: 350000, goldLoan: 250000, revenue: 25000, reviews: 2, referrals: 1 },
      weekly: { leads: 40, calls: 55, followups: 40, visits: 12, conversions: 8, goldSale: 1800000, goldLoan: 1200000, revenue: 120000, reviews: 8, referrals: 4 },
      monthly: { leads: 80, calls: 48, followups: 36, visits: 14, conversions: 8, goldSale: 2200000, goldLoan: 700000, revenue: 180000, reviews: 10, referrals: 6 },
    },
    rates: { k24: 7240, k22: 6640, k18: 5430, updatedAt: at(0, 9, 15) },
    settings: {
      reviewLink: 'https://search.google.com/local/writereview?placeid=DG_GOLD_SANGLI_SAMPLE',
      city: 'Sangli, Maharashtra',
    },
  }
}

function customer(id, name, mobile, location, assignedTo, sinceDays, kycStatus, aadhaarTail, pan) {
  return {
    id,
    name,
    mobile,
    alternate: '',
    location,
    address: `${location}, Sangli, Maharashtra`,
    email: '',
    assignedTo,
    since: at(sinceDays, 11, 0),
    kyc: { status: kycStatus, aadhaar: `XXXX-XXXX-${aadhaarTail}`, pan },
    notes: [{ id: `${id}-n`, text: 'Prefers a call before visiting the counter.', staffId: assignedTo, at: at(sinceDays, 11, 20) }],
  }
}

function lead(id, name, mobile, alternate, location, source, requirement, expectedAmount, goldWeight, assignedTo, status, priority, createdDays, contactDays, nextFollowUp, notes, lastOutcome, customerId) {
  const createdAt = at(createdDays, 9 + (Number(id.slice(-1)) % 5), 15)
  const lastContact = contactDays == null ? null : at(contactDays, 10, 20)
  return {
    id,
    name,
    mobile,
    alternate,
    location,
    source,
    requirement,
    expectedAmount,
    goldWeight,
    assignedTo,
    status,
    priority,
    createdAt,
    lastContact,
    nextFollowUp,
    notes,
    lastOutcome,
    customerId: customerId || null,
    convertedAt: status === 'Converted' ? at(0, 11, 50) : null,
    timeline: lastContact
      ? [{ id: `${id}-tl`, at: lastContact, type: 'call', text: notes, outcome: lastOutcome, staffId: assignedTo }]
      : [],
  }
}

function purchase(id, customerId, staffId, day, grossWeight, netWeight, purity, rate, deduction, paymentMode, leadId) {
  return { id, customerId, staffId, date: at(day, 13, 10), goldType: purity.startsWith('24') ? 'Coins' : 'Jewellery', grossWeight, netWeight, purity, rate, deduction, paymentMode, leadId: leadId || null }
}

function withPurchaseMath(row) {
  const grossValue = Math.round(row.netWeight * row.rate)
  return { ...row, grossValue, finalPayable: grossValue - row.deduction }
}

function task(id, type, title, leadId, customerId, staffId, due, status) {
  return { id, type, title, leadId, customerId, staffId, due, status, notes: '' }
}

function act(id, type, staffId, leadId, day, hour, minute, outcome) {
  return { id, type, staffId, leadId, at: at(day, hour, minute), outcome }
}
