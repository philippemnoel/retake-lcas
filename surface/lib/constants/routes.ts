import {
  Cog8ToothIcon,
  ChartPieIcon,
  CircleStackIcon,
  Square3Stack3DIcon,
  DocumentChartBarIcon,
  ScaleIcon,
} from "@heroicons/react/24/outline"

import { isDevelopment } from "lib/utils"
import { CMLTotalResultsData } from "lib/types/supabase-row.types"

const product = (item: CMLTotalResultsData) => [
  {
    name: "Materials",
    href: `/data/products/${item.lca_id}/materials`,
    id: "A1",
    complete: item.materials_completed ?? false,
  },
  {
    name: "Transport",
    href: `/data/products/${item.lca_id}/transportation`,
    id: "A2",
    complete: item.transportation_completed ?? false,
  },
  {
    name: "Manufacturing",
    href: `/data/products/${item.lca_id}/manufacturing`,
    id: "A3",
    complete: item.manufacturing_completed ?? false,
  },
  {
    name: "Use",
    href: `/data/products/${item.lca_id}/use`,
    id: "B",
    complete: item.use_phase_completed ?? false,
  },
  {
    name: "End of Life",
    href: `/data/products/${item.lca_id}/disposal`,
    id: "C",
    complete: item.end_of_life_completed ?? false,
  },
  {
    name: "Results",
    href: `/data/products/${item.lca_id}/results`,
    complete: false,
  },
]

const facility = (id: string) => [
  {
    name: "Overview",
    href: `/facilities/${id}/overview`,
  },
  {
    name: "Stationary Fuel",
    href: `/facilities/${id}/stationary`,
    id: "01",
  },
  {
    name: "Refrigerants",
    href: `/facilities/${id}/refrigerants`,
    id: "02",
  },
  {
    name: "Utilities",
    href: `/facilities/${id}/utilities`,
    id: "03",
  },
  {
    name: "Waste",
    href: `/facilities/${id}/waste`,
    id: "04",
  },
  {
    name: "Water",
    href: `/facilities/${id}/water`,
    id: "05",
  },
]

const dashboard = [
  {
    name: "Life Cycle Assessments",
    href: "/charts/products",
  },
  {
    name: "Inventory",
    href: "/charts/inventory",
  },
  {
    name: "Sites and Facilities",
    href: "/charts/facilities",
  },
]

const reports = [
  {
    name: "Life Cycle Assessments",
    href: "/reports/internal",
  },
  {
    name: "Inventory",
    href: "/reports/suppliers",
  },
]

const data = [
  {
    name: "Life Cycle Assessments",
    href: "/data/products",
  },
  {
    name: "Inventory",
    href: "/data/inventory",
  },
  {
    name: "Suppliers",
    href: "/data/suppliers",
  },
  {
    name: "Sites and Facilities",
    href: "/data/facilities",
  },
  ...(isDevelopment
    ? [
        {
          name: "Lifecycle Scenarios",
          href: "/data/scenarios",
        },
      ]
    : []),
]

const compliance = [
  {
    name: "EPDs",
    href: "/compliance/epd",
  },
]

const main = [
  {
    name: "Data",
    href: "/data/products",
    icon: CircleStackIcon,
    subPaths: data.map((d) => d.href),
  },
  {
    name: "Reports",
    href: "/reports/internal",
    icon: DocumentChartBarIcon,
    subPaths: reports.map((r) => r.href),
  },
  {
    name: "Dashboard",
    href: "/charts/products",
    icon: ChartPieIcon,
    subPaths: dashboard.map((d) => d.href),
  },
  ...(isDevelopment
    ? [
        {
          name: "Supply Chain Compliance",
          href: "/compliance/epd",
          icon: ScaleIcon,
          subPaths: compliance.map((c) => c.href),
        },
      ]
    : []),
  ...(isDevelopment
    ? [
        {
          name: "Integrations",
          href: "/integrations",
          icon: Square3Stack3DIcon,
          subPaths: [],
        },
      ]
    : []),
  { name: "Settings", href: "/settings", icon: Cog8ToothIcon, subPaths: [] },
]

export { main, product, facility, dashboard, reports, compliance, data }
