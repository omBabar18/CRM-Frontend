import { Star } from 'lucide-react'
import { IncomingFeature } from '../components/shell/IncomingFeature'

export function Reviews() {
  return (
    <IncomingFeature
      icon={Star}
      title="Google reviews"
      detail="Review requests after a gold sale or loan will be tracked here. This desk is not connected yet."
      points={['Ask for a review after a transaction', 'See who has already reviewed', 'Count reviews against the monthly target']}
    />
  )
}
