import { useState, useEffect } from "react"
import {
  Text,
  TableHeaderCell,
  Card,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Title,
  Badge,
  Bold,
  Flex,
  Dropdown,
  Button,
  DropdownItem,
} from "@tremor/react"
import { CSVLink } from "react-csv"

import { useQuery } from "../hooks"
import { formatNumber } from "lib/utils"
import { Methodology, ImpactCategories } from "lib/calculator/methodologies"
import { TableDataUnion, tableName, units } from "lib/calculator/results"

import Skeleton from "../skeletons/list"
import { ServiceLifeData } from "lib/types/supabase-row.types"
import {
  EndOfLifeWithImpacts,
  LCAStage,
  ManufacturingWithImpacts,
  MaterialCompositionWithImpacts,
  TransportationWithImpacts,
  UsePhaseWithImpacts,
} from "lib/types/calculator.types"

type BadgeProps = Parameters<typeof Badge>[number]

const Cell = (props: {
  value?: number | null
  unit?: string
  color?: BadgeProps["color"]
}) => (
  <TableCell>
    {props.value ? (
      <Badge
        text={`${formatNumber(props.value)}${props.unit && " "} ${props.unit}`}
        size="xs"
        color={props.color ?? "stone"}
      />
    ) : (
      <Badge size="xs" text="" />
    )}
  </TableCell>
)

export default ({
  lcaID,
  partDescription,
}: {
  lcaID: string
  partDescription: string | null
}) => {
  const [methodology, setMethodology] = useState<Methodology>(Methodology.CML)
  const [loading, setLoading] = useState(false)

  const { data: materialData, refresh: refreshMaterials } =
    useQuery<MaterialCompositionWithImpacts>(
      tableName(methodology, "materials_results"),
      {
        lca_id: lcaID,
      }
    )

  const { data: transportationData, refresh: refreshTransportation } =
    useQuery<TransportationWithImpacts>(
      tableName(methodology, "transportation_results"),
      {
        lca_id: lcaID,
      }
    )

  const { data: manufacturingData, refresh: refreshManufacturing } =
    useQuery<ManufacturingWithImpacts>(
      tableName(methodology, "manufacturing_results"),
      {
        lca_id: lcaID,
      }
    )

  const { data: usePhaseData, refresh: refreshUsePhase } =
    useQuery<UsePhaseWithImpacts>(tableName(methodology, "use_phase_results"), {
      lca_id: lcaID,
    })

  const { data: endOfLifeData, refresh: refreshEndOfLife } =
    useQuery<EndOfLifeWithImpacts>(
      tableName(methodology, "end_of_life_results"),
      {
        lca_id: lcaID,
      }
    )

  const { data: totalData, refresh: refreshTotal } = useQuery<TableDataUnion>(
    tableName(methodology, "total_results"),
    {
      lca_id: lcaID,
    }
  )

  const { data: serviceLife, refresh: refreshServiceLife } =
    useQuery<ServiceLifeData>("service_life", {
      lca_id: lcaID,
    })

  const materials = materialData?.[0]
  const transportation = transportationData?.[0]
  const manufacturing = manufacturingData?.[0]
  const usePhase = usePhaseData?.[0]
  const endOfLife = endOfLifeData?.[0]
  const total = totalData?.[0]
  const hasUsePhase = serviceLife?.[0]?.has_use_phase

  // Export to CSV data
  const impactToColumnMap = Object.entries(ImpactCategories[methodology]).map(
    ([category, column]) => [category, `total_${column}`]
  ) as Array<[string, keyof TableDataUnion]>

  const csvFileName = `${partDescription}-${methodology}.csv`.replace(/ /g, "-")

  const csvHeaders = ["", ...Object.values(LCAStage), "Total Impact"]

  const csvData = impactToColumnMap.map(([category, column]) => [
    `${category} (${units(methodology, category)})`,
    materials?.[column],
    transportation?.[column],
    manufacturing?.[column],
    usePhase?.[column],
    endOfLife?.[column],
    total?.[column],
  ])

  useEffect(() => {
    setLoading(true)
    Promise.all([
      refreshMaterials(),
      refreshTransportation(),
      refreshManufacturing(),
      refreshUsePhase(),
      refreshEndOfLife(),
      refreshTotal(),
      refreshServiceLife(),
    ]).then(() => {
      setLoading(false)
    })
  }, [methodology])

  if (total === undefined)
    return (
      <Card shadow={false}>
        <Skeleton />
      </Card>
    )

  return (
    <Card shadow={false}>
      <Flex>
        <Title>Lifecycle Impact Assessment Results</Title>
        <Flex justifyContent="justify-end" spaceX="space-x-6">
          <CSVLink headers={csvHeaders} data={csvData} filename={csvFileName}>
            <Button text="Export" color="indigo" variant="light" />
          </CSVLink>
          <Dropdown
            value={methodology}
            onValueChange={setMethodology}
            maxWidth="max-w-xs"
          >
            <DropdownItem value={Methodology.CML} text={Methodology.CML} />
            <DropdownItem value={Methodology.EF} text={Methodology.EF} />
            <DropdownItem value={Methodology.RMH} text={Methodology.RMH} />
          </Dropdown>
        </Flex>
      </Flex>
      {!loading && (
        <Table marginTop="mt-4">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Impact Indicator</TableHeaderCell>
              <TableHeaderCell>
                <Text color="indigo">
                  <Bold>Total Impact</Bold>
                </Text>
              </TableHeaderCell>
              <TableHeaderCell>A1. Materials</TableHeaderCell>
              <TableHeaderCell>A2. Transport</TableHeaderCell>
              <TableHeaderCell>A3. Manufacturing</TableHeaderCell>
              <TableHeaderCell>B. Use Phase</TableHeaderCell>
              <TableHeaderCell>C. End of Life</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {impactToColumnMap.map(([category, column], index) => (
              <TableRow key={index}>
                <TableCell>
                  <Text>{category}</Text>
                </TableCell>
                <Cell
                  value={Number(total?.[column])}
                  unit={units(methodology, category)}
                  color="indigo"
                />
                <Cell
                  value={Number(materials?.[column])}
                  unit={units(methodology, category)}
                />
                <Cell
                  value={Number(transportation?.[column])}
                  unit={units(methodology, category)}
                />
                <Cell
                  value={Number(manufacturing?.[column])}
                  unit={units(methodology, category)}
                />
                {hasUsePhase ? (
                  <Cell value={Number(usePhase?.[column])} unit={`kg CO2 eq`} />
                ) : (
                  <TableCell>
                    <Badge color="zinc" text="No Use Phase" size="xs" />
                  </TableCell>
                )}
                <Cell
                  value={Number(endOfLife?.[column])}
                  unit={units(methodology, category)}
                />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {loading && <Skeleton />}
    </Card>
  )
}
