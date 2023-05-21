import { useState } from "react"
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
  Badge,
} from "@tremor/react"
import {
  Bars3BottomLeftIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline"
import { useUser } from "@auth0/nextjs-auth0"
import uniqBy from "lodash.uniqby"

import { useQuery } from "../hooks"
import { upsertSupplier } from "lib/api/upsert"
import { useNotification } from "../hooks"
import Skeleton from "../skeletons/list"
import Pagination from "./pagination"
import SupplierDrawer from "../drawers/supplier"
import SuppliersFlatfile from "../flatfile/suppliers"
import { SupplierData } from "lib/types/supabase-row.types"
import { removeSupplier } from "lib/api/remove"

type SuppliersDraft = Partial<SupplierData> | undefined

const SupplierCell = ({ suppliers }: { suppliers: Array<string> | null }) => {
  if ((suppliers ?? []).length === 0 || suppliers === null) return <></>

  if (suppliers?.length === 1)
    return <Text truncate={true}>{suppliers[0]}</Text>

  return (
    <Flex justifyContent="justify-start" spaceX="space-x-2">
      <Text truncate={true}>{suppliers[0]}</Text>
      <Text color="indigo">+{suppliers.length - 1} more</Text>
    </Flex>
  )
}

export default () => {
  const { user } = useUser()
  const {
    data,
    refresh,
    pagination,
    setPagination,
    searchQuery,
    setSearchQuery,
  } = useQuery<SupplierData>(
    "suppliers",
    {
      orderAsc: "name",
    },
    "name"
  )

  const { withNotification } = useNotification()

  const [selected, setSelected] = useState<Array<SupplierData>>([])
  const [suppliersDraft, setSuppliersDraft] =
    useState<SuppliersDraft>(undefined)
  const [[showSupplierDrawer, supplierDrawerEditOnly], setShowSupplierDrawer] =
    useState([false, false])

  const addToSelected = (item: SupplierData, checked: boolean) => {
    const _selected = selected.slice()
    if (checked) {
      setSelected(uniqBy([...selected, item], "id"))
    } else {
      setSelected(_selected.filter((s) => s.id !== item.id))
    }
  }

  const selectAll = (checked: boolean) => {
    if (!checked) {
      setSelected([])
    } else {
      setSelected(data ?? [])
    }
  }

  const editSupplier = (value: SupplierData, canEditName: boolean) => {
    setSuppliersDraft(value)
    setShowSupplierDrawer([true, !canEditName])
  }

  const onSaveSupplier = async (value?: Partial<SupplierData>) => {
    if (!value) return

    const supplier = {
      ...value,
      ...(value.contacts && {
        contacts: value.contacts.filter((contact) => contact !== ""),
      }),
      id: value.id ?? `${value.name}-${user?.org_id}`,
    }

    await withNotification([upsertSupplier([supplier], user?.org_id)])

    refresh()
  }

  const onRemove = async () => {
    await withNotification(
      selected?.map((item) => removeSupplier(item.id, user?.org_id))
    )

    refresh()
    setSelected([])
  }

  if (data === undefined) return <Skeleton />

  return (
    <>
      <SupplierDrawer
        data={suppliersDraft}
        open={showSupplierDrawer}
        onChange={(data) => {
          setSuppliersDraft({ ...suppliersDraft, ...data })
        }}
        onSave={() => {
          onSaveSupplier(suppliersDraft)
          setShowSupplierDrawer([false, false])
          setSuppliersDraft(undefined)
        }}
        onDismiss={() => {
          setShowSupplierDrawer([false, false])
          setSuppliersDraft(undefined)
        }}
        editOnly={supplierDrawerEditOnly}
      />
      <div className="fixed w-[calc(100%-3rem)] lg:w-[calc(100%-20rem)] bg-white z-10 top-[3.75rem] py-4">
        <div className="flex justify-between">
          {selected.length === 0 ? (
            <Flex justifyContent="justify-start" spaceX="space-x-2">
              <Icon icon={Bars3BottomLeftIcon} variant="simple" color="stone" />
              <Text>{pagination.rows} suppliers</Text>
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
                    editSupplier(selected[0], true)
                  }}
                />
              )}
              <Button
                text="Remove"
                variant="light"
                color="indigo"
                icon={TrashIcon}
                onClick={() => onRemove()}
              />
            </Flex>
          )}
          {selected.length === 0 && (
            <Flex spaceX="space-x-6" justifyContent="justify-end">
              <Button
                text="Add New Supplier"
                color="indigo"
                variant="light"
                onClick={() => {
                  setSuppliersDraft(undefined)
                  setShowSupplierDrawer([true, false])
                }}
              />
              <SuppliersFlatfile />
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
      <Table marginTop="mt-24">
        <TableHead>
          <TableRow>
            <TableHeaderCell>
              {" "}
              <input
                type="checkbox"
                className="h-4 w-4 rounded ring-1 ring-gray-300 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                onChange={(event) => {
                  selectAll(event.target.checked)
                }}
              />
            </TableHeaderCell>
            <TableHeaderCell>Supplier Name</TableHeaderCell>
            <TableHeaderCell>Website</TableHeaderCell>
            <TableHeaderCell>Contact(s)</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {
            data?.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded ring-1 ring-gray-300 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    onChange={(event) => {
                      addToSelected(item, event.target.checked)
                    }}
                    checked={selected.some((row) => row.id === item.id)}
                  />
                </TableCell>
                <TableCell>
                  <div
                    className="cursor-pointer"
                    onClick={() => {
                      editSupplier(item, true)
                    }}
                  >
                    <Text truncate={true}>
                      <Bold>{item.name}</Bold>
                    </Text>
                  </div>
                </TableCell>
                <TableCell>
                  <div
                    className="cursor-pointer"
                    onClick={() => {
                      editSupplier(item, true)
                    }}
                  >
                    {item.website ? (
                      <Text truncate={true}>{item.website}</Text>
                    ) : (
                      <Badge text="" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div
                    className="cursor-pointer"
                    onClick={() => {
                      editSupplier(item, false)
                    }}
                  >
                    {(item.contacts?.length ?? 0) > 0 ? (
                      <SupplierCell suppliers={item.contacts} />
                    ) : (
                      <Badge text="" />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )) as any
          }
        </TableBody>
      </Table>
      {data?.length === 0 && (
        <div className="w-full pt-16 max-w-sm mx-auto text-center">
          <Icon
            icon={ExclamationTriangleIcon}
            color="indigo"
            size="lg"
            variant="light"
          />
          <Title marginTop="mt-4" textAlignment="text-center" color="indigo">
            No Suppliers Found
          </Title>
          <Text marginTop="mt-2" textAlignment="text-center">
            Once imported, Retake can automatically collect first-party,
            product-level carbon footprint data from suppliers.
          </Text>
          <Flex
            marginTop="mt-6"
            justifyContent="justify-center"
            spaceX="space-x-4"
          >
            <Button
              text="Add New Supplier"
              color="indigo"
              onClick={() => {
                setSuppliersDraft(undefined)
                setShowSupplierDrawer([true, false])
              }}
            />
            <SuppliersFlatfile />
          </Flex>
        </div>
      )}
      {pagination !== undefined && (
        <Pagination pagination={pagination} onPageChange={setPagination} />
      )}
    </>
  )
}
