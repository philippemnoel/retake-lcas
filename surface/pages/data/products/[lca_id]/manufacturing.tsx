import { useRouter } from "next/router"
import { Flex, Title, Badge, Button } from "@tremor/react"

import Layout from "@/components/layouts/sidebar"
import ManufacturingTable from "@/components/tables/manufacturing"
import Breadcrumbs from "@/components/breadcrumbs/panels"
import Header from "@/components/headers/product"

import { main, product } from "lib/constants/routes"
import { usePart } from "@/components/hooks"
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
            current={2}
            steps={product(part).map((item) => ({
              ...item,
            }))}
          />
          <div className="mt-6"></div>
          <ManufacturingTable
            lcaID={lcaID}
            complete={part.manufacturing_completed ?? false}
            refresh={refresh}
          />
        </div>
      </Layout>
    </>
  )
})
