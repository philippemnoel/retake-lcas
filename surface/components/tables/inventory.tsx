import { useEffect, useState } from "react"
import {
  Text,
  TableHeaderCell,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Flex,
  TextInput,
  Icon,
  Bold,
  Button,
  Title,
  MultiSelectBox,
  MultiSelectBoxItem,
  Badge,
} from "@tremor/react"
import {
  Bars3BottomLeftIcon,
  DocumentDuplicateIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline"
import { useUser } from "@auth0/nextjs-auth0"
import uniqBy from "lodash.uniqby"

import { useQuery, useNotification } from "../hooks"
import { isDevelopment } from "lib/utils"
import {
  upsertPart,
  upsertSupplier,
  upsertSupplierEngagement,
} from "lib/api/upsert"
import { engageSupplier } from "lib/api/effects"
import { PartsDataSchema } from "lib/api/schemas"
import { engagementStatus, Engagement } from "lib/constants/engagement"
import MaterialsFlatfile from "../flatfile/materials"
import ImpactBadge from "../badges/impact"
import EngagementBadge from "../badges/engagement"
import Skeleton from "../skeletons/list"
import Pagination from "./pagination"
import PartDrawer from "../drawers/part"
import PartsWithImpactsDrawer from "../drawers/partWithImpacts"
import RequestDrawer from "../drawers/request"
import SupplierDrawer from "../drawers/supplier"

import {
  CMLPartsWithImpactsData,
  PartsData,
  SupplierData,
} from "lib/types/supabase-row.types"
import {
  SUPPLIER_ENGAGEMENT_LOADING,
  SUPPLIER_ENGAGEMENT_SUCCESS,
} from "lib/constants/notifications"

type SuppliersDraft = Partial<SupplierData> | undefined

export default () => {
  // State variables
  const [selected, setSelected] = useState<
    Array<Partial<CMLPartsWithImpactsData>>
  >([])
  const [partsData, setPartsData] = useState<Partial<PartsData>>()
  const [partsWithImpactsData, setPartsWithImpactsData] =
    useState<Partial<CMLPartsWithImpactsData>>()

  const [suppliersDraft, setSuppliersDraft] =
    useState<SuppliersDraft>(undefined)
  const [showRequestDrawer, setShowRequestDrawer] = useState(false)
  const [showPartDrawer, setShowPartDrawer] = useState(false)
  const [showPartDetailedDrawer, setShowPartDetailedDrawer] = useState(false)
  const [showSupplierDrawer, setShowSupplierDrawer] = useState(false)
  const [supplierEditOnly, setSupplierEditOnly] = useState(false)
  const [filterSuppliers, setFilterSuppliers] = useState<Array<SupplierData>>(
    []
  )
  const [filterSupplierEngagement, setFilterSupplierEngagement] = useState<
    Array<Engagement>
  >([])
  const [supplierToEngage, setSupplierToEngage] =
    useState<Partial<SupplierData>>()

  const inFilters = [
    ...(filterSupplierEngagement.length > 0 ? ["supplier_engagement"] : []),
    ...(filterSuppliers.length > 0 ? ["supplier_id"] : []),
  ]

  // Hooks
  const { user } = useUser()
  const { withNotification } = useNotification()
  const {
    data,
    refresh: refreshParts,
    pagination,
    setPagination,
    searchQuery,
    setSearchQuery,
  } = useQuery<CMLPartsWithImpactsData>(
    "cml_parts_with_impacts",
    {
      orderAsc: "part_description",
      is_base_material: false,
      ...(filterSuppliers.length > 0 && {
        supplier_id: encodeURIComponent(
          JSON.stringify(filterSuppliers?.map((s) => s.id))
        ),
      }),
      ...(filterSupplierEngagement.length > 0 && {
        supplier_engagement: encodeURIComponent(
          JSON.stringify(filterSupplierEngagement)
        ),
      }),
      ...(inFilters.length > 0 && { inFilters }),
    },
    "part_description"
  )

  const filteredData = data?.filter((row) => row.customer_part_id !== null)

  const { data: suppliers, refresh: refreshSuppliers } =
    useQuery<SupplierData>("suppliers")
  const sameSupplierSelected = uniqBy(selected, "supplier_id").length === 1

  // Helper functions
  const addToSelected = (item: CMLPartsWithImpactsData, checked: boolean) => {
    const _selected = selected.slice()
    if (checked) {
      setSelected(
        uniqBy(
          [...selected, item],
          (i) => i.retake_part_id + (i.supplier_id ?? "")
        )
      )
    } else {
      setSelected(
        _selected.filter(
          (s) =>
            !(
              s.retake_part_id === item.retake_part_id &&
              (s.supplier_id ?? "") === (item.supplier_id ?? "")
            )
        )
      )
    }
  }

  const selectAll = (checked: boolean) => {
    if (!checked) {
      setSelected([])
    } else {
      setSelected(filteredData ?? [])
    }
  }

  const onRowClick = (data: CMLPartsWithImpactsData) => {
    setPartsData(PartsDataSchema.optional().parse(data))
    setPartsWithImpactsData(data)
    setShowPartDetailedDrawer(true)
    setSupplierToEngage({
      id: data.supplier_id ?? undefined,
      name: data.supplier_name,
      contacts: data.supplier_contacts,
    })
  }

  const onSaveMaterial = async () => {
    if (partsData) {
      await withNotification([upsertPart([partsData], user?.org_id)])
      refreshParts()
    }
  }

  const onSaveSupplier = async (values?: Partial<SupplierData>) => {
    if (!values) return

    const supplierId = `${values.name}-${user?.org_id}`
    const withSupplierId = {
      ...values,
      id: values?.id ?? supplierId,
    }

    setSupplierToEngage(values)

    await withNotification([
      upsertSupplier([withSupplierId], user?.org_id),
      upsertPart(
        [
          {
            ...partsData,
            supplier_ids: [...(partsData?.supplier_ids ?? []), supplierId],
          },
        ],
        user?.org_id
      ),
    ])

    refreshParts()
    refreshSuppliers()
  }

  const onEngageSupplier = async (
    parts: Array<Partial<CMLPartsWithImpactsData>>
  ) => {
    await withNotification(
      [
        ...parts.map((part) =>
          upsertSupplierEngagement(
            supplierToEngage?.id,
            part?.retake_part_id,
            user?.org_id,
            user?.organization_name as string,
            part?.part_description
          )
        ),
        ...(supplierToEngage?.contacts?.map((contact) =>
          engageSupplier(
            contact,
            user?.organization_name as string,
            supplierToEngage?.id
          )
        ) ?? []),
      ],
      SUPPLIER_ENGAGEMENT_LOADING,
      SUPPLIER_ENGAGEMENT_SUCCESS
    )
    refreshParts()
    setSelected([])
  }

  useEffect(() => {
    refreshParts()
  }, [filterSuppliers, filterSupplierEngagement])

  if (filteredData === undefined) return <Skeleton />

  return (
    <div className="relative">
      <PartDrawer
        open={showPartDrawer}
        onDismiss={() => setShowPartDrawer(false)}
        data={partsData}
        onChange={(data) => {
          setPartsData({ ...partsData, ...data })
        }}
        onSave={onSaveMaterial}
      />
      <PartsWithImpactsDrawer
        open={showPartDetailedDrawer}
        onDismiss={() => setShowPartDetailedDrawer(false)}
        partsData={partsData}
        partsWithImpactsData={partsWithImpactsData}
        onChangeParts={(data) => {
          setPartsData({ ...partsData, ...data })
        }}
        onSave={() => {
          onSaveMaterial()
        }}
        onEngageSupplier={() => {
          setShowPartDetailedDrawer(false)
          setShowRequestDrawer(true)
        }}
        onCreateSupplier={() => {
          setSuppliersDraft(undefined)
          setShowPartDetailedDrawer(false)
          setShowSupplierDrawer(true)
          setSupplierEditOnly(false)
        }}
      />
      <RequestDrawer
        open={showRequestDrawer}
        setOpen={setShowRequestDrawer}
        selectedParts={
          selected.length > 0 ? selected : partsData ? [partsData] : []
        }
        supplier={supplierToEngage}
        onEngageSupplier={onEngageSupplier}
        onEditSupplier={(supplier) => {
          setSuppliersDraft(supplier)
          setSupplierEditOnly(true)
          setShowSupplierDrawer(true)
        }}
      />
      <SupplierDrawer
        data={suppliersDraft}
        open={showSupplierDrawer}
        onChange={(data) => {
          setSuppliersDraft({ ...suppliersDraft, ...data })
        }}
        onSave={() => {
          onSaveSupplier(suppliersDraft)
          setShowSupplierDrawer(false)
          setSuppliersDraft(undefined)
        }}
        onDismiss={() => {
          setShowSupplierDrawer(false)
          setSuppliersDraft(undefined)
        }}
        editOnly={supplierEditOnly}
      />
      <div className="fixed w-[calc(100%-3rem)] lg:w-[calc(100%-20rem)] bg-white z-10 top-[3.75rem] py-4">
        <div className="flex justify-between">
          {selected.length === 0 ? (
            <Flex justifyContent="justify-start" spaceX="space-x-2">
              <Icon icon={Bars3BottomLeftIcon} variant="simple" color="stone" />
              <Text>{pagination.rows} items</Text>
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
                    setPartsData(PartsDataSchema.optional().parse(selected[0]))
                    setShowPartDetailedDrawer(!showPartDetailedDrawer)
                  }}
                />
              )}
              <Button
                text="Request Footprint from Supplier"
                variant="light"
                color="indigo"
                icon={DocumentDuplicateIcon}
                onClick={() => {
                  setPartsData(PartsDataSchema.optional().parse(selected[0]))
                  setSupplierToEngage({
                    id: selected[0]?.supplier_id ?? undefined,
                    contacts: selected[0]?.supplier_contacts,
                    name: selected[0]?.supplier_name,
                  })
                  setShowPartDetailedDrawer(false)
                  setShowRequestDrawer(!showRequestDrawer)
                }}
                disabled={!sameSupplierSelected}
              />
            </Flex>
          )}
          {selected.length === 0 && (
            <Flex spaceX="space-x-6" justifyContent="justify-end">
              <Button
                text="Create New Item"
                color="indigo"
                variant="light"
                onClick={() => {
                  setPartsData(undefined)
                  setShowPartDrawer(!showPartDrawer)
                }}
              />
              <MaterialsFlatfile
                disabled={false}
                onSuccess={() => {
                  refreshParts()
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
          <div className="max-w-md">
            <Flex justifyContent="justify-end" spaceX="space-x-4">
              <MultiSelectBox
                value={filterSuppliers}
                onValueChange={(value) => setFilterSuppliers(value)}
                placeholder="Filter by Supplier"
              >
                {suppliers?.map((supplier, index) => (
                  <MultiSelectBoxItem
                    text={supplier.name ?? ""}
                    value={supplier}
                    key={index}
                  />
                )) ?? <></>}
              </MultiSelectBox>
              <MultiSelectBox
                value={filterSupplierEngagement}
                onValueChange={(value) => setFilterSupplierEngagement(value)}
                placeholder="Filter by Engagement Status"
              >
                {engagementStatus?.map((item, index) => (
                  <MultiSelectBoxItem
                    text={item.name ?? ""}
                    value={item.value}
                    key={index}
                  />
                )) ?? <></>}
              </MultiSelectBox>
            </Flex>
          </div>
        </Flex>
      </div>
      <Table marginTop="mt-24">
        <TableHead>
          <TableRow>
            <TableHeaderCell>
              <input
                type="checkbox"
                className="h-4 w-4 rounded ring-1 ring-gray-300 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                onChange={(event) => {
                  selectAll(event.target.checked)
                }}
              />
            </TableHeaderCell>
            <TableHeaderCell>Item Name</TableHeaderCell>
            <TableHeaderCell>Identifier / SKU</TableHeaderCell>
            <TableHeaderCell>Supplier</TableHeaderCell>
            <TableHeaderCell>Supplier Engagement</TableHeaderCell>
            <TableHeaderCell>Default Origin</TableHeaderCell>
            <TableHeaderCell>Global Warming / kg</TableHeaderCell>
            {isDevelopment && (
              <TableHeaderCell>Last Disclosure Date</TableHeaderCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredData &&
            (filteredData?.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded ring-1 ring-gray-300 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    onChange={(event) => {
                      addToSelected(item, event.target.checked)
                    }}
                    checked={selected.some(
                      (s) =>
                        s.retake_part_id === item.retake_part_id &&
                        s.supplier_id === item.supplier_id
                    )}
                  />
                </TableCell>
                <TableCell>
                  <div
                    className="max-w-[10rem] cursor-pointer"
                    onClick={() => onRowClick(item)}
                  >
                    <Text truncate={true}>
                      <Bold>{item.part_description}</Bold>
                    </Text>
                  </div>
                </TableCell>
                <TableCell>
                  <div
                    className="max-w-[8rem] cursor-pointer"
                    onClick={() => onRowClick(item)}
                  >
                    <Text truncate={true}>{item.customer_part_id}</Text>
                  </div>
                </TableCell>
                <TableCell>
                  <div
                    className="max-w-[14rem] cursor-pointer"
                    onClick={() => onRowClick(item)}
                  >
                    {item.supplier_name ? (
                      <Text truncate={true}>{item.supplier_name}</Text>
                    ) : (
                      <Badge text="" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <EngagementBadge item={item} />
                </TableCell>
                <TableCell>
                  {item.origin ? <Text>{item.origin}</Text> : <Badge text="" />}
                </TableCell>
                <TableCell>
                  <div
                    className="cursor-pointer"
                    onClick={() => onRowClick(item)}
                  >
                    <ImpactBadge
                      activity={item.reference_product_name}
                      database={item.database_name}
                      source={item.impact_source}
                      impact={item.global_warming}
                      isLeaf={true}
                    />
                  </div>
                </TableCell>
                {isDevelopment && (
                  <TableHeaderCell>
                    <Badge text="" />
                  </TableHeaderCell>
                )}
              </TableRow>
            )) as any)}
        </TableBody>
      </Table>
      {filteredData.length === 0 && (
        <div className="w-full pt-16 max-w-sm mx-auto text-center">
          <Icon
            icon={ExclamationTriangleIcon}
            color="indigo"
            size="lg"
            variant="light"
          />
          <Title marginTop="mt-4" textAlignment="text-center" color="indigo">
            No Items Found
          </Title>
          <Text marginTop="mt-2" textAlignment="text-center">
            An item is any component, part, or material that goes into making
            the final product.
          </Text>
          <Flex
            marginTop="mt-6"
            justifyContent="justify-center"
            spaceX="space-x-4"
          >
            <Button
              text="Create New Item"
              color="indigo"
              onClick={() => {
                setPartsData(undefined)
                setShowPartDrawer(!showPartDrawer)
              }}
            />
            <MaterialsFlatfile
              disabled={false}
              onSuccess={() => {
                refreshParts()
              }}
            />
          </Flex>
        </div>
      )}
      {pagination !== undefined && (
        <Pagination pagination={pagination} onPageChange={setPagination} />
      )}
    </div>
  )
}
