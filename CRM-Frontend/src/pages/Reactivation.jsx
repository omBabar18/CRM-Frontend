import { RotateCcw } from 'lucide-react'
import { IncomingFeature } from '../components/shell/IncomingFeature'

export function Reactivation() {
  return (
    <IncomingFeature
      icon={RotateCcw}
      title="Reactivation"
      detail="Quiet customers will be grouped by how long they have been away. Campaigns are not switched on yet."
      points={['30, 60, 90, and 180 day quiet lists', 'A message ready for each group', 'A campaign you can start from the desk']}
    />
  )
}