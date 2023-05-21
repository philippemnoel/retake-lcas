import { useState } from "react"
import {
  Button,
  Title,
  Text,
  Flex,
  MultiSelectBox,
  MultiSelectBoxItem,
  Divider,
  Icon,
  Bold,
} from "@tremor/react"
import { Bars3BottomLeftIcon } from "@heroicons/react/24/outline"
import classNames from "classnames"

import {
  CMLPartsWithImpactsData,
  SupplierData,
} from "lib/types/supabase-row.types"

const ListCell = ({ items }: { items: Array<string> | null }) => {
  if ((items ?? []).length === 0 || items === null) return <></>

  if (items?.length === 1) return <Text truncate={true}>{items[0]}</Text>

  return (
    <Flex spaceX="space-x-2">
      <Flex justifyContent="justify-start">
        {items.length === 1 ? (
          <Text truncate={true}>{items[0]}</Text>
        ) : (
          <Text truncate={true}>{items.length} selected</Text>
        )}
      </Flex>
    </Flex>
  )
}

export default ({
  open,
  setOpen,
  onEditSupplier,
  onEngageSupplier,
  selectedParts,
  supplier,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  onEngageSupplier: (parts: Array<Partial<CMLPartsWithImpactsData>>) => void
  onEditSupplier: (
    supplier: Partial<CMLPartsWithImpactsData> | undefined
  ) => void
  selectedParts: Array<Partial<CMLPartsWithImpactsData>>
  supplier: Partial<SupplierData> | undefined
}) => {
  const [contacts, setContacts] = useState<Array<string>>([])

  return (
    <>
      <div className="absolute top-0 right-0">
        <div
          id="drawer-contact"
          className={classNames(
            "fixed top-0 -right-96 z-40 h-screen py-4 px-6 overflow-y-auto transition-transform w-96 bg-neutral-50 bg-opacity-70 backdrop-blur-md",
            open ? "-translate-x-full" : "-translate-x-0"
          )}
          tabIndex={-1}
          aria-labelledby="drawer-contact-label"
        >
          <div className="text-left py-2 relative h-full">
            <Flex justifyContent="justify-start" spaceX="space-x-3">
              <Icon icon={Bars3BottomLeftIcon} color="indigo" variant="light" />
              <Title>Request Data</Title>
            </Flex>
            <Divider />
            <Text truncate={true} marginTop="mt-1">
              <Bold>Part Identifier / SKU</Bold>
            </Text>
            <ListCell
              items={
                selectedParts?.map((part) => part?.customer_part_id ?? "") ?? (
                  <></>
                )
              }
            />
            <Text truncate={true} marginTop="mt-4">
              <Bold>Part Description</Bold>
            </Text>
            <ListCell
              items={
                selectedParts?.map((part) => part?.part_description ?? "") ?? (
                  <></>
                )
              }
            />
            <Flex marginTop="mt-4">
              <Text>
                <Bold>People to Contact</Bold>
              </Text>
              <Button
                text="Add New Contact"
                color="indigo"
                variant="light"
                onClick={() => onEditSupplier(supplier)}
              />
            </Flex>
            {supplier?.contacts !== undefined && (
              <MultiSelectBox
                marginTop="mt-1"
                value={contacts}
                onValueChange={(value) => {
                  setContacts(value)
                }}
              >
                {supplier.contacts?.map((contact, index) => (
                  <MultiSelectBoxItem
                    text={contact}
                    value={contact}
                    key={index}
                  />
                )) ?? <></>}
              </MultiSelectBox>
            )}
            <div className="absolute bottom-0">
              <Flex spaceX="space-x-4">
                <Button
                  text="Send Request(s)"
                  color="indigo"
                  disabled={(contacts ?? []).length === 0}
                  onClick={() => {
                    onEngageSupplier(selectedParts)
                    setOpen(false)
                  }}
                />
                <Button
                  text="Cancel"
                  color="indigo"
                  variant="light"
                  onClick={() => setOpen(false)}
                />
              </Flex>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
