import { useRouter } from "next/router"
import { Title, Badge, Flex, Button } from "@tremor/react"

import Layout from "@/components/layouts/sidebar"
import LogisticsTable from "@/components/tables/transportation"
import Breadcrumbs from "@/components/breadcrumbs/panels"
import Header from "@/components/headers/product"
import { usePart } from "@/components/hooks"

import { main, product } from "lib/constants/routes"
import withAuth from "@/components/auth/withAuth"

export default withAuth(() => {
  const router = useRouter()
  const { lca_id: lcaID } = router.query as { lca_id: string }
  const { part, refresh } = usePart(lcaID)

  if (part === undefined)
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Button loading={true} color="indigo" size="xl" variant="light" />
      </div>
    )

  return (
    <>
      <Layout
        mainNavigation={main}
        pageNavigation={undefined}
        name="Transportation"
        header={<Header />}
      >
        <div className="p-6">
          <Flex justifyContent="justify-start" spaceX="space-x-4">
            <Title>{part?.part_description ?? "Unnamed Product"}</Title>
            <Badge
              text={part?.customer_part_id ?? ""}
              color="indigo"
              size="sm"
            />
          </Flex>
          <div className="mt-4"></div>
          <Breadcrumbs
            current={1}
            steps={product(part).map((item) => ({
              ...item,
            }))}
          />
          <div className="mt-6"></div>
          <LogisticsTable
            lcaID={lcaID}
            complete={part.transportation_completed ?? false}
            refresh={refresh}
          />
        </div>
      </Layout>
    </>
  )
})
