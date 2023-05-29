import { useState } from "react"
import {
  Card,
  ProgressBar,
  ColGrid,
  Col,
  Text,
  Bold,
  Flex,
  Title,
  Metric,
  Table,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableCell,
  TableRow,
  Badge,
  Button,
} from "@tremor/react"

import Layout from "@/components/layouts/sidebar"
import Skeleton from "@/components/skeletons/list"
import withAuth from "@/components/auth/withAuth"
import EPDDrawer from "@/components/drawers/epd"
import { useQuery } from "@/components/hooks"

import { main, compliance } from "lib/constants/routes"
import { CMLPartsWithImpactsData } from "lib/types/supabase-row.types"
import { DocumentDuplicateIcon, PlusIcon } from "@heroicons/react/24/outline"

export default withAuth(() => {
  const [EPDDrawerOpen, setEPDDrawerOpen] = useState(false)
  const [partsData, setPartsData] = useState<CMLPartsWithImpactsData>()

  const { data } = useQuery<CMLPartsWithImpactsData>("cml_parts_with_impacts", {
    is_base_material: false,
  })

  const openEPDDrawer = (item: CMLPartsWithImpactsData) => {
    setPartsData(item)
    setEPDDrawerOpen(!EPDDrawerOpen)
  }

  const Cell = ({
    item,
    children,
  }: {
    item: CMLPartsWithImpactsData
    children: React.ReactNode
  }) => (
    <TableCell>
      <div
        className="max-w-[12rem] cursor-pointer"
        onClick={() => openEPDDrawer(item)}
      >
        {children}
      </div>
    </TableCell>
  )

  return (
    <>
      <EPDDrawer
        open={EPDDrawerOpen}
        onDismiss={() => {
          setEPDDrawerOpen(false)
        }}
        data={partsData}
      />
      <Layout
        mainNavigation={main}
        pageNavigation={compliance}
        name="Compliance"
      >
        <div className="p-6">
          <ColGrid numCols={2} gapX="gap-x-6">
            <Col numColSpan={1}>
              <Card shadow={false}>
                <Card shadow={false}>
                  {" "}
                  <Flex>
                    <Title>EPD Requests</Title>
                    <Text color="indigo">
                      <Bold>32%</Bold>
                    </Text>
                  </Flex>
                  <ProgressBar
                    color="indigo"
                    percentageValue={32}
                    marginTop="mt-3"
                  />
                  <Flex marginTop="mt-3">
                    <Text>320 requested</Text>
                    <Text>1000 total items</Text>
                  </Flex>
                </Card>
                <ColGrid
                  numCols={2}
                  gapX="gap-x-6"
                  gapY="gap-y-6"
                  marginTop="mt-6"
                >
                  <Col numColSpan={1}>
                    <Card shadow={false}>
                      <Text>Total Items</Text>
                      <Metric>1000</Metric>
                    </Card>
                  </Col>
                  <Col numColSpan={1}>
                    <Card shadow={false}>
                      <Text>EPDs Requested</Text>
                      <Metric>320</Metric>
                    </Card>
                  </Col>
                </ColGrid>
              </Card>
            </Col>
            <Col numColSpan={1}>
              <Card shadow={false}>
                <Card shadow={false}>
                  {" "}
                  <Flex>
                    <Title>EPD Verification</Title>
                    <Text color="indigo">
                      <Bold>70%</Bold>
                    </Text>
                  </Flex>
                  <ProgressBar
                    color="indigo"
                    percentageValue={70}
                    marginTop="mt-3"
                  />
                  <Flex marginTop="mt-3">
                    <Text>175 third-party verified</Text>
                    <Text>250 EPDs</Text>
                  </Flex>
                </Card>
                <ColGrid
                  numCols={2}
                  gapX="gap-x-6"
                  gapY="gap-y-6"
                  marginTop="mt-6"
                >
                  <Col numColSpan={1}>
                    <Card shadow={false}>
                      <Text>EPDs Received</Text>
                      <Metric>250</Metric>
                    </Card>
                  </Col>
                  <Col numColSpan={1}>
                    <Card shadow={false}>
                      <Text>EPDs Verified</Text>
                      <Metric>175</Metric>
                    </Card>
                  </Col>
                </ColGrid>
              </Card>
            </Col>
          </ColGrid>
          {!data && (
            <Card shadow={false} marginTop="mt-6">
              <Skeleton />
            </Card>
          )}
          {data && (
            <Card shadow={false} marginTop="mt-6">
              <Flex justifyContent="justify-end" spaceX="space-x-6">
                <Button
                  text="Request EPD"
                  color="indigo"
                  variant="light"
                  icon={DocumentDuplicateIcon}
                />
                <Button
                  text="Add New"
                  color="indigo"
                  variant="light"
                  icon={PlusIcon}
                />
              </Flex>
              <Table marginTop="mt-2">
                <TableHead>
                  <TableHeaderCell>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded ring-1 ring-gray-300 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </TableHeaderCell>
                  <TableHeaderCell>Description</TableHeaderCell>
                  <TableHeaderCell>Identifier / SKU</TableHeaderCell>
                  <TableHeaderCell>Supplier</TableHeaderCell>
                  <TableHeaderCell>EPD Requested</TableHeaderCell>
                  <TableHeaderCell>EPD Received</TableHeaderCell>
                  <TableHeaderCell>EPD Verified</TableHeaderCell>
                </TableHead>
                <TableBody>
                  {data?.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded ring-1 ring-gray-300 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </TableCell>
                      <Cell item={item}>
                        <Text truncate={true}> {item.part_description}</Text>
                      </Cell>
                      <Cell item={item}>{item.customer_part_id}</Cell>
                      <Cell item={item}>{item.supplier_name}</Cell>
                      <Cell item={item}>
                        <Badge text="Yes" color="indigo" size="xs" />
                      </Cell>
                      <Cell item={item}>
                        <Badge text="Yes" color="indigo" size="xs" />
                      </Cell>
                      <Cell item={item}>
                        <Badge text="Yes" color="indigo" size="xs" />
                      </Cell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      </Layout>
    </>
  )
})
