import {
  CMLImpact,
  EFImpact,
  RMHImpact,
  MaterialCompositionWithImpacts,
} from "lib/types/calculator.types"
import {
  CMLMaterialCompositionWithFactors,
  EFMaterialCompositionWithFactors,
  RMHMaterialCompositionWithFactors,
} from "lib/types/supabase-row.types"

import {
  CMLDatabaseColumns,
  EFDatabaseColumns,
  Methodology,
  RMHDatabaseColumns,
} from "lib/calculator/methodologies"

type Impact = CMLImpact | EFImpact | RMHImpact

type MaterialCompositionWithFactors =
  | CMLMaterialCompositionWithFactors
  | EFMaterialCompositionWithFactors
  | RMHMaterialCompositionWithFactors

type Node = MaterialCompositionWithImpacts

enum DataSource {
  Supplier = "supplier",
  Database = "database",
  Mixed = "mixed",
}

const columns = (methodology: Methodology) => {
  switch (methodology) {
    case Methodology.CML:
      return CMLDatabaseColumns
    case Methodology.EF:
      return EFDatabaseColumns
    case Methodology.RMH:
      return RMHDatabaseColumns
  }
}

const GRAMS_IN_KG = 1000

const calculateImpact = (impact: number, weight: number) =>
  (impact * weight) / GRAMS_IN_KG

const calculateAllImpacts = (node: Node, methodology: Methodology) => {
  const FactorColumns = Object.values(columns(methodology)) as Array<
    keyof MaterialCompositionWithFactors
  >

  for (const column of FactorColumns) {
    const totalImpactColumn = `total_${column}` as keyof Impact
    node[totalImpactColumn] = calculateImpact(
      Number(node[column]),
      node.weight_grams ?? 0
    )
  }
  return node
}

const processNode = (
  node: Node,
  lookup: Map<string, Node>,
  methodology: Methodology
) => {
  const children: Array<Node> = Array.from(lookup.values()).filter(
    (child) => child.parent_id === node.id
  )

  const ImpactColumns = Object.values(columns(methodology)).map(
    (column) => `total_${column}`
  ) as Array<keyof Impact>

  if (node.is_supplier_specific) {
    node.impact_source = DataSource.Supplier
    node = calculateAllImpacts(node, methodology)
  } else {
    if (children.length === 0) {
      node.impact_source = DataSource.Database
      node = calculateAllImpacts(node, methodology)
    } else {
      for (const column of ImpactColumns) {
        node[column] = 0
      }
      for (const child of children) {
        processNode(child, lookup, methodology)
        for (const column of ImpactColumns) {
          node[column] += child[column]
        }
        if (child.impact_source !== DataSource.Database) {
          node.impact_source = DataSource.Mixed
        }
      }
      if (!node.impact_source) {
        node.impact_source = DataSource.Database
      }
    }
  }

  node.is_leaf = children.length === 0
}

const processTree = (
  root: Partial<Node>,
  tree: Array<Partial<Node>>,
  methodology: Methodology
): Array<Node> => {
  const lookup = new Map()
  for (const node of tree) {
    lookup.set(node.id, { ...node })
  }
  const rootNodeId = root.id
  processNode(lookup.get(rootNodeId), lookup, methodology)
  return Array.from(lookup.values())
}

export { processTree, columns }
