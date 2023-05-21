import { Card, Title, BarChart, Flex, Badge, Button } from "@tremor/react"
import { useRouter } from "next/router"
import sortBy from "lodash.sortby"

import Layout from "@/components/layouts/sidebar"
import Breadcrumbs from "@/components/breadcrumbs/panels"
import LCATable from "@/components/tables/results"
import Header from "@/components/headers/product"
import withAuth from "@/components/auth/withAuth"
import { usePart } from "@/components/hooks"

import { main, product } from "lib/constants/routes"
import { useQuery, useLCAResults } from "@/components/hooks"
import { Database } from "lib/types/database.types"
import { formatNumber } from "lib/utils"
import { Methodology } from "lib/calculator/methodologies"
import { TableDataUnion, tableName } from "lib/calculator/results"
import { MaterialCompositionWithImpacts } from "lib/types/calculator.types"

export default withAuth(() => {
  const router = useRouter()
  const { lca_id: lcaID } = router.query as { lca_id: string }
  const { part } = usePart(lcaID)

  const { data: materialsData } = useQuery<TableDataUnion>(
    tableName(Methodology.CML, "materials_results"),
    {
      lca_id: lcaID,
    }
  )

  const { data: subMaterials } = useLCAResults<MaterialCompositionWithImpacts>(
    "materials",
    {
      lca_id: lcaID,
      methodology: Methodology.CML,
    }
  )

  const { data: transportData } = useQuery<TableDataUnion>(
    tableName(Methodology.CML, "transportation_results"),
    {
      lca_id: lcaID,
    }
  )

  const { data: manufacturingData } = useQuery<TableDataUnion>(
    tableName(Methodology.CML, "manufacturing_results"),
    {
      lca_id: lcaID,
    }
  )

  const { data: useData } = useQuery<TableDataUnion>(
    tableName(Methodology.CML, "use_phase_results"),
    {
      lca_id: lcaID,
    }
  )

  const { data: disposalData } = useQuery<TableDataUnion>(
    tableName(Methodology.CML, "end_of_life_results"),
    {
      lca_id: lcaID,
    }
  )

  const { data: serviceLife } = useQuery<
    Database["public"]["Tables"]["service_life"]["Row"]
  >("service_life", {
    lca_id: lcaID,
  })

  const material = materialsData?.[0]
  const transport = transportData?.[0]
  const manufacturing = manufacturingData?.[0]
  const use = useData?.[0]
  const disposal = disposalData?.[0]

  const lifeCycleData = [
    {
      kgCO2e: material?.["total_global_warming"],
      Stage: "Materials",
    },
    {
      kgCO2e: transport?.["total_global_warming"],
      Stage: "Transportation",
    },
    {
      kgCO2e: manufacturing?.["total_global_warming"],
      Stage: "Manufacturing",
    },
    {
      kgCO2e: serviceLife?.[0]?.has_use_phase
        ? use?.["total_global_warming"]
        : 0,
      Stage: "Use Phase",
    },
    {
      kgCO2e: disposal?.["total_global_warming"],
      Stage: "End of Life",
    },
  ]

  const materialData = sortBy(
    subMaterials
      ?.filter((material) => material.level === 2)
      .map((material) => ({
        kgCO2e: material?.["total_global_warming"],
        Material: material.part_description ?? material.primary_material,
      })),
    "kgCO2e"
  ).reverse()

  if (part === undefined)
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Button loading={true} color="indigo" size="xl" variant="light" />
      </div>
    )

  return (
    <>
      <Layout
        mainNavigation={main}
        pageNavigation={undefined}
        name="Results"
        header={<Header />}
      >
        <div className="p-6">
          <Flex justifyContent="justify-start" spaceX="space-x-4">
            <Title>{part?.part_description ?? "Unnamed Product"}</Title>
            <Badge
              text={part?.customer_part_id ?? ""}
              color="indigo"
              size="sm"
            />
          </Flex>
          <div className="mt-4"></div>
          <Breadcrumbs
            current={5}
            steps={product(part).map((item) => ({
              ...item,
            }))}
          />
          <Card marginTop="mt-6">
            <Title>Global Warming by Lifecycle Stage</Title>
            <BarChart
              marginTop="mt-2"
              data={lifeCycleData}
              dataKey="Stage"
              categories={["kgCO2e"]}
              stack={false}
              valueFormatter={(value) => `${formatNumber(value)} kgCO2e`}
              colors={["indigo"]}
              layout="vertical"
              yAxisWidth="w-24"
            />
          </Card>
          <Card marginTop="mt-6" hFull={true}>
            <Title>Global Warming by Material</Title>
            <BarChart
              marginTop="mt-2"
              data={materialData ?? []}
              dataKey="Material"
              categories={["kgCO2e"]}
              valueFormatter={(value) => `${formatNumber(value)} kgCO2e`}
              colors={["blue"]}
              layout="vertical"
              yAxisWidth="w-56"
            />
          </Card>
          <div className="mt-6"></div>
          <LCATable lcaID={lcaID} partDescription={part.part_description} />
        </div>
      </Layout>
    </>
  )
})
