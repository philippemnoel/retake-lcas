import { useRouter } from "next/router"

import Layout from "@/components/layouts/sidebar"
import StationaryTable from "@/components/tables/stationary"
import Breadcrumbs from "@/components/breadcrumbs/panels"

import { main, facility } from "lib/constants/routes"

const mockFuelData = [
  {
    fuel: "Natural Gas",
    year: 2017,
    location: "Oklahoma, US",
    quantity: 3986,
    units: "m3",
    impact: 290,
  },
  {
    fuel: "Gasoline",
    year: 2017,
    location: "Oklahoma, US",
    quantity: 327,
    units: "gallons",
    impact: 70,
  },
  {
    fuel: "Natural Gas",
    year: 2018,
    location: "Oklahoma, US",
    quantity: 4379,
    units: "m3",
    impact: 310,
  },
  {
    fuel: "Gasoline",
    year: 2018,
    location: "Oklahoma, US",
    quantity: 431,
    units: "gallons",
    impact: 90,
  },
  {
    fuel: "Natural Gas",
    year: 2019,
    location: "Oklahoma, US",
    quantity: 3645,
    units: "m3",
    impact: 260,
  },
  {
    fuel: "Gasoline",
    year: 2019,
    location: "Oklahoma, US",
    quantity: 521,
    units: "gallons",
    impact: 110,
  },
  {
    fuel: "Natural Gas",
    year: 2020,
    location: "Oklahoma, US",
    quantity: 4039,
    units: "m3",
    impact: 290,
  },
  {
    fuel: "Gasoline",
    year: 2020,
    location: "Oklahoma, US",
    quantity: 376,
    units: "gallons",
    impact: 80,
  },
  {
    fuel: "Natural Gas",
    year: 2021,
    location: "Oklahoma, US",
    quantity: 3667,
    units: "m3",
    impact: 260,
  },
  {
    fuel: "Gasoline",
    year: 2021,
    location: "Oklahoma, US",
    quantity: 457,
    units: "gallons",
    impact: 100,
  },
  {
    fuel: "Natural Gas",
    year: 2022,
    location: "Oklahoma, US",
    quantity: 3792,
    units: "m3",
    impact: 270,
  },
  {
    fuel: "Gasoline",
    year: 2022,
    location: "Oklahoma, US",
    quantity: 422,
    units: "gallons",
    impact: 90,
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
        name={id as string}
      >
        <div className="p-6">
          <Breadcrumbs
            current={0}
            steps={facility(id)
              .slice(1)
              .map((item, index) => ({ ...item, complete: index < 2 }))}
          />
          <div className="mt-6"></div>
          <StationaryTable data={mockFuelData} />
        </div>
      </Layout>
    </>
  )
}
