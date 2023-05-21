import { randomUUID } from "crypto"

export enum TransportFactor {
  AIR = "3e499a2e-d848-4179-ae85-d6585af488c6",
  SEA = "7884f94c-1c9d-4d8e-89e7-8eab2fac8f7f",
  ROAD = "25b22cba-fee9-4ba2-b487-baf8462099ed",
  RAIL = "83c83c17-7b60-46ab-a75b-b792183d6c04",
}

export enum ManufacturingFactor {
  GAS = "c20681fa-f381-460c-8178-e8490588368a",
  ELECTRICITY = "03e70d93-ee5f-427d-ac37-165c3d35fd3d",
}

export enum UseFactor {
  PETROL = "dfbc4765-d9d7-4b5c-9926-66857b282e1d",
  WATER = "dfbc4765-d9d7-4b5c-9926-66857b282e1d",
  ELECTRICITY = "dfbc4765-d9d7-4b5c-9926-66857b282e1d",
  GAS = "dfbc4765-d9d7-4b5c-9926-66857b282e1d",
}

export enum EndOfLifeFactor {
  INCINERATION = "6afd9bca-c005-4be2-8f7b-49d91acc1619",
  LANDFILL = "0348c176-389b-4970-b0d1-0a0af655964b",
  RECYCLING = "031b7961-40b8-48d2-b2f1-766c843c5474",
}

// A simple object which can be used as an input for an LCA calculator test.
// The object can be arbitrarily nested, as can material compositions in the app.
export type MaterialsSpec = {
  weight_grams: number
  subcomponents?: MaterialsSpec[]
}

// The weight_grams must match a materials entry.
export type TransportSpec = {
  weight_grams: number
  distance_km: number
  factor: TransportFactor
}

// A mock facility will automatically be created.
export type ManufacturingSpec = {
  quantity_kwh: number
  quantity_mj: number
  percent_renewable: number
  percent_revenue: number
  quantity_produced: number
}

// Automatically creates a service life.
export type UseSpec = {
  service_life_quantity: number
  use_quantity: number
  factor: UseFactor
}

// The weight_grams must match a materials entry.
export type EndOfLifeSpec = {
  weight_grams: number
  factor: EndOfLifeFactor
}

// Makes a mock entity for the "parts" table.
// Takes a org_id, generates other fields randomly.
export const makePart = (lca: { org_id: string }) => {
  const suffix = randomUUID().slice(0, 10)
  const part_description = `part_description_${suffix}`
  const customer_part_id = `customer_part_id_${suffix}`
  const retake_part_id = `${customer_part_id}-${lca.org_id}`

  return {
    part_description,
    customer_part_id,
    org_id: lca.org_id,
    retake_part_id,
  }
}

// Makes mock entities fot the "parts" and "material_composition" tables.
// Given an org_id and a simple specification for weights/subcomponents,
// returns two lists of inter-dependent parts and compositions.
export const makeCompositions = (
  lca: { org_id: string },
  rootSpec: MaterialsSpec
) => {
  const lca_id = randomUUID()
  const parts: any[] = []
  const materials: any[] = []

  // Because material compositions are nested, we need to recurse through the
  // input subcomponents to construct mock entities to post to the database.
  const make = (
    level: number,
    parent_id: string | null,
    spec: MaterialsSpec
  ) => {
    const id = randomUUID()
    const part = makePart({ org_id: lca.org_id })
    const material = {
      id,
      org_id: lca.org_id,
      lca_id,
      parent_id,
      level,
      weight_grams: spec.weight_grams,
      retake_part_id: part.retake_part_id,
    }

    parts.push(part)
    materials.push(material)

    spec.subcomponents?.forEach((s) => make(level + 1, id, s))
  }

  make(1, null, rootSpec)

  return {
    lca_id,
    org_id: lca.org_id,
    parts,
    materials,
  }
}

export const makeTransport = (
  lca: {
    org_id: string
    lca_id: string
    materials: { id: string; weight_grams: number }[]
  },
  spec: TransportSpec
) => {
  const matchingMaterial = lca.materials.find(
    (m) => m.weight_grams === spec.weight_grams
  )
  if (!matchingMaterial) {
    throw new Error(
      `No matching mock material with weight_grams: ${spec.weight_grams}`
    )
  }

  return {
    transport: {
      material_composition_id: matchingMaterial.id,
      distance_km: spec.distance_km,
      transportation_type: "test-transport-type",
      org_id: lca.org_id,
      lca_id: lca.lca_id,
      factor_id: spec.factor,
    },
  }
}

export const makeManufacturing = (
  lca: { org_id: string; lca_id: string },
  spec: ManufacturingSpec
) => {
  const facilityId = randomUUID()

  const facility = {
    id: facilityId,
    org_id: lca.org_id,
    name: `test-name-${facilityId}`,
    location: `test-location-${facilityId}`,
  }

  const purchased_energy = {
    facility_id: facilityId,
    year: 2022,
    org_id: lca.org_id,
    description: "test-purchased-energy",
    quantity_kwh: spec.quantity_kwh,
    factor_id: ManufacturingFactor.ELECTRICITY,
  }

  const stationary_fuel = {
    facility_id: facilityId,
    year: 2022,
    org_id: lca.org_id,
    description: "test-stationary-fuel",
    quantity_mj: spec.quantity_mj,
    factor_id: ManufacturingFactor.GAS,
  }

  const facility_allocation = {
    facility_id: facilityId,
    org_id: lca.org_id,
    lca_id: lca.lca_id,
    percent_revenue: spec.percent_revenue,
    quantity_produced: spec.quantity_produced,
  }

  return {
    facility,
    purchased_energy,
    stationary_fuel,
    facility_allocation,
  }
}

export const makeUse = (
  lca: { org_id: string; lca_id: string },
  spec: UseSpec
) => {
  const factorToUseType = {
    [UseFactor.WATER]: "WATER",
    [UseFactor.GAS]: "NATURAL_GAS",
    [UseFactor.PETROL]: "PETROL",
    [UseFactor.ELECTRICITY]: "ELECTRICITY",
  }

  return {
    service_life: {
      quantity: spec.service_life_quantity,
      unit: "Years",
      lca_id: lca.lca_id,
      org_id: lca.org_id,
    },
    use_phase: {
      use_type: factorToUseType[spec.factor],
      quantity: spec.use_quantity,
      location: "test-location",
      percent_at_location: 100,
      factor_id: spec.factor,
      lca_id: lca.lca_id,
      org_id: lca.org_id,
    },
  }
}

export const makeEndOfLife = (
  lca: {
    org_id: string
    lca_id: string
    materials: { id: string; weight_grams: number }[]
  },
  spec: EndOfLifeSpec
) => {
  const matchingMaterial = lca.materials.find(
    (m) => m.weight_grams === spec.weight_grams
  )
  if (!matchingMaterial) {
    throw new Error(
      `No matching mock material with weight_grams: ${spec.weight_grams}`
    )
  }

  return {
    description: "test-end-of-life-description",
    weight_grams: spec.weight_grams,
    location: "test-end-of-life-location",
    lca_id: lca.lca_id,
    org_id: lca.org_id,
    factor_id: spec.factor,
  }
}

export const makeLCA = (
  org_id: string,
  specs: {
    materials: MaterialsSpec
    transport: TransportSpec[]
    manufacturing: ManufacturingSpec[]
    use: UseSpec[]
    endOfLife: EndOfLifeSpec[]
  }
) => {
  const lca = makeCompositions({ org_id }, specs.materials)
  const transportation = specs.transport.map((spec) => makeTransport(lca, spec))
  const manufacturing = specs.manufacturing.map((spec) =>
    makeManufacturing(lca, spec)
  )
  const use = specs.use.map((spec) => makeUse(lca, spec))
  const endOfLife = specs.endOfLife.map((spec) => makeEndOfLife(lca, spec))

  return {
    ...lca,
    transportation,
    manufacturing,
    use,
    endOfLife,
  }
}
