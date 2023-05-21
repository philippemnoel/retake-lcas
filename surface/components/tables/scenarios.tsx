import {
  Badge,
  Text,
  TableHeaderCell,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Bold,
  Flex,
  TextInput,
} from "@tremor/react"
import { ChevronRightIcon } from "@heroicons/react/20/solid"
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import sum from "lodash.sum"
import Link from "next/link"

const color = (value: number, total: number) => {
  value = Math.abs(value)
  if ((value * 100) / total < 20) return "yellow"
  if ((value * 100) / total < 60) return "orange"
  return "red"
}

export default ({ data }: { data: Array<any> }) => {
  return (
    <>
      <Flex>
        <TextInput
          placeholder="Search"
          maxWidth="max-w-sm"
          icon={MagnifyingGlassIcon}
        />
        {/* <Flatfile
          embedId="8fed5b1e-0bb5-4632-ac33-62776571ce49"
          onSubmitting={() => {}}
          onSuccess={() => {}}
        >
          <Button text="Product" icon={PlusIcon} color="indigo" />
        </Flatfile> */}
      </Flex>
      <Table marginTop="mt-4">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Scenario Name</TableHeaderCell>
            <TableHeaderCell>Product Name</TableHeaderCell>
            <TableHeaderCell>Product Identifier</TableHeaderCell>
            <TableHeaderCell>Created By</TableHeaderCell>
            <TableHeaderCell>Global Warming Change</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index}>
              <TableCell>
                <Text>
                  <Bold>{item.scenario_name}</Bold>
                </Text>
              </TableCell>
              <TableCell>
                <Text>{item.product_name}</Text>
              </TableCell>
              <TableCell>
                <Text>{item.product_identifier}</Text>
              </TableCell>
              <TableCell>
                <Text>{item.created_by}</Text>
              </TableCell>
              <TableCell>
                {item.global_warming_change !== undefined && (
                  <Badge
                    color={color(
                      item.impact,
                      sum(data.map((item) => item.global_warming_change))
                    )}
                    text={`${item.global_warming_change} kg CO2-Eq`}
                    size="xs"
                  />
                )}
              </TableCell>
              <TableCell>
                <Link
                  href={`/data/products/${item.product_identifier}/overview`}
                >
                  <Button
                    icon={ChevronRightIcon}
                    variant="light"
                    color="stone"
                  ></Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
