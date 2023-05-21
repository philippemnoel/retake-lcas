import { Badge } from "@tremor/react"

import FactorPopover from "../menus/factor"
import { formatNumber } from "lib/utils"

export default ({
  database,
  activity,
  source,
  impact,
  isLeaf,
  unit,
  marginTop,
}: {
  database?: string | null
  activity?: string | null
  source?: string | null
  impact?: number | null
  isLeaf: boolean
  unit?: string
  marginTop?: string
}) => {
  const factorNotFound = (impact ?? 0) === 0 && (database ?? "") === ""

  const impactBadgeColor = () =>
    factorNotFound
      ? "zinc"
      : source === "supplier"
      ? "blue"
      : source === "mixed"
      ? "purple"
      : "rose"

  return (
    <div className={marginTop && marginTop}>
      <FactorPopover
        database={database}
        activity={activity}
        source={source}
        isLeaf={isLeaf}
        factorNotFound={factorNotFound}
      >
        <Badge
          text={`${formatNumber(impact ?? 0)} ${unit ?? "kg CO2-Eq"}`}
          size="xs"
          color={impactBadgeColor()}
        />
      </FactorPopover>
    </div>
  )
}
