import Layout from "@/components/layouts/sidebar"
import ScenarioTable from "@/components/tables/scenarios"

import { main, data } from "lib/constants/routes"
import withAuth from "@/components/auth/withAuth"

const mockScenarioData = [
  {
    product_name: "Ethernet Cable",
    product_identifier: "54321-B",
    scenario_name: "Scenario A",
    created_by: "Lindsay Walton",
    global_warming_change: -48,
  },
  {
    product_name: "Fiber Optic Cable",
    product_identifier: "67890-C",
    scenario_name: "Scenario B",
    created_by: "Lindsay Walton",
    global_warming_change: -95,
  },
]

export default withAuth(() => {
  return (
    <>
      <Layout mainNavigation={main} pageNavigation={data} name="Data">
        <div className="p-6">
          <ScenarioTable data={mockScenarioData} />
        </div>
      </Layout>
    </>
  )
})
