import {
  Card,
  Flex,
  Metric,
  Text,
  ColGrid,
  Title,
  BarChart,
} from "@tremor/react"
import { useRouter } from "next/router"

import Layout from "@/components/layouts/sidebar"
import Breadcrumbs from "@/components/breadcrumbs/panels"
import { main, facility } from "lib/constants/routes"

const mockFacilitiesData = [
  {
    Year: "2017",
    Fuel: 5076,
    Refrigerants: 521,
    Utilities: 2082,
    Waste: 160,
  },
  {
    Year: "2018",
    Fuel: 6453,
    Refrigerants: 655,
    Utilities: 3344,
    Waste: 90,
  },
  {
    Year: "2019",
    Fuel: 4056,
    Refrigerants: 769,
    Utilities: 1969,
    Waste: 43,
  },
  {
    Year: "2020",
    Fuel: 7748,
    Refrigerants: 734,
    Utilities: 2326,
    Waste: 70,
  },
  {
    Year: "2021",
    Fuel: 5406,
    Refrigerants: 491,
    Utilities: 3187,
    Waste: 99,
  },
  {
    Year: "2022",
    Fuel: 7689,
    Refrigerants: 801,
    Utilities: 2327,
    Waste: 21,
  },
  {
    Year: "2023",
    Fuel: 6535,
    Refrigerants: 764,
    Utilities: 3515,
    Waste: 95,
  },
]

export default () => {
  const router = useRouter()
  const { id } = router.query as { id: string }

  return (
    <>
      <Layout
        mainNavigation={main}
        pageNavigation={facility(id as string)}
        name={"Facility"}
      >
        <div className="p-6">
          <Breadcrumbs
            steps={facility(id)
              .slice(1)
              .map((item, index) => ({ ...item, complete: index < 2 }))}
          />
          <ColGrid numColsSm={2} numColsLg={3} gapX="gap-x-6" marginTop="mt-6">
            <Card shadow={false}>
              <Text>Total Emissions (2022)</Text>
              <Flex
                justifyContent="justify-start"
                spaceX="space-x-2"
                marginTop="mt-1"
              >
                <Metric>5204</Metric>
                <Text marginTop="mt-2">tCO2e</Text>
              </Flex>
            </Card>
            <Card shadow={false}>
              <Text>Number of Employees</Text>
              <Flex
                justifyContent="justify-start"
                spaceX="space-x-2"
                marginTop="mt-1"
              >
                <Metric>1200</Metric>
                <Text marginTop="mt-2">people</Text>
              </Flex>
            </Card>
            <Card shadow={false}>
              <Text>Emissions per Employee</Text>
              <Flex
                justifyContent="justify-start"
                spaceX="space-x-2"
                marginTop="mt-1"
              >
                <Metric>4.33</Metric>
                <Text marginTop="mt-2">tCO2e</Text>
              </Flex>
            </Card>
          </ColGrid>
          <Card marginTop="mt-6">
            <Title>Global Warming by Category over Time</Title>
            <BarChart
              marginTop="mt-6"
              data={mockFacilitiesData}
              dataKey="Year"
              categories={["Fuel", "Refrigerants", "Utilities", "Waste"]}
              stack={false}
              valueFormatter={(value) => `${value} tCO2e`}
              colors={["blue", "cyan", "indigo", "rose", "teal", "sky"]}
            />
          </Card>
        </div>
      </Layout>
    </>
  )
}
