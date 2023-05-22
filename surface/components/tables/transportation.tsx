import { useState } from "react"
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid"
import {
  TruckIcon,
  TrashIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline"
import {
  Text,
  Bold,
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
} from "@tremor/react"
import { useUser } from "@auth0/nextjs-auth0"
import sumBy from "lodash.sumby"

import Menu from "@/components/menus"
import TransportationDrawer from "@/components/drawers/transportation"
import ImpactBadge from "@/components/badges/impact"
import Skeleton from "@/components/skeletons/list"
import Empty from "@/components/empty"
import CompletionButton from "@/components/buttons/completion"
import {
  useQuery,
  useSearchFilter,
  useLCAResults,
  useNotification,
} from "@/components/hooks"
import { useAppState } from "@/components/hooks/state"

import { post } from "lib/api"
import { upsertTransportation } from "lib/api/upsert"
import { updateLCA } from "lib/api/update"
import { isDevelopment } from "lib/utils"
import { formatNumber } from "lib/utils"
import transportationTypes from "lib/calculator/transportation"
import transportation from "lib/calculator/transportation"
import {
  MaterialCompositionWithDescriptionsData,
  TransportationData,
} from "lib/types/supabase-row.types"
import { removeTransportation } from "lib/api/remove"
import { TransportationDataSchema } from "lib/api/schemas"
import { Methodology } from "lib/calculator/methodologies"
import { TransportationWithImpacts, LCAStage } from "lib/types/calculator.types"

const factorIdToTransportationNameMap = transportationTypes.reduce(
  (acc, val) => ({ ...acc, [val.factor_id]: val.name }),
  {} as Record<string, string>
)

export default ({
  lcaID,
  complete,
  refresh,
}: {
  lcaID: string
  complete: boolean
  refresh: () => void
}) => {
  const [transportationDrawerOpen, setTransportationDrawerOpen] =
    useState(false)
  const [defaults, setDefaults] = useState<
    Partial<TransportationData> | undefined
  >(undefined)
  const { setNotification } = useAppState()
  const { user } = useUser()
  const { withNotification } = useNotification()

  const { data, refresh: refreshTransportation } =
    useLCAResults<TransportationWithImpacts>("transportation", {
      lca_id: lcaID,
      methodology: Methodology.CML,
    })

  const { data: subComponents } =
    useQuery<MaterialCompositionWithDescriptionsData>(
      "material_composition_with_descriptions",
      {
        lca_id: lcaID,
        level: 2,
      }
    )

  const { data: components } =
    useQuery<MaterialCompositionWithDescriptionsData>(
      "material_composition_with_descriptions",
      {
        lca_id: lcaID,
        level: 1,
      }
    )

  const canMarkComplete = (data?.length ?? 0) > 0
  const rootComponent = components?.[0]
  const componentOptions = [
    ...(rootComponent ? [rootComponent] : []),
    ...(subComponents ?? []),
  ]

  const [
    searchFilteredData,
    searchBarQuery,
    setSearchBarQuery,
    hasSearchBarError,
  ] = useSearchFilter(data, (i) => i.part_description)

  const editTransportation = (value: TransportationWithImpacts) => {
    setDefaults(TransportationDataSchema.optional().parse(value))
    setTransportationDrawerOpen(!transportationDrawerOpen)
  }

  const onSaveTransportation = async (value: Partial<TransportationData>) => {
    if (value.origin && value.destination) {
      const response = await post(`/api/gcp/maps`, {
        location1: value.origin,
        location2: value.destination,
      })
      if (response.status !== 200) {
        setNotification({
          title: `An unexpected error occurred`,
          description: `Retake was unable to calculate the distance between ${value.origin} and ${value.destination}. Please try a different location or used distance travelled instead.`,
          type: "warning",
        })
        return
      }
      const { distance } = await (response as Response).json()
      value["distance_km"] = distance
    }

    const transportationPayload = {
      ...value,
      lca_id: lcaID,
      org_id: user?.org_id,
      factor_id: transportation.find(
        (item) => item.name === value.transportation_type
      )?.factor_id,
    }

    await withNotification([
      upsertTransportation([transportationPayload], user?.org_id),
      updateLCA({
        lca_id: lcaID,
        org_id: user?.org_id,
        transportation_completed: false,
      }),
    ])
    refreshTransportation()
    refresh()
  }

  const onRemoveTransportation = async (value: TransportationWithImpacts) => {
    await withNotification([
      removeTransportation(value.id, lcaID, user?.org_id),
      updateLCA({
        lca_id: lcaID,
        org_id: user?.org_id,
        transportation_completed: false,
      }),
    ])
    refreshTransportation()
    refresh()
  }

  if (data === undefined || !user?.org_id)
    return (
      <Card shadow={false}>
        <Skeleton />
      </Card>
    )

  return (
    <Card shadow={false}>
      <TransportationDrawer
        open={transportationDrawerOpen}
        setOpen={setTransportationDrawerOpen}
        components={componentOptions}
        onSave={onSaveTransportation}
        defaults={defaults}
      />
      <Flex>
        <TextInput
          placeholder="Search"
          maxWidth="max-w-sm"
          error={hasSearchBarError}
          icon={MagnifyingGlassIcon}
          value={searchBarQuery}
          onChange={(e) => setSearchBarQuery(e.target.value)}
        />
        <Flex justifyContent="justify-end" spaceX="space-x-8">
          <Button
            text="Add Transport"
            icon={TruckIcon}
            onClick={() => {
              setDefaults(undefined)
              setTransportationDrawerOpen(!transportationDrawerOpen)
            }}
            variant="light"
            color="indigo"
          />
          {isDevelopment && (
            <Button
              text="Assign User"
              icon={UserCircleIcon}
              onClick={undefined}
              variant="light"
              color="indigo"
            />
          )}
          <CompletionButton
            complete={complete}
            canMarkComplete={canMarkComplete}
            lcaID={lcaID}
            stage={LCAStage.TRANSPORTATION}
            onRefresh={refresh}
          />
        </Flex>
      </Flex>
      {searchFilteredData.length > 0 ? (
        <Table marginTop="mt-4">
          <TableHead>
            <TableRow>
              <TableHeaderCell> </TableHeaderCell>
              <TableHeaderCell>Part</TableHeaderCell>
              <TableHeaderCell>Origin</TableHeaderCell>
              <TableHeaderCell>Destination</TableHeaderCell>
              <TableHeaderCell>Distance</TableHeaderCell>
              <TableHeaderCell>Transportation Type</TableHeaderCell>
              <TableHeaderCell>Global Warming</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>
                <Text color="indigo">
                  <Bold>Total ({searchFilteredData.length})</Bold>
                </Text>
              </TableCell>
              <TableCell> </TableCell>
              <TableCell> </TableCell>
              <TableCell> </TableCell>
              <TableCell>
                <Text color="indigo">
                  <Bold>
                    {formatNumber(sumBy(searchFilteredData, "distance_km"))} km
                  </Bold>
                </Text>
              </TableCell>
              <TableCell> </TableCell>
              <TableCell>
                {" "}
                <Text>
                  <Bold>
                    {formatNumber(
                      sumBy(searchFilteredData, "total_global_warming") ?? 0
                    )}{" "}
                    kg CO2-Eq
                  </Bold>
                </Text>
              </TableCell>
            </TableRow>
            {
              searchFilteredData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Menu
                      options={[
                        {
                          name: "Remove",
                          icon: TrashIcon,
                          onClick: () => {
                            onRemoveTransportation(item)
                          },
                        },
                      ]}
                    />
                  </TableCell>
                  <TableCell>
                    <div
                      className="cursor-pointer"
                      onClick={() => editTransportation(item)}
                    >
                      <Text truncate={true}>{item.part_description}</Text>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className="cursor-pointer"
                      onClick={() => editTransportation(item)}
                    >
                      <Text>{item.origin}</Text>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className="cursor-pointer"
                      onClick={() => editTransportation(item)}
                    >
                      <Text>{item.destination}</Text>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className="cursor-pointer"
                      onClick={() => editTransportation(item)}
                    >
                      {item.distance_km && (
                        <Text>{formatNumber(item.distance_km)} km</Text>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className="cursor-pointer"
                      onClick={() => editTransportation(item)}
                    >
                      <Text>
                        {factorIdToTransportationNameMap[
                          item.factor_id ?? ""
                        ] ?? "Unspecified"}
                      </Text>
                    </div>
                  </TableCell>
                  <TableCell>
                    <ImpactBadge
                      database={item.database_name}
                      activity={item.reference_product_name}
                      impact={item.total_global_warming}
                      isLeaf={true}
                    />
                  </TableCell>
                </TableRow>
              )) as any
            }
          </TableBody>
        </Table>
      ) : (
        <div className="pb-12">
          <Empty
            title="No Transport Found"
            description="Specify how components are transported to their final point of assembly."
            buttons={[
              <Button
                icon={TruckIcon}
                text="Add Transport"
                color="indigo"
                onClick={() => {
                  setDefaults(undefined)
                  setTransportationDrawerOpen(!transportationDrawerOpen)
                }}
                key={0}
              />,
            ]}
          />
        </div>
      )}
    </Card>
  )
}
