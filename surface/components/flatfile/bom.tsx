import { Button } from "@tremor/react"
import { useUser } from "@auth0/nextjs-auth0"
import { v4 as uuidv4 } from "uuid"
import uniqBy from "lodash.uniqby"

import {
  upsertMaterialComposition,
  upsertPart,
  upsertSupplier,
} from "lib/api/upsert"
import Flatfile from "../flatfile"
import { RecordsChunk } from "@flatfile/sdk"
import { withRetakePartId } from "lib/calculator/data"

export default ({
  disabled,
  partId,
  weight,
  description,
  onSuccess,
}: {
  disabled: boolean
  partId: string
  weight?: number
  description: string
  onSuccess: () => void
}) => {
  const { user } = useUser()

  let lcaMap: Record<string, string> = {}
  let parentId: string

  const addLcaId = (partIds: Array<string>) => {
    const clonedLcaMap = { ...lcaMap }
    for (const partId of partIds) {
      if (!clonedLcaMap.hasOwnProperty(partId)) clonedLcaMap[partId] = uuidv4()
    }
    lcaMap = clonedLcaMap
  }

  const onUploadClick = async () => {
    if (disabled) return false

    parentId = uuidv4()
    return true
  }

  const onFlatfileChunk = async (chunk: RecordsChunk) => {
    const rows = chunk.records.map((row) => row.data)
    addLcaId([partId])

    const retakeParentID = `${partId}-${user?.org_id}`

    const materials = []
    let parts = []

    for (const row of rows) {
      const materialCompositionID = uuidv4()

      const part = withRetakePartId({
        manufacturing_process: row.manufacturing_process?.toString() ?? null,
        origin: row.origin?.toString() ?? null,
        supplier_ids: row.supplier ? [`${row.supplier}-${user?.org_id}`] : [],
        part_description: row.description?.toString() ?? null,
        customer_part_id: row.part_id?.toString() ?? null,
        primary_material: row.material?.toString() ?? null,
      })

      const materialComposition = {
        weight_grams: row.weight_kilograms
          ? Number(row.weight_kilograms) * 1000
          : row.weight_grams
          ? Number(row.weight_grams)
          : null,
        level: 2,
        id: materialCompositionID,
        parent_id: parentId,
        lca_id: lcaMap[partId],
        retake_part_id: part.retake_part_id,
      }

      parts.push(part)
      materials.push(materialComposition)
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
      upsertPart(
        [
          {
            customer_part_id: partId,
            retake_part_id: retakeParentID,
            part_description: description,
          },
        ],
        user?.org_id
      ),
      upsertPart(parts, user?.org_id),
      upsertMaterialComposition(materials, user?.org_id),
      upsertMaterialComposition(
        [
          {
            weight_grams: weight,
            parent_id: null,
            org_id: user?.org_id,
            lca_id: lcaMap[partId],
            level: 1,
            id: parentId,
            retake_part_id: retakeParentID,
          },
        ],
        user?.org_id
      ),
      upsertSupplier(suppliers, user?.org_id),
    ])
  }

  return (
    <Flatfile
      embedId={process.env.BOM_EMBED_ID ?? ""}
      onBeforeUpload={onUploadClick}
      onChunk={onFlatfileChunk}
      onSuccess={onSuccess}
    >
      <Button text="Next Step: Upload" color="indigo" disabled={disabled} />
    </Flatfile>
  )
}
