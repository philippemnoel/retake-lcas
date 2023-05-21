import { UseType } from "lib/types/supabase-row.types"

const lookupUseTypeDescription = (useType: UseType | null | undefined) => {
  switch (useType) {
    case "WATER":
      return "Water"
    case "NATURAL_GAS":
      return "Natural Gas"
    case "PETROL":
      return "Petrol"
    case "ELECTRICITY":
      return "Electricity"
    default:
      return ""
  }
}

const lookupUseTypeUnits = (useType: UseType | null | undefined) => {
  const units: Record<UseType, string> = {
    WATER: "kg",
    NATURAL_GAS: "mj",
    PETROL: "kg",
    ELECTRICITY: "kWh",
  }

  if (!useType) return ""
  return units[useType] ?? ""
}

export { lookupUseTypeDescription, lookupUseTypeUnits }
