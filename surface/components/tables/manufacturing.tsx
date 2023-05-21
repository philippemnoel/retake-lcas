import { useState } from "react"
import {
  Text,
  Bold,
  Card,
  Table,
  TableRow,
  TableCell,
  TableBody,
  TextInput,
  Button,
  Flex,
  TableHead,
  TableHeaderCell,
  Badge,
} from "@tremor/react"
import {
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  TrashIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline"
import { useUser } from "@auth0/nextjs-auth0"
import sumBy from "lodash.sumby"
import { v4 as uuidv4 } from "uuid"

import Menu from "@/components/menus"
import FacilityDrawer from "@/components/drawers/facility"
import ManufacturingDrawer from "@/components/drawers/manufacturing"
import Empty from "@/components/empty"
import ImpactBadge from "@/components/badges/impact"
import Skeleton from "@/components/skeletons/list"
import CompletionButton from "@/components/buttons/completion"
import { useQuery, useNotification, useLCAResults } from "@/components/hooks"

import { grids } from "lib/calculator/factors"
import { formatNumber, isDevelopment, allAssigned } from "lib/utils"
import { upsertFacilityAllocation } from "lib/api/upsert"
import { updateLCA } from "lib/api/update"
import { removeManufacturing } from "lib/api/remove"
import { Methodology } from "lib/calculator/methodologies"
import { LCAStage, ManufacturingWithImpacts } from "lib/types/calculator.types"
import { FacilityEnergyWithImpactsData } from "lib/types/supabase-row.types"
import {
  upsertFacility,
  upsertPurchasedEnergy,
  upsertStationaryFuel,
} from "lib/api/upsert"

type ManufacutingDraft = Partial<ManufacturingWithImpacts> | undefined
type FacilitiesDraft = Partial<FacilityEnergyWithImpactsData> | undefined

export default ({
  lcaID,
  complete,
  refresh,
}: {
  lcaID: string
  complete: boolean
  refresh: () => void
}) => {
  const [manufacturingDrawerOpen, setManufacturingDrawerOpen] = useState(false)
  const [facilityDrawerOpen, setFacilityDrawerOpen] = useState(false)

  const [manufacturingDrawerDraft, setManufacturingDrawerDraft] =
    useState<ManufacutingDraft>(undefined)
  const [facilityDrawerDraft, setFacilityDrawerDraft] =
    useState<FacilitiesDraft>(undefined)

  const { data: facilities, refresh: refreshFacilities } =
    useQuery<FacilityEnergyWithImpactsData>("cml_facility_energy_with_impacts")

  const { data, refresh: refreshManufacturing } =
    useLCAResults<ManufacturingWithImpacts>("manufacturing", {
      lca_id: lcaID,
      methodology: Methodology.CML,
    })

  const { user } = useUser()
  const { withNotification } = useNotification()

  const canMarkComplete = (data?.length ?? 0) > 0
  const defaultYear = new Date().getFullYear() - 1

  const facilityDrawerCanSave = allAssigned(
    facilityDrawerDraft?.name,
    facilityDrawerDraft?.location
  )

  const editManufacturing = (value: ManufacturingWithImpacts) => {
    setManufacturingDrawerDraft(value)
    setManufacturingDrawerOpen(true)
  }

  const onSaveAllocation = async (
    value?: Partial<ManufacturingWithImpacts>
  ) => {
    if (!value) return

    await withNotification([
      upsertFacilityAllocation({
        ...value,
        facility_id: value.facility_id ?? undefined,
        id: value?.id ?? undefined,
        org_id: user?.org_id,
        lca_id: lcaID,
      }),
      updateLCA({
        lca_id: lcaID,
        org_id: user?.org_id,
        manufacturing_completed: false,
      }),
    ])
    refreshManufacturing()
    refresh()
  }

  const onSaveFacility = async (
    data?: Partial<FacilityEnergyWithImpactsData>
  ) => {
    if (!data) return
    // If we receive an "id" argument, then we're editing an existing facility.
    // If we don't receive one, then we're creating a new facility, and we'll assign an id.
    const facilityID = data.id ?? uuidv4()

    // Facility needs to exist first before adding allocation due to foreign key.
    await withNotification([
      upsertFacility({
        id: facilityID,
        org_id: user?.org_id,
        name: data.name,
        location: data.location,
      })
        .then(() =>
          upsertPurchasedEnergy({
            facility_id: facilityID,
            year: defaultYear,
            org_id: user?.org_id,
            description: "Energy Consumption",
            quantity_kwh: data.quantity_kwh ?? 0,
            percent_renewable: data.percent_renewable ?? 0,
            factor_id: grids.find((grid) => grid.name === data.location)
              ?.energy_factor_id,
          })
        )
        .then(() =>
          upsertStationaryFuel({
            facility_id: facilityID,
            year: defaultYear,
            org_id: user?.org_id,
            description: "Energy Consumption",
            quantity_mj: data.quantity_mj ?? 0,
            factor_id: grids.find((grid) => grid.name === data.location)
              ?.natural_gas_factor_id,
          })
        ),
    ])

    refreshFacilities()
  }
  const onRemoveFacility = async (value: ManufacturingWithImpacts) => {
    await withNotification([
      removeManufacturing(value.facility_id, lcaID, user?.org_id),
      updateLCA({
        lca_id: lcaID,
        org_id: user?.org_id,
        manufacturing_completed: false,
      }),
    ])
    refreshManufacturing()
    refresh()
  }

  if (data === undefined)
    return (
      <Card shadow={false}>
        <Skeleton />
      </Card>
    )

  return (
    <Card shadow={false}>
      <FacilityDrawer
        open={facilityDrawerOpen}
        data={facilityDrawerDraft}
        canSave={facilityDrawerCanSave}
        onChange={(key, value) => {
          setFacilityDrawerDraft({ ...facilityDrawerDraft, [key]: value })
        }}
        onSave={() => {
          onSaveFacility(facilityDrawerDraft)
          setFacilityDrawerOpen(false)
          setFacilityDrawerDraft(undefined)
        }}
        onDismiss={() => {
          setFacilityDrawerOpen(false)
          setFacilityDrawerDraft(undefined)
        }}
      />
      <ManufacturingDrawer
        open={manufacturingDrawerOpen}
        data={manufacturingDrawerDraft}
        facilitiesData={facilities?.filter(({ name }) => name !== null) ?? []}
        onChange={(data) => {
          setManufacturingDrawerDraft({ ...manufacturingDrawerDraft, ...data })
        }}
        onDismiss={() => {
          setManufacturingDrawerOpen(false)
          setManufacturingDrawerDraft(undefined)
        }}
        onSave={() => {
          onSaveAllocation(manufacturingDrawerDraft)
          setManufacturingDrawerOpen(false)
          setManufacturingDrawerDraft(undefined)
        }}
        onClickCreateNew={() => {
          setManufacturingDrawerDraft(undefined)
          setManufacturingDrawerOpen(false)
          setFacilityDrawerOpen(true)
        }}
      />
      <Flex spaceX="space-x-6">
        <TextInput
          placeholder="Search"
          maxWidth="max-w-sm"
          icon={MagnifyingGlassIcon}
        />
        <Flex justifyContent="justify-end" spaceX="space-x-8">
          <Button
            text="Add Manufacturing"
            color="indigo"
            variant="light"
            icon={BuildingOfficeIcon}
            onClick={() => {
              setManufacturingDrawerOpen(true)
            }}
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
            stage={LCAStage.MANUFACTURING}
            onRefresh={refresh}
          />
        </Flex>
      </Flex>
      {data.length > 0 ? (
        <Table marginTop="mt-4">
          <TableHead>
            <TableRow>
              <TableHeaderCell> </TableHeaderCell>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Location</TableHeaderCell>
              <TableHeaderCell>% Revenue</TableHeaderCell>
              <TableHeaderCell>Annual Quantity Produced</TableHeaderCell>
              <TableHeaderCell>Natural Gas / Unit</TableHeaderCell>
              <TableHeaderCell>Energy / Unit</TableHeaderCell>
              <TableHeaderCell>% Renewable</TableHeaderCell>
              <TableHeaderCell>Global Warming</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>
                <Text color="indigo">
                  <Bold>Total ({data.length})</Bold>
                </Text>
              </TableCell>
              <TableCell> </TableCell>
              <TableCell> </TableCell>
              <TableCell> </TableCell>
              <TableCell>
                <Text color="indigo">
                  <Bold>{sumBy(data, "quantity_produced") ?? 0} units</Bold>
                </Text>
              </TableCell>
              <TableCell>
                <Text color="indigo">
                  <Bold>
                    {formatNumber(sumBy(data, "quantity_mj") ?? 0)} MJ
                  </Bold>
                </Text>
              </TableCell>
              <TableCell>
                <Text color="indigo">
                  <Bold>
                    {formatNumber(sumBy(data, "quantity_kwh") ?? 0)} kWh
                  </Bold>
                </Text>
              </TableCell>
              <TableCell> </TableCell>
              <TableCell>
                {" "}
                <Text>
                  <Bold>
                    {formatNumber(sumBy(data, "total_global_warming") ?? 0)} kg
                    CO2-Eq
                  </Bold>
                </Text>
              </TableCell>
            </TableRow>
            {
              data?.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Menu
                      options={[
                        {
                          name: "Remove",
                          icon: TrashIcon,
                          onClick: () => {
                            onRemoveFacility(item)
                          },
                        },
                      ]}
                    />
                  </TableCell>
                  <TableCell>
                    <div
                      className="cursor-pointer"
                      onClick={() => editManufacturing(item)}
                    >
                      <Text>{item.name}</Text>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className="cursor-pointer"
                      onClick={() => editManufacturing(item)}
                    >
                      <Text truncate={true}>{item.location}</Text>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className="cursor-pointer"
                      onClick={() => editManufacturing(item)}
                    >
                      <Text>{item.percent_revenue} %</Text>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className="cursor-pointer"
                      onClick={() => editManufacturing(item)}
                    >
                      <Text>{item.quantity_produced} units</Text>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className="cursor-pointer"
                      onClick={() => editManufacturing(item)}
                    >
                      <Badge
                        text={`${formatNumber(item.quantity_mj ?? 0)} MJ`}
                        size="xs"
                        color="stone"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className="cursor-pointer"
                      onClick={() => editManufacturing(item)}
                    >
                      <Badge
                        text={`${formatNumber(item.quantity_kwh ?? 0)} kWh`}
                        size="xs"
                        color="stone"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className="cursor-pointer"
                      onClick={() => editManufacturing(item)}
                    >
                      <Badge
                        text={`${item.percent_renewable} %`}
                        size="xs"
                        color="stone"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <ImpactBadge
                      database={undefined}
                      activity={undefined}
                      impact={item.total_global_warming}
                      isLeaf={false}
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
            title="No Manufacturing Found"
            description="Specify which facilities this component is manufactured in and in what quantities. 
              Based on this information, Retake uses a top-down economic allocation model to determine the carbon footprint of this product's manufacturing."
            buttons={[
              <Button
                icon={BuildingOfficeIcon}
                text="Add Manufacturing"
                color="indigo"
                onClick={() => {
                  setManufacturingDrawerDraft(undefined)
                  setManufacturingDrawerOpen(true)
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
