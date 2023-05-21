import Layout from "@/components/layouts/sidebar"
import LCATable from "@/components/tables/products"

import { main, data } from "lib/constants/routes"
import withAuth from "@/components/auth/withAuth"
import Header from "@/components/headers/lca"

export default withAuth(() => {
  return (
    <>
      <Layout
        mainNavigation={main}
        pageNavigation={data}
        name="Data"
        header={<Header />}
      >
        <div className="p-6">
          <LCATable />
        </div>
      </Layout>
    </>
  )
})
