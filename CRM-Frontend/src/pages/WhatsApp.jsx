import { MessageCircle } from 'lucide-react'
import { IncomingFeature } from '../components/shell/IncomingFeature'

export function WhatsApp() {
  return (
    <IncomingFeature
      icon={MessageCircle}
      title="WhatsApp"
      detail="Templates, inbox, and follow-up messages will live here once the WhatsApp desk is connected."
      points={['Ready-made rate and follow-up templates', 'Send from the customer or lead record', 'A log of every message the desk sends']}
    />
  )
}
