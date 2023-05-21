import Layout from "@/components/layouts/sidebar"
import InputsTable from "@/components/tables/inventory"

import { main, data } from "lib/constants/routes"
import withAuth from "@/components/auth/withAuth"
import Header from "@/components/headers/inventory"

export default withAuth(() => {
  return (
    <>
      <Layout
        mainNavigation={main}
        pageNavigation={data}
        name="Data"
        header={<Header />}
      >
        <div className="p-6 relative">
          <InputsTable />
        </div>
      </Layout>
    </>
  )
})
