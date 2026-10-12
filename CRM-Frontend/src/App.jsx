import { Navigate, Route, Routes } from 'react-router-dom'
import { CrmProvider, useCrm } from './context'
import { SetupScreen } from './components/shell/SetupScreen'
import { Layout } from './Layout'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Leads } from './pages/Leads'
import { Calls } from './pages/Calls'
import { Followups } from './pages/Followups'
import { Customers } from './pages/Customers'
import { GoldLoan } from './pages/GoldLoan'
import { GoldPurchase } from './pages/GoldPurchase'
import { Tasks } from './pages/Tasks'
import { WhatsApp } from './pages/WhatsApp'
import { Reviews } from './pages/Reviews'
import { Referrals } from './pages/Referrals'
import { Reports } from './pages/Reports'
import { Staff } from './pages/Staff'
import { Targets } from './pages/Targets'
import { Automation } from './pages/Automation'
import { Reactivation } from './pages/Reactivation'

function Gate() {
  const { user } = useCrm()
  if (!user) return <Navigate to="/login" replace />
  return <Layout />
}

function Guest({ children }) {
  const { user } = useCrm()
  if (user) return <Navigate to="/" replace />
  return children
}

function Boot() {
  const { user, preparing, finishSetup, toast } = useCrm()
  if (user && preparing) {
    return (
      <SetupScreen
        name={user.name.split(' ')[0]}
        onDone={() => {
          finishSetup()
          toast('Your desk is ready.')
        }}
      />
    )
  }
  return (
      <Routes>
        <Route path="/login" element={<Guest><Login /></Guest>} />
        <Route element={<Gate />}>
          <Route index element={<Dashboard />} />
          <Route path="leads" element={<Leads />} />
          <Route path="calls" element={<Calls />} />
          <Route path="follow-ups" element={<Followups />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/:id" element={<Customers />} />
          <Route path="gold-loan" element={<GoldLoan />} />
          <Route path="gold-purchase" element={<GoldPurchase />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="whatsapp" element={<WhatsApp />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="referrals" element={<Referrals />} />
          <Route path="reports" element={<Reports />} />
          <Route path="staff" element={<Staff />} />
          <Route path="targets" element={<Targets />} />
          <Route path="automation" element={<Automation />} />
          <Route path="reactivation" element={<Reactivation />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  )
}

export function App() {
  return (
    <CrmProvider>
      <Boot />
    </CrmProvider>
  )
}
