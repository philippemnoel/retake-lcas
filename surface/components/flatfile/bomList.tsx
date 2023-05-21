import { Button } from "@tremor/react"
import { useUser } from "@auth0/nextjs-auth0"
import { v4 as uuidv4 } from "uuid"
import uniqBy from "lodash.uniqby"
import sum from "lodash.sum"

import Flatfile from "../flatfile"
import {
  upsertSupplier,
  upsertPart,
  upsertMaterialComposition,
} from "lib/api/upsert"
import { TPrimitive, TRecordData } from "@flatfile/sdk"

export default ({
  disabled,
  onSuccess,
}: {
  disabled: boolean
  onSuccess: () => void
}) => {
  const { user } = useUser()

  let lcaMap: Record<string, string> = {}
  let parentIdMap: Record<string, string> = {}

  const addLcaId = (partIds: Array<string>) => {
    const clonedLcaMap = { ...lcaMap }
    const clonedParentIdMap = { ...parentIdMap }

    for (const partId of partIds) {
      if (!clonedLcaMap.hasOwnProperty(partId)) clonedLcaMap[partId] = uuidv4()
      if (!clonedParentIdMap.hasOwnProperty(partId))
        clonedParentIdMap[partId] = uuidv4()
    }
    lcaMap = clonedLcaMap
    parentIdMap = clonedParentIdMap
  }

  const rowWeight = (row: TRecordData<TPrimitive>) =>
    row.weight_kilograms
      ? Number(row.weight_kilograms) * 1000
      : row.weight_grams
      ? Number(row.weight_grams)
      : 0

  const onUploadClick = async () => !disabled

  return (
    <Flatfile
      embedId={process.env.BOM_LIST_EMBED_ID ?? ""}
      onBeforeUpload={onUploadClick}
      onChunk={async (chunk) => {
        const rows = chunk.records.map((row) => row.data)

        addLcaId(
          uniqBy(rows, "parent_part_id").map(
            (row) => row.parent_part_id
          ) as Array<string>
        )

        const materials = []
        let parentParts = []
        let childParts = []

        for (const row of rows) {
          const childRetakePartID = `${row.child_part_id}-${user?.org_id}`
          const parentRetakePartID = `${row.parent_part_id}-${user?.org_id}`
          const materialCompositionID = uuidv4()

          childParts.push({
            manufacturing_process: row.manufacturing_process?.toString(),
            origin: row.origin?.toString(),
            supplier_ids: row.supplier
              ? [`${row.supplier?.toString()}-${user?.org_id}`]
              : null,
            part_description: row.child_description?.toString(),
            retake_part_id: childRetakePartID,
            customer_part_id: row.child_part_id?.toString(),
            primary_material: row.material?.toString(),
          })

          parentParts.push({
            retake_part_id: parentRetakePartID,
            customer_part_id: row.parent_part_id?.toString(),
            part_description:
              row.parent_description?.toString() ?? "Unnamed Product",
          })

          materials.push({
            retake_part_id: childRetakePartID,
            weight_grams: rowWeight(row),
            parent_id: parentIdMap[row.parent_part_id as string],
            org_id: user?.org_id,
            lca_id: lcaMap[row.parent_part_id as string],
            level: 2,
            id: materialCompositionID,
          })
        }

        parentParts = uniqBy(parentParts, "retake_part_id")
        childParts = uniqBy(childParts, "retake_part_id")
        const suppliers = uniqBy(rows, "supplier")
          .filter((row) => (row?.supplier ?? "") !== "")
          .map((row) => ({
            id: `${row.supplier}-${user?.org_id}`,
            name: row.supplier?.toString(),
          }))

        await Promise.all([
          upsertPart(parentParts, user?.org_id),
          upsertPart(childParts, user?.org_id),
          upsertMaterialComposition(
            [
              ...uniqBy(rows, "parent_part_id").map((row) => ({
                weight_grams: sum(
                  rows
                    .filter((r) => r.parent_part_id === row.parent_part_id)
                    .map((r) => rowWeight(r))
                ),
                parent_id: null,
                org_id: user?.org_id,
                lca_id: lcaMap[row.parent_part_id as string],
                level: 1,
                id: parentIdMap[row.parent_part_id as string],
                retake_part_id: `${row.parent_part_id}-${user?.org_id}`,
              })),
            ],
            user?.org_id
          ),
          upsertMaterialComposition(materials, user?.org_id),
          upsertSupplier(suppliers, user?.org_id),
        ])
      }}
      onSuccess={onSuccess}
    >
      <Button text="Next Step: Upload" color="indigo" disabled={disabled} />
    </Flatfile>
  )
}
