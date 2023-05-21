import { Button } from "@tremor/react"
import { useUser } from "@auth0/nextjs-auth0"
import { PlusIcon } from "@heroicons/react/20/solid"
import uniqBy from "lodash.uniqby"

import { upsertPart, upsertSupplier } from "lib/api/upsert"
import Flatfile from "../flatfile"

export default ({
  disabled,
  onSuccess,
}: {
  disabled: boolean
  onSuccess: () => void
}) => {
  const { user } = useUser()

  return (
    <Flatfile
      embedId={process.env.MATERIALS_EMBED_ID ?? ""}
      onBeforeUpload={async () => true}
      onChunk={async (chunk) => {
        const rows = chunk.records.map((row) => row.data)
        let parts = []

        for (const row of rows) {
          const retakePartID = `${row.part_id}-${user?.org_id}`

          parts.push({
            manufacturing_process: row.manufacturing_process?.toString(),
            origin: row.origin?.toString(),
            supplier_id: row.supplier
              ? `${row.supplier}-${user?.org_id}`
              : null,
            part_description: row.description?.toString(),
            org_id: user?.org_id,
            retake_part_id: retakePartID,
            customer_part_id: row.part_id?.toString(),
            primary_material: row.material?.toString(),
          })
        }

        parts = uniqBy(parts, "retake_part_id")
        const suppliers = uniqBy(rows, "supplier")
          .filter((row) => (row?.supplier ?? "") !== "")
          .map((row) => ({
            id: `${row.supplier}-${user?.org_id}`,
            name: row.supplier?.toString(),
            org_id: user?.org_id,
          }))

        await Promise.all([
          upsertPart(parts, user?.org_id),
          upsertSupplier(suppliers, user?.org_id),
        ])
      }}
      onSuccess={onSuccess}
    >
      <Button
        text="Upload From File"
        color="indigo"
        icon={PlusIcon}
        disabled={disabled}
        variant="light"
      />{" "}
    </Flatfile>
  )
}
