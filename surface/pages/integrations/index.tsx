import { Title, Subtitle } from "@tremor/react"

import Layout from "@/components/layouts/sidebar"
import Integration from "@/components/cards/accounting"

import { main } from "lib/constants/routes"
import withAuth from "@/components/auth/withAuth"

export default withAuth(() => {
  return (
    <>
      <Layout mainNavigation={main} pageNavigation={undefined}>
        <div className="p-6">
          <Title>Integrations</Title>
          <Subtitle>
            By integrating with a source, Retake automatically pulls all product
            and emissions-related data from that source in real time.
          </Subtitle>
          <div className="grid grid-cols-3 gap-6 mt-6">
            <div className="rounded-xl p-4 bg-neutral-50 col-span-3 md:col-span-1">
              <Integration />
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
})
