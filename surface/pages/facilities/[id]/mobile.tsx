import { useRouter } from "next/router"
import Layout from "@/components/layouts/sidebar"
import Breadcrumbs from "@/components/breadcrumbs/panels"

import { main, facility } from "lib/constants/routes"

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
            current={1}
            steps={facility(id)
              .slice(1)
              .map((item, index) => ({ ...item, complete: index < 2 }))}
          />
        </div>
      </Layout>
    </>
  )
}
