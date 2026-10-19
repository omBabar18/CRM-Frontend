import { Share2 } from 'lucide-react'
import { IncomingFeature } from '../components/shell/IncomingFeature'

export function Referrals() {
  return (
    <IncomingFeature
      icon={Share2}
      title="Referrals"
      detail="Who sent a customer, and whether the reward is paid, will be managed here in a later release."
      points={['Record the person who referred a customer', 'Mark the referral converted', 'Track the reward until it is paid']}
    />
  )
}
