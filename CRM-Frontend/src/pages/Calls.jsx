import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCrm } from '../context'
import { useIsMobile } from '../hooks'
import { fromLocalInput, isoOffset, toLocalInput } from '../utils'
import { CallingDossier } from '../components/calls/CallingDossier'
import { CallingQueueItem } from '../components/calls/CallingQueueItem'

export function Calls() {
  const { queue, db, logCall } = useCrm()
  const [params, setParams] = useSearchParams()
  const mobile = useIsMobile()
  const initial = params.get('lead') || queue[0]?.id
  const [activeId, setActiveId] = useState(initial)
  const [outcome, setOutcome] = useState('Interested')
  const [notes, setNotes] = useState('')
  const [nextAt, setNextAt] = useState(toLocalInput(isoOffset(1, 11, 0)))
  const [showList, setShowList] = useState(!params.get('lead'))
  const lead = queue.find((row) => row.id === activeId) || queue[0]

  useEffect(() => {
    if (params.get('lead')) {
      setActiveId(params.get('lead'))
      setShowList(false)
    }
  }, [params])

  useEffect(() => {
    setNotes(lead?.notes || '')
    setNextAt(toLocalInput(lead?.nextFollowUp || isoOffset(1, 11, 0)))
  }, [lead?.id])

  if (!lead) {
    return (
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-slate-900">Calling desk</h1>
        <p className="text-xs text-slate-500">No active leads in your queue.</p>
      </div>
    )
  }

  const save = () => {
    const ok = logCall({ leadId: lead.id, outcome, notes, nextFollowUp: fromLocalInput(nextAt) })
    if (ok) setNotes('')
  }

  const select = (row) => {
    setActiveId(row.id)
    setParams({ lead: row.id })
    setShowList(false)
  }

  return (
    <div className="min-w-0 space-y-3">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-slate-900">Calling desk</h1>
        <p className="text-xs font-normal text-slate-500">{queue.length} leads in queue · log the outcome, then set the next action.</p>
      </div>
      <div className="flex h-[calc(100vh-9.5rem)] min-h-[520px] overflow-hidden rounded-xl border border-slate-200 bg-white">
        {(!mobile || showList) && (
          <aside className="w-full shrink-0 overflow-y-auto border-r border-slate-200 bg-slate-50/50 md:w-80">
            {queue.map((row) => (
              <CallingQueueItem key={row.id} lead={row} active={row.id === lead.id} onSelect={() => select(row)} />
            ))}
          </aside>
        )}
        {(!mobile || !showList) && (
          <div className="min-w-0 flex-1 overflow-y-auto">
            <CallingDossier
              lead={lead}
              staff={db.staff}
              outcome={outcome}
              notes={notes}
              nextAt={nextAt}
              onOutcome={setOutcome}
              onNotes={setNotes}
              onNext={setNextAt}
              onSave={save}
              onBack={mobile ? () => setShowList(true) : null}
            />
          </div>
        )}
      </div>
    </div>
  )
}
