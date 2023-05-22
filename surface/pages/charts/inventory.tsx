import {
  Card,
  BarChart,
  Title,
  Subtitle,
  Button,
  Flex,
  Metric,
  Text,
} from "@tremor/react"
import Link from "next/link"
import sortBy from "lodash.sortby"

import Layout from "@/components/layouts/sidebar"
import Empty from "@/components/empty"
import withAuth from "@/components/auth/withAuth"
import ChartSkeleton from "@/components/skeletons/chart"
import CardSkeleton from "@/components/skeletons/card"
import { useQuery } from "@/components/hooks"

import { main, dashboard } from "lib/constants/routes"
import { formatNumber, truncateText } from "lib/utils"
import {
  CMLPartsWithImpactsData,
  PartsEngagementStatusData,
} from "lib/types/supabase-row.types"
import { CMLDatabaseColumns } from "lib/calculator/methodologies"
import { units } from "lib/calculator/results"
import { Methodology } from "lib/calculator/methodologies"
import { useEffect } from "react"

const rowLimit = 15
const yAxisCharacterLimit = 35
const CMLImpactColumns = CMLDatabaseColumns
const methodology = Methodology.CML

const ImpactChart = ({
  products,
  column,
  title,
  methodology,
}: {
  products: Array<CMLPartsWithImpactsData> | undefined
  column: keyof CMLPartsWithImpactsData
  title: string
  methodology: Methodology
}) => {
  const perProductImpact = sortBy(
    products?.map((product) => ({
      Description: truncateText(
        `${product.part_description} ${
          (product.supplier_name ?? "") !== ""
            ? `(${product.supplier_name})`
            : ""
        }`,
        yAxisCharacterLimit
      ),
      Impact: product[column],
    })),
    "Impact"
  ).reverse()

  return (
    <Card marginTop="mt-6" shadow={false}>
      <Title>{title} Impact</Title>
      <Text>Measured in {units(methodology, title)} per kg</Text>
      {!products && <ChartSkeleton marginTop="mt-6" />}
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

const NumberCard = ({
  title,
  metric,
  units,
}: {
  title: string
  metric: number | null | undefined
  units: string
}) => {
  if (!metric) return <CardSkeleton />

  return (
    <Card shadow={false}>
      <Text>{title}</Text>
      <Flex justifyContent="justify-start" spaceX="space-x-2">
        <Metric marginTop="mt-1" color="indigo">
          {metric}
        </Metric>
        <Text marginTop="mt-4" color="indigo">
          {units}
        </Text>
      </Flex>
    </Card>
  )
}

export default withAuth(() => {
  const {
    data: products,
    pagination,
    refresh,
  } = useQuery<CMLPartsWithImpactsData>("cml_parts_with_impacts", {
    is_base_material: false,
  })

  const { data: engagementData } = useQuery<PartsEngagementStatusData>(
    "parts_engagement_status"
  )

  const engagement = engagementData?.[0]

  const selectedProducts = products?.slice(
    0,
    Math.min(rowLimit, products.length)
  )

  useEffect(() => {
    refresh()
  }, [methodology])

  return (
    <>
      <Layout mainNavigation={main} pageNavigation={dashboard} name="Charts">
        <div className="p-6">
          <Flex>
            <Title>Inventory</Title>
          </Flex>
          <Subtitle>
            Environmental footprints for the {selectedProducts?.length}{" "}
            highest-emitting items in your inventory
          </Subtitle>
          <Flex marginTop="mt-6" spaceX="space-x-4">
            <NumberCard
              title="Items In Inventory"
              metric={pagination.rows}
              units="item(s)"
            />
            <NumberCard
              title="With Supplier Data"
              metric={engagement?.data_received}
              units="item(s)"
            />
            <NumberCard
              title="Awaiting Supplier Data"
              metric={engagement?.awaiting_response}
              units="item(s)"
            />
            <NumberCard
              title="Without Supplier Data"
              metric={engagement?.not_engaged}
              units="item(s)"
            />
          </Flex>
          {Object.entries(CMLImpactColumns).map(([title, column], index) => (
            <ImpactChart
              products={selectedProducts}
              title={title}
              column={column as keyof CMLPartsWithImpactsData}
              methodology={methodology}
              key={index}
            />
          ))}
        </div>
      </Layout>
    </>
  )
})
