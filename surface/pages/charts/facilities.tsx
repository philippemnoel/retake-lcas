import {
  Card,
  BarChart,
  Title,
  Text,
  Subtitle,
  Button,
  Flex,
} from "@tremor/react"
import Link from "next/link"
import sortBy from "lodash.sortby"

import Layout from "@/components/layouts/sidebar"
import Empty from "@/components/empty"
import withAuth from "@/components/auth/withAuth"
import Skeleton from "@/components/skeletons/chart"
import { useQuery } from "@/components/hooks"

import { main, dashboard } from "lib/constants/routes"
import { formatNumber, truncateText } from "lib/utils"
import { FacilityEnergyWithImpactsData } from "lib/types/supabase-row.types"
import { Methodology } from "lib/calculator/methodologies"
import { useEffect } from "react"

const rowLimit = 15
const yAxisCharacterLimit = 35
const methodology = Methodology.CML

const ImpactChart = ({
  facilities,
  column,
  title,
  units,
}: {
  facilities: Array<FacilityEnergyWithImpactsData> | undefined
  column: keyof FacilityEnergyWithImpactsData
  title: string
  units: string
}) => {
  const perProductImpact = sortBy(
    facilities?.map((product) => ({
      Description: truncateText(
        `${product.name} (${product.location})`,
        yAxisCharacterLimit
      ),
      Impact: product[column],
    })),
    "Impact"
  ).reverse()

  return (
    <Card marginTop="mt-6" shadow={false}>
      <Title>{title}</Title>
      <Text>
        Measured in {units} per facility in {new Date().getFullYear() - 1}
      </Text>
      {!facilities && <Skeleton marginTop="mt-6" />}
      {!facilities ||
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
            showLegend={false}
          />
        ))}
      {facilities?.length === 0 && (
        <div className="pb-16">
          <Empty
            title="No facilities Found"
            description="Once created, Retake will automatically begin the data collection process to perform a life cycle assessment (LCA) on a product."
            buttons={[
              <Link href="/data/facilities" key={0}>
                <Button text="Go to facilities" color="indigo" />
              </Link>,
            ]}
          />
        </div>
      )}
    </Card>
  )
}

export default withAuth(() => {
  const { data: facilities, refresh } = useQuery<FacilityEnergyWithImpactsData>(
    "cml_facility_energy_with_impacts"
  )

  const selectedfacilities = facilities
    ?.filter(
      (product) =>
        product.total_global_warming !== null && product.name !== null
    )
    ?.slice(0, Math.min(rowLimit, facilities.length))

  useEffect(() => {
    refresh()
  }, [methodology])

  return (
    <>
      <Layout mainNavigation={main} pageNavigation={dashboard} name="Charts">
        <div className="p-6">
          <Flex>
            <Title>Sites and Facilities</Title>
          </Flex>
          <Subtitle>Per-facility impacts and resource consumption</Subtitle>
          <ImpactChart
            facilities={selectedfacilities}
            title={"Annual Global Warming Impact"}
            column={"total_global_warming"}
            units="kg CO2-Eq"
          />
          <ImpactChart
            facilities={selectedfacilities}
            title={"Annual Electricity Consumption"}
            column={"quantity_kwh"}
            units="kWh"
          />
          <ImpactChart
            facilities={selectedfacilities}
            title={"Annual Natural Gas Consumption"}
            column={"quantity_mj"}
            units="MJ"
          />
        </div>
      </Layout>
    </>
  )
})
