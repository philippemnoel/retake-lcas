import { useState } from "react"
import {
  Text,
  TableHeaderCell,
  Table as FacilityData,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Flex,
  Bold,
  TextInput,
  Icon,
  Title,
} from "@tremor/react"
import { ChevronRightIcon } from "@heroicons/react/20/solid"
import {
  TrashIcon,
  Bars3BottomLeftIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline"
import { useUser } from "@auth0/nextjs-auth0"
import { v4 as uuidv4 } from "uuid"
import Link from "next/link"
import uniqBy from "lodash.uniqby"

import FacilityDrawer from "@/components/drawers/facility"
import ImpactBadge from "@/components/badges/impact"
import Pagination from "@/components/tables/pagination"
import { useQuery } from "@/components/hooks"
import { useNotification } from "@/components/hooks"

import {
  upsertFacility,
  upsertPurchasedEnergy,
  upsertStationaryFuel,
} from "lib/api/upsert"
import { isDevelopment, allAssigned } from "lib/utils"
import { grids } from "lib/calculator/factors"
import { FacilityEnergyWithImpactsData } from "lib/types/supabase-row.types"
import { removeFacility } from "lib/api/remove"

const FACILITY_TABLE = "cml_facility_energy_with_impacts"

export default () => {
  const { user } = useUser()
  const { withNotification } = useNotification()
  const {
    data,
    pagination,
    setPagination,
    refresh,
    searchQuery,
    setSearchQuery,
  } = useQuery<FacilityEnergyWithImpactsData>(
    FACILITY_TABLE,
    {
      orderAsc: "name",
    },
    "name"
  )

  const [selected, setSelected] = useState<
    Array<FacilityEnergyWithImpactsData>
  >([])
  const [deleting, setDeleting] = useState(false)
  const [facilityDrawerOpen, setFacilityDrawerOpen] = useState(false)
  const [facilityDrawerData, setFacilityDrawerData] = useState<
    Partial<FacilityEnergyWithImpactsData>
  >({})

  const facilityDrawerCanSave = allAssigned(
    facilityDrawerData.name,
    facilityDrawerData.location
  )

  const defaultYear = new Date().getFullYear() - 1

  const addToSelected = (
    item: FacilityEnergyWithImpactsData,
    checked: boolean
  ) => {
    const _selected = selected.slice()
    if (checked) {
      setSelected(uniqBy([...selected, item], "id"))
    } else {
      setSelected(_selected.filter((s) => s.id !== item.id))
    }
  }

  const deleteRows = async () => {
    setDeleting(true)
    await Promise.all(
      selected.map((item) => removeFacility(item.id, user?.org_id))
    )
    setSelected([])
    setDeleting(false)
    refresh()
  }

  const onSaveFacility = async (
    data: Partial<FacilityEnergyWithImpactsData>
  ) => {
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

    setFacilityDrawerData({})
    refresh()
  }

  return (
    <>
      <FacilityDrawer
        open={facilityDrawerOpen}
        data={facilityDrawerData}
        canSave={facilityDrawerCanSave}
        onChange={(key, value) => {
          setFacilityDrawerData({ ...facilityDrawerData, [key]: value })
        }}
        onSave={() => {
          setFacilityDrawerOpen(false)
          onSaveFacility(facilityDrawerData)
        }}
        onDismiss={() => setFacilityDrawerOpen(false)}
      />
      <div className="fixed w-[calc(100%-3rem)] lg:w-[calc(100%-20rem)] bg-white z-10 top-[3.75rem] py-4">
        <div className="flex justify-between">
          {selected.length === 0 ? (
            <Flex justifyContent="justify-start" spaceX="space-x-2">
              <Icon icon={Bars3BottomLeftIcon} variant="simple" color="stone" />
              <Text>{pagination.rows} sites and facilities</Text>
            </Flex>
          ) : (
            <Flex justifyContent="justify-start" spaceX="space-x-2">
              <Icon icon={Bars3BottomLeftIcon} variant="simple" color="stone" />
              <Text>
                <Bold>{selected.length} selected</Bold>
              </Text>
            </Flex>
          )}
          {selected.length > 0 && (
            <Flex spaceX="space-x-6" justifyContent="justify-end">
              {selected.length === 1 && (
                <Button
                  text="Edit"
                  variant="light"
                  color="indigo"
                  icon={PencilSquareIcon}
                  onClick={() => {
                    setFacilityDrawerData(selected[0])
                    setFacilityDrawerOpen(!facilityDrawerOpen)
                  }}
                />
              )}
              <Button
                text="Remove"
                variant="light"
                color="indigo"
                icon={TrashIcon}
                onClick={() => {
                  deleteRows()
                }}
                loading={deleting}
              />
            </Flex>
          )}
          {selected.length === 0 && (
            <Flex spaceX="space-x-6" justifyContent="justify-end">
              <Button
                text="Add New Facility"
                color="indigo"
                variant="light"
                onClick={() => {
                  setFacilityDrawerData({})
                  setFacilityDrawerOpen(!facilityDrawerOpen)
                }}
              />
            </Flex>
          )}
        </div>
        <Flex marginTop="mt-4">
          <TextInput
            placeholder="Search"
            maxWidth="max-w-sm"
            icon={MagnifyingGlassIcon}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Flex>
      </div>
      <FacilityData marginTop="mt-24">
        <TableHead>
          <TableRow>
            <TableCell> </TableCell>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>Location</TableHeaderCell>
            <TableHeaderCell>Natural Gas</TableHeaderCell>
            <TableHeaderCell>Electricity</TableHeaderCell>
            <TableHeaderCell>Percent Renewable</TableHeaderCell>
            <TableHeaderCell>Global Warming / Site</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {
            data?.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  {" "}
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded ring-1 ring-gray-300 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    onChange={(event) => {
                      addToSelected(item, event.target.checked)
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Text>
                    <Bold>{item.name}</Bold>
                  </Text>
                </TableCell>
                <TableCell>
                  <Text>{item.location}</Text>
                </TableCell>
                <TableCell>
                  <Text>{item.quantity_mj ?? 0} MJ</Text>
                </TableCell>
                <TableCell>
                  <Text>{item.quantity_kwh ?? 0} kWh</Text>
                </TableCell>
                <TableCell>
                  <Text>{item.percent_renewable ?? 0} %</Text>
                </TableCell>
                <TableCell>
                  <ImpactBadge
                    database={undefined}
                    activity={undefined}
                    impact={item.total_global_warming}
                    isLeaf={true}
                  />
                </TableCell>
                <TableCell>
                  {isDevelopment && (
                    <Link href={`/facilities/${"facility"}/overview`}>
                      <Button
                        icon={ChevronRightIcon}
                        variant="light"
                        color="stone"
                      ></Button>
                    </Link>
                  )}
                </TableCell>
              </TableRow>
            )) as any
          }
        </TableBody>
      </FacilityData>
      {data?.length === 0 && (
        <div className="w-full pt-16 max-w-sm mx-auto text-center">
          <Icon
            icon={ExclamationTriangleIcon}
            color="indigo"
            size="lg"
            variant="light"
          />
          <Title marginTop="mt-4" textAlignment="text-center" color="indigo">
            No Facilities Found
          </Title>
          <Text marginTop="mt-2" textAlignment="text-center">
            Adding facilities will help Retake calculate the
            manufacturing-related emissions of products produced at that
            facility.
          </Text>
          <Flex
            marginTop="mt-6"
            justifyContent="justify-center"
            spaceX="space-x-4"
          >
            <Button
              text="Add New Facility"
              color="indigo"
              onClick={() => {
                setFacilityDrawerData({})
                setFacilityDrawerOpen(!facilityDrawerOpen)
              }}
            />
            {/* <SuppliersFlatfile /> */}
          </Flex>
        </div>
      )}
      {pagination !== undefined && (
        <Pagination pagination={pagination} onPageChange={setPagination} />
      )}
    </>
  )
}
