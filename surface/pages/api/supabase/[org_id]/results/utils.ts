import { z } from "zod"
import omit from "lodash.omit"

import { supabase } from "lib/api/supabase"
import { Methodology, methodologies } from "lib/calculator/methodologies"
import {
  tableName,
  sumTable,
  emptyTable,
  TableDataUnion,
} from "lib/calculator/results"
import {
  CMLTotalResultsSchema,
  EFTotalResultsSchema,
  RMHTotalResultsSchema,
  CMLCalculationsSchema,
  EFCalculationsSchema,
  RMHCalculationsSchema,
  MaterialCompositionDataSchema,
  PartsDataSchema,
  WithSupplierIdsSchema,
  MaterialCompositionTreeSchema,
} from "lib/api/schemas"
import { processTree, columns } from "./tree"

type MaterialsFactorTable =
  | "cml_material_composition_with_factors"
  | "ef_material_composition_with_factors"
  | "rmh_material_composition_with_factors"

type ImpactsTable =
  | "cml_transportation_with_impacts"
  | "ef_transportation_with_impacts"
  | "rmh_transportation_with_impacts"
  | "cml_manufacturing_with_impacts"
  | "ef_manufacturing_with_impacts"
  | "rmh_manufacturing_with_impacts"
  | "cml_use_phase_with_impacts"
  | "ef_use_phase_with_impacts"
  | "rmh_use_phase_with_impacts"
  | "cml_end_of_life_with_impacts"
  | "ef_end_of_life_with_impacts"
  | "rmh_end_of_life_with_impacts"

type ResultsTable =
  | "cml_total_results"
  | "ef_total_results"
  | "rmh_total_results"
  | "cml_materials_results"
  | "ef_materials_results"
  | "rmh_materials_results"
  | "cml_transportation_results"
  | "ef_transportation_results"
  | "rmh_transportation_results"
  | "cml_manufacturing_results"
  | "ef_manufacturing_results"
  | "rmh_manufacturing_results"
  | "cml_use_phase_results"
  | "ef_use_phase_results"
  | "rmh_use_phase_results"
  | "cml_end_of_life_results"
  | "ef_end_of_life_results"
  | "rmh_end_of_life_results"

const getMaterialCompositionWithImpacts = async (
  methodology: Methodology,
  lcaId: string
) => {
  const table = tableName<MaterialsFactorTable>(
    methodology,
    "material_composition_with_factors"
  )

  const { data: rootData } = await supabase
    .rpc(table, {
      selected_lca_id: lcaId,
    })
    .eq("level", 1)

  // Tech debt: If there are more than 500 rows, not all rows will
  // be loaded in
  const { data: tree } = await supabase.rpc(table, {
    selected_lca_id: lcaId,
  })

  const root = rootData?.[0]

  if (!root || !tree) return undefined

  const CalculationsSchema =
    methodology === Methodology.CML
      ? CMLCalculationsSchema
      : methodology === Methodology.EF
      ? EFCalculationsSchema
      : RMHCalculationsSchema

  const processedTree = processTree(root, tree, methodology)

  const MaterialCompositionWithImpactsSchema = z.array(
    MaterialCompositionDataSchema.merge(PartsDataSchema)
      .merge(CalculationsSchema)
      .merge(WithSupplierIdsSchema)
      .merge(MaterialCompositionTreeSchema)
  )
  const filteredTree = MaterialCompositionWithImpactsSchema.parse(processedTree)

  return filteredTree
}

const getLCAStageWithImpacts = async (
  methodology: Methodology,
  stage: string,
  lcaId: string
) => {
  const table = tableName<ImpactsTable>(methodology, `${stage}_with_impacts`)

  const { data, error } = await supabase.rpc(table, {
    selected_lca_id: lcaId,
  })

  if (error) return undefined
  return data
}

const fetchLCAData = (methodology: Methodology, lcaId: string) => {
  return Promise.all([
    getMaterialCompositionWithImpacts(methodology, lcaId),
    getLCAStageWithImpacts(methodology, "transportation", lcaId),
    getLCAStageWithImpacts(methodology, "manufacturing", lcaId),
    getLCAStageWithImpacts(methodology, "use_phase", lcaId),
    getLCAStageWithImpacts(methodology, "end_of_life", lcaId),
    supabase
      .from("service_life")
      .select("has_use_phase,quantity,unit")
      .eq("lca_id", lcaId)
      .limit(1),
  ])
}

const computeLCAData = (
  methodology: Methodology,
  hasUsePhase: boolean,
  materialCompositionData: Array<TableDataUnion>,
  transportationData: Array<TableDataUnion>,
  manufacturingData: Array<TableDataUnion>,
  usePhaseData: Array<TableDataUnion>,
  endOfLifeData: Array<TableDataUnion>
) => {
  const materials = materialCompositionData?.[0] ?? emptyTable(methodology)
  const transportation = sumTable(
    methodology,
    transportationData as Array<TableDataUnion>
  )
  const manufacturing = sumTable(
    methodology,
    manufacturingData as Array<TableDataUnion>
  )
  const usePhase = hasUsePhase
    ? sumTable(methodology, usePhaseData as Array<TableDataUnion>)
    : emptyTable(methodology)
  const endOfLife = sumTable(
    methodology,
    endOfLifeData as Array<TableDataUnion>
  )
  const total = sumTable(methodology, [
    materials as TableDataUnion,
    transportation,
    manufacturing,
    usePhase,
    endOfLife,
  ])

  return {
    materials,
    transportation,
    manufacturing,
    usePhase,
    endOfLife,
    total,
  }
}

const parseLCAData = (
  methodology: Methodology,
  materials: TableDataUnion,
  transportation: TableDataUnion,
  manufacturing: TableDataUnion,
  usePhase: TableDataUnion,
  endOfLife: TableDataUnion,
  total: TableDataUnion
) => {
  const TotalResultsSchema =
    methodology === Methodology.CML
      ? CMLTotalResultsSchema
      : methodology === Methodology.EF
      ? EFTotalResultsSchema
      : RMHTotalResultsSchema

  const CalculationsSchema =
    methodology === Methodology.CML
      ? CMLCalculationsSchema
      : methodology === Methodology.EF
      ? EFCalculationsSchema
      : RMHCalculationsSchema

  return {
    materials: CalculationsSchema.parse(materials),
    transportation: CalculationsSchema.parse(transportation),
    manufacturing: CalculationsSchema.parse(manufacturing),
    usePhase: CalculationsSchema.parse(usePhase),
    endOfLife: CalculationsSchema.parse(endOfLife),
    total: TotalResultsSchema.parse(total),
  }
}

const asyncUpdateLCAResults = async (lcaId: string) => {
  return await Promise.all(
    methodologies.map(async (methodology) => {
      // Fetch raw data
      const [
        materialsData,
        transportationData,
        manufacturingData,
        usePhaseData,
        endOfLifeData,
        { data: serviceLifeData },
      ] = await fetchLCAData(methodology, lcaId)

      const materialCompositionData = materialsData?.filter(
        (material) => material.level === 1
      )

      // Compute LCIA results
      const hasUsePhase = serviceLifeData?.[0]?.has_use_phase ?? false
      const computed = computeLCAData(
        methodology,
        hasUsePhase,
        materialCompositionData as Array<TableDataUnion>,
        transportationData as Array<TableDataUnion>,
        manufacturingData as Array<TableDataUnion>,
        usePhaseData as Array<TableDataUnion>,
        endOfLifeData as Array<TableDataUnion>
      )

      // Check which sections have been completed
      const materialComposition = materialCompositionData?.[0]

      const ImpactColumns = Object.values(columns(methodology)).map(
        (column) => `total_${column}`
      )

      // Fetch the long_description column from the parts table
      const { data: partsData } = await supabase
        .from("parts")
        .select("long_description")
        .eq("retake_part_id", materialComposition?.retake_part_id)
        .limit(1)

      // Validate and format data schema
      const withAddedColumns = (data: TableDataUnion) => ({
        ...omit(materialComposition, ImpactColumns),
        ...data,
        material_composition_id: materialComposition?.id ?? null,
        long_description: partsData?.[0]?.long_description,
        lca_id: lcaId,
      })

      const {
        materials,
        transportation,
        manufacturing,
        usePhase,
        endOfLife,
        total,
      } = parseLCAData(
        methodology,
        withAddedColumns(computed.materials),
        withAddedColumns(computed.transportation),
        withAddedColumns(computed.manufacturing),
        withAddedColumns(computed.usePhase),
        withAddedColumns(computed.endOfLife),
        withAddedColumns(computed.total)
      )

      // Upsert into supabase
      const options = {
        onConflict: "lca_id",
        ignoreDuplicates: false,
      }

      await Promise.all([
        supabase
          .from(tableName<ResultsTable>(methodology, "materials_results"))
          .upsert(materials, options),
        supabase
          .from(tableName<ResultsTable>(methodology, "transportation_results"))
          .upsert(transportation, options),
        supabase
          .from(tableName<ResultsTable>(methodology, "manufacturing_results"))
          .upsert(manufacturing, options),
        supabase
          .from(tableName<ResultsTable>(methodology, "use_phase_results"))
          .upsert(usePhase, options),
        supabase
          .from(tableName<ResultsTable>(methodology, "end_of_life_results"))
          .upsert(endOfLife, options),
        supabase
          .from(tableName<ResultsTable>(methodology, "total_results"))
          .upsert(total, options),
      ])
    })
  )
}

export {
  getMaterialCompositionWithImpacts,
  getLCAStageWithImpacts,
  fetchLCAData,
  computeLCAData,
  parseLCAData,
  asyncUpdateLCAResults,
}
