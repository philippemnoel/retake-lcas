import Layout from "@/components/layouts/sidebar"
import FacilitiesTable from "@/components/tables/facilities"

import { main, data } from "lib/constants/routes"
import withAuth from "@/components/auth/withAuth"

export default withAuth(() => {
  return (
    <>
      <Layout mainNavigation={main} pageNavigation={data} name="Data">
        <div className="p-6">
          <FacilitiesTable />
        </div>
      </Layout>
    </>
  )
})
