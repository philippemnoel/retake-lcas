import Layout from "@/components/layouts/sidebar"
import SuppliersTable from "@/components/tables/suppliers"

import { main, data } from "lib/constants/routes"
import withAuth from "@/components/auth/withAuth"

export default withAuth(() => {
  return (
    <>
      <Layout mainNavigation={main} pageNavigation={data} name="Data">
        <div className="p-6">
          <SuppliersTable />
        </div>
      </Layout>
    </>
  )
})
