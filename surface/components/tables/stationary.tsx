import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/20/solid"
import {
  Badge,
  Text,
  TableHeaderCell,
  Card,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Flex,
  Button,
  TextInput,
  Bold,
} from "@tremor/react"
import sum from "lodash.sum"

const color = (value: number, total: number) => {
  if ((value * 100) / total < 20) return "yellow"
  if ((value * 100) / total < 60) return "orange"
  return "red"
}

export default ({ data }: { data: Array<any> }) => {
  return (
    <Card shadow={false}>
      <Flex>
        <TextInput
          placeholder="Search"
          maxWidth="max-w-sm"
          icon={MagnifyingGlassIcon}
        />
        <Flex justifyContent="justify-end" spaceX="space-x-6">
          {/* <Link href={`/portals/upload?id=tVDjfwFV`} target="_blank">
            <Button
              text="AI File Assistant"
              color="orange"
              variant="light"
              icon={SparklesIcon}
            />
          </Link> */}
          <Button text="View Documents" color="indigo" variant="light" />
          <Button text="Fuel" icon={PlusIcon} color="indigo" />
        </Flex>
      </Flex>
      <Table marginTop="mt-4">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Fuel</TableHeaderCell>
            <TableHeaderCell>Year</TableHeaderCell>
            <TableHeaderCell>Quantity</TableHeaderCell>
            <TableHeaderCell>Units</TableHeaderCell>
            <TableHeaderCell>Impact</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index}>
              <TableCell>
                <Text>
                  <Bold>{item.fuel}</Bold>
                </Text>
              </TableCell>
              <TableCell>
                <Text>{item.year}</Text>
              </TableCell>
              <TableCell>
                <Text>{item.quantity}</Text>
              </TableCell>
              <TableCell>
                <Text>{item.units}</Text>
              </TableCell>
              <TableCell>
                <Badge
                  color={color(
                    item.impact,
                    sum(data.map((item) => item.impact))
                  )}
                  text={`${item.impact} kg CO2-Eq`}
                  size="xs"
                />
              </TableCell>
              <TableCell textAlignment="text-end">
                <Button size="xs" variant="light" text="Edit" color="indigo" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
