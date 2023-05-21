import { main, reports } from "lib/constants/routes"
import Layout from "@/components/layouts/sidebar"
import {
  Title,
  Subtitle,
  List,
  ListItem,
  Text,
  Bold,
  Button,
  TextInput,
  Flex,
  Badge,
} from "@tremor/react"
import Link from "next/link"
import { useUser } from "@auth0/nextjs-auth0"
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import { ChevronRightIcon } from "@heroicons/react/20/solid"

import Skeleton from "@/components/skeletons/list"
import { useSearchFilter } from "@/components/hooks"
import { useStorage } from "@/components/hooks"
import Empty from "@/components/empty"

import { formatTimestamp, openUrlInNewTab } from "lib/utils"
import { getPublicUrl } from "lib/api/query"

const bucket = "supplier-lcas"

export default () => {
  const { data } = useStorage(bucket)
  const { user } = useUser()

  const [
    searchFilteredData,
    searchBarQuery,
    setSearchBarQuery,
    hasSearchBarError,
  ] = useSearchFilter(data, (i) => i.name)

  const onOpenReport = async (file: string) => {
    const url = await getPublicUrl(bucket, file, user?.org_id)
    openUrlInNewTab(url)
  }

  return (
    <Layout mainNavigation={main} pageNavigation={reports} name="Reports">
      <div className="p-6">
        <Title>Supplier-Specific Product Footprint Reports</Title>
        <Subtitle>
          Environmental footprint reports for items in your inventory purchased
          from suppliers. Reports appear here when engaged suppliers have
          provide data to Retake and Retake verifies the data.
        </Subtitle>
        <Flex marginTop="mt-6">
          <TextInput
            placeholder="Search"
            maxWidth="max-w-sm"
            error={hasSearchBarError}
            icon={MagnifyingGlassIcon}
            value={searchBarQuery}
            onChange={(e) => setSearchBarQuery(e.target.value)}
          />
        </Flex>
        {data && data.length > 0 && (
          <List marginTop="mt-4">
            {searchFilteredData.map((item, index) => {
              return (
                <ListItem key={index}>
                  <div className="py-2">
                    <div className="flex items-start gap-x-3">
                      <Text>
                        <Bold>{item.name}</Bold>
                      </Text>
                      <Badge
                        text="Verified by Retake"
                        color="emerald"
                        size="xs"
                      />
                    </div>
                    <Text marginTop="mt-1">
                      Report Created {formatTimestamp(item.updated_at)}
                    </Text>
                  </div>
                  <Flex justifyContent="justify-end" spaceX="space-x-8">
                    <Button
                      text="View"
                      color="indigo"
                      variant="light"
                      icon={ChevronRightIcon}
                      iconPosition="right"
                      onClick={() => onOpenReport(item.name)}
                    />
                  </Flex>
                </ListItem>
              )
            })}
          </List>
        )}
        {data && data.length === 0 && (
          <Empty
            title="No Reports Found"
            description="Reports are automatically generated here after suppliers are engaged and provide data to Retake. To get started, you can request product-level environmental footprints from suppliers from the Inventory tab."
            buttons={[
              <Link href="/data/inventory" key={0}>
                <Button text="Go to Inventory" color="indigo" key={0} />
              </Link>,
            ]}
          />
        )}
        {data === undefined && (
          <div className="mt-6">
            <Skeleton />
          </div>
        )}
      </div>
    </Layout>
  )
}
