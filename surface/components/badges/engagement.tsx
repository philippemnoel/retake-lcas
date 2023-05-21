import { Badge } from "@tremor/react"

import { Engagement } from "lib/constants/engagement"
import { CMLPartsWithImpactsData } from "lib/types/supabase-row.types"

export default ({ item }: { item: CMLPartsWithImpactsData }) => {
  return (
    <>
      {item.supplier_engagement === Engagement.DataReceived ? (
        <Badge
          text="Data Received"
          color="blue"
          size="xs"
          tooltip="This item's carbon footprint was provided directly by the supplier and verified by Retake."
        />
      ) : item.supplier_engagement === Engagement.AwaitingResponse ? (
        <Badge
          text="Awaiting"
          color="amber"
          size="xs"
          tooltip="A request for this product's carbon footprint was sent to the supplier. When the supplier responds, this product's carbon footprint will automatically be updated."
        />
      ) : (
        <Badge
          text="Not Engaged"
          size="xs"
          color="zinc"
          tooltip="The supplier for this product has not been asked to provide a supplier-specific carbon footprint."
        />
      )}
    </>
  )
}
