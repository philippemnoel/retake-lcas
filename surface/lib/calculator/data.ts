import { v4 as uuidv4 } from "uuid"

const withRetakePartId = <
  T extends Record<string, any> & { retake_part_id?: string | null }
>(
  values?: T,
  orgId?: string | null
): T & { retake_part_id?: string } => ({
  ...(values as T),
  retake_part_id:
    values?.retake_part_id ??
    `${values?.customer_part_id ?? uuidv4()}-${orgId}`,
})

export { withRetakePartId }
