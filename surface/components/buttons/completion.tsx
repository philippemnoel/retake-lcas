import { useState } from "react"
import { Button } from "@tremor/react"
import { XCircleIcon, CheckCircleIcon } from "@heroicons/react/24/outline"
import { useUser } from "@auth0/nextjs-auth0"

import { updateLCA } from "lib/api/update"
import { LCAStage } from "lib/types/calculator.types"

import CompletionModal from "@/components/modals/complete"
import IncompleteModal from "@/components/modals/incomplete"
import { useNotification } from "@/components/hooks"
import Step from "@/components/menus/step"

const CompletionButton = ({
  complete,
  canMarkComplete,
  setIncompleteModalOpen,
  setCompletionModalOpen,
}: {
  complete: boolean
  canMarkComplete: boolean
  setIncompleteModalOpen: (open: boolean) => void
  setCompletionModalOpen: (open: boolean) => void
}) => {
  return (
    <Button
      text={complete ? "Mark Incomplete" : "Mark Complete"}
      icon={complete ? XCircleIcon : CheckCircleIcon}
      onClick={() => {
        complete ? setIncompleteModalOpen(true) : setCompletionModalOpen(true)
      }}
      variant={complete ? "light" : "primary"}
      color="indigo"
      disabled={!complete && !canMarkComplete}
    />
  )
}

export default ({
  complete,
  canMarkComplete,
  lcaID,
  stage,
  onRefresh,
}: {
  complete: boolean
  canMarkComplete: boolean
  lcaID: string
  stage: LCAStage
  onRefresh: () => void
}) => {
  const [incompleteModalOpen, setIncompleteModalOpen] = useState(false)
  const [completionModalOpen, setCompletionModalOpen] = useState(false)

  const { withNotification } = useNotification()
  const { user } = useUser()

  return (
    <div>
      <CompletionModal
        open={completionModalOpen}
        stage={stage}
        onDismiss={() => setCompletionModalOpen(false)}
        onContinue={async () => {
          await withNotification([
            updateLCA({
              lca_id: lcaID,
              org_id: user?.org_id,
              ...(stage === LCAStage.MATERIALS && {
                materials_completed: true,
              }),
              ...(stage === LCAStage.TRANSPORTATION && {
                transportation_completed: true,
              }),
              ...(stage === LCAStage.MANUFACTURING && {
                manufacturing_completed: true,
              }),
              ...(stage === LCAStage.USE && {
                use_phase_completed: true,
              }),
              ...(stage === LCAStage.DISPOSAL && {
                end_of_life_completed: true,
              }),
            }),
          ])
          onRefresh()
        }}
      />
      <IncompleteModal
        open={incompleteModalOpen}
        onDismiss={() => setIncompleteModalOpen(false)}
        onContinue={async () => {
          await withNotification([
            updateLCA({
              lca_id: lcaID,
              org_id: user?.org_id,
              ...(stage === LCAStage.MATERIALS && {
                materials_completed: false,
              }),
              ...(stage === LCAStage.TRANSPORTATION && {
                transportation_completed: false,
              }),
              ...(stage === LCAStage.MANUFACTURING && {
                manufacturing_completed: false,
              }),
              ...(stage === LCAStage.USE && {
                use_phase_completed: false,
              }),
              ...(stage === LCAStage.DISPOSAL && {
                end_of_life_completed: false,
              }),
            }),
          ])
          onRefresh()
        }}
      />
      <Step
        type={stage}
        completed={complete}
        show={!canMarkComplete}
        right="right-56"
      >
        <CompletionButton
          complete={complete}
          canMarkComplete={canMarkComplete}
          setIncompleteModalOpen={setIncompleteModalOpen}
          setCompletionModalOpen={setCompletionModalOpen}
        />
      </Step>
    </div>
  )
}
