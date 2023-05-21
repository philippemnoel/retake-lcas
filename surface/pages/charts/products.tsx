import {
  Card,
  BarChart,
  Title,
  Text,
  Subtitle,
  Button,
  Flex,
  Dropdown,
  DropdownItem,
} from "@tremor/react"
import Link from "next/link"
import mapValues from "lodash.mapvalues"
import sortBy from "lodash.sortby"

import Layout from "@/components/layouts/sidebar"
import Empty from "@/components/empty"
import withAuth from "@/components/auth/withAuth"
import Skeleton from "@/components/skeletons/chart"
import { useQuery } from "@/components/hooks"

import { main, dashboard } from "lib/constants/routes"
import { formatNumber, truncateText } from "lib/utils"
import {
  CMLTotalResultsData,
  EFTotalResultsData,
  RMHTotalResultsData,
} from "lib/types/supabase-row.types"
import {
  CMLDatabaseColumns,
  EFDatabaseColumns,
  RMHDatabaseColumns,
  methodologies,
} from "lib/calculator/methodologies"
import { units } from "lib/calculator/results"
import { Methodology } from "lib/calculator/methodologies"
import { useEffect, useState } from "react"

type TotalResultsData =
  | CMLTotalResultsData
  | EFTotalResultsData
  | RMHTotalResultsData

const rowLimit = 15
const yAxisCharacterLimit = 35
const CMLImpactColumns = mapValues(
  CMLDatabaseColumns,
  (value) => `total_${value}`
) as Record<string, keyof CMLTotalResultsData>
const EFImpactColumns = mapValues(
  EFDatabaseColumns,
  (value) => `total_${value}`
) as Record<string, keyof EFTotalResultsData>
const RMHImpactColumns = mapValues(
  RMHDatabaseColumns,
  (value) => `total_${value}`
) as Record<string, keyof RMHTotalResultsData>

const ImpactChart = ({
  products,
  column,
  title,
  methodology,
}: {
  products: Array<TotalResultsData> | undefined
  column: keyof TotalResultsData
  title: string
  methodology: Methodology
}) => {
  const perProductImpact = sortBy(
    products?.map((product) => ({
      Description: truncateText(
        product.part_description ?? "",
        yAxisCharacterLimit
      ),
      Impact: product[column],
    })),
    "Impact"
  ).reverse()

  return (
    <Card marginTop="mt-6" shadow={false}>
      <Title>{title} Impact</Title>
      <Text>Measured in {units(methodology, title)} per Declared Unit</Text>
      {!products && <Skeleton marginTop="mt-6" />}
      {!products ||
        (perProductImpact?.length > 0 && (
          <BarChart
            marginTop="mt-6"
            data={perProductImpact ?? []}
            dataKey="Description"
            categories={["Impact"]}
            stack={false}
            valueFormatter={(value) => `${formatNumber(value)} kg CO2-Eq`}
            colors={["indigo"]}
            layout="vertical"
            yAxisWidth="w-56"
            height="h-96"
          />
        ))}
      {products?.length === 0 && (
        <div className="pb-16">
          <Empty
            title="No Products Found"
            description="Once created, Retake will automatically begin the data collection process to perform a life cycle assessment (LCA) on a product."
            buttons={[
              <Link href="/data/products" key={0}>
                <Button text="Go to Products" color="indigo" />
              </Link>,
            ]}
          />
        </div>
      )}
    </Card>
  )
}

export default withAuth(() => {
  const [methodology, setMethodology] = useState(Methodology.CML)
  const table =
    methodology === Methodology.CML
      ? "cml_total_results"
      : methodology === Methodology.EF
      ? "ef_total_results"
      : "rmh_total_results"
  const columns =
    methodology === Methodology.CML
      ? CMLImpactColumns
      : methodology === Methodology.EF
      ? EFImpactColumns
      : RMHImpactColumns

  const { data: products, refresh } = useQuery<CMLTotalResultsData>(table)

  const selectedProducts = products
    ?.filter(
      (product) =>
        product.total_global_warming !== null &&
        product.customer_part_id !== null &&
        product.manufacturing_completed &&
        product.transportation_completed &&
        product.materials_completed &&
        product.use_phase_completed &&
        product.end_of_life_completed
    )
    ?.slice(0, Math.min(rowLimit, products.length))

  useEffect(() => {
    refresh()
  }, [methodology])

  return (
    <>
      <Layout mainNavigation={main} pageNavigation={dashboard} name="Charts">
        <div className="p-6">
          <Flex>
            <Title>Life Cycle Assessments</Title>
            <div className="relative bottom-1">
              <Dropdown
                maxWidth="max-w-xs"
                placeholder="Select Methodology"
                value={methodology}
                onValueChange={(value) => setMethodology(value)}
              >
                {methodologies.map((item, index) => (
                  <DropdownItem text={item} value={item} key={index} />
                ))}
              </Dropdown>
            </div>
          </Flex>
          <Subtitle>
            LCIA results for the {selectedProducts?.length} highest-emitting
            products manufactured by your organization. Only completed LCAs are
            shown.
          </Subtitle>
          {Object.entries(columns).map(([title, column], index) => (
            <ImpactChart
              products={selectedProducts}
              title={title}
              column={column as keyof TotalResultsData}
              methodology={methodology}
              key={index}
            />
          ))}
        </div>
      </Layout>
    </>
  )
})
