import {
  Methodology,
  CMLUnits,
  EFUnits,
  RMHUnits,
  CMLCategories,
  EFCategories,
  RMHCategories,
  CMLDatabaseColumns,
  EFDatabaseColumns,
  RMHDatabaseColumns,
} from "./methodologies"
import { ServiceLifeData } from "lib/types/supabase-row.types"
import {
  EndOfLifeWithImpacts,
  ManufacturingWithImpacts,
  MaterialCompositionWithImpacts,
  TransportationWithImpacts,
  UsePhaseWithImpacts,
} from "lib/types/calculator.types"

export type TableDataUnion =
  | MaterialCompositionWithImpacts
  | TransportationWithImpacts
  | ManufacturingWithImpacts
  | UsePhaseWithImpacts
  | EndOfLifeWithImpacts

export const totalColumns = (methodology: Methodology) => {
  switch (methodology) {
    case Methodology.CML:
      return Object.values(CMLDatabaseColumns).map(
        (column) => `total_${column}`
      ) as (keyof TableDataUnion)[]
    case Methodology.EF:
      return Object.values(EFDatabaseColumns).map(
        (column) => `total_${column}`
      ) as (keyof TableDataUnion)[]
    case Methodology.RMH:
      return Object.values(RMHDatabaseColumns).map(
        (column) => `total_${column}`
      ) as (keyof TableDataUnion)[]
  }
}

export const units = (methodology: Methodology, category: string) => {
  switch (methodology) {
    case Methodology.CML:
      return CMLUnits[category as CMLCategories]
    case Methodology.EF:
      return EFUnits[category as EFCategories]
    case Methodology.RMH:
      return RMHUnits[category as RMHCategories]
  }
}

export const tableName = <T>(methodology: Methodology, table: string) => {
  switch (methodology) {
    case Methodology.CML:
      return `cml_${table}` as T
    case Methodology.EF:
      return `ef_${table}` as T
    case Methodology.RMH:
      return `rmh_${table}` as T
  }
}

export const emptyTable = <T extends TableDataUnion>(
  methodology: Methodology
): TableDataUnion => {
  const TOTAL_COLUMNS = totalColumns(methodology)
  return TOTAL_COLUMNS.reduce((acc, curr) => {
    acc[curr] = null
    return acc
  }, {} as T)
}

export const sumTable = <T extends TableDataUnion>(
  methodology: Methodology,
  table?: T[] | null
): TableDataUnion => {
  if (!table) return emptyTable(methodology)

  const TOTAL_COLUMNS = totalColumns(methodology)

  return table.reduce((acc: T, curr: any) => {
    for (const key of TOTAL_COLUMNS) {
      acc[key] = (acc[key] || 0) + (curr[key] || 0)
    }

    return acc
  }, {} as T)
}

export const sumLca = (
  methodology: Methodology,
  tables: {
    materials?: Array<MaterialCompositionWithImpacts>
    transportations?: Array<TransportationWithImpacts>
    facilities?: Array<ManufacturingWithImpacts>
    service_life?: Array<ServiceLifeData>
    uses?: Array<UsePhaseWithImpacts>
    disposals?: Array<EndOfLifeWithImpacts>
  }
) => {
  const material = tables.materials?.[0] ?? emptyTable(methodology)
  const transportation = sumTable(methodology, tables.transportations)
  const facility = sumTable(methodology, tables.facilities)

  const use = tables.service_life?.[0]?.has_use_phase
    ? sumTable(methodology, tables.uses)
    : emptyTable(methodology)
  const disposal = sumTable(methodology, tables.disposals)
  const lca = sumTable(methodology, [
    material,
    transportation,
    facility,
    use,
    disposal,
  ])

  return {
    material,
    transportation,
    facility,
    use,
    disposal,
    lca,
  }
}
