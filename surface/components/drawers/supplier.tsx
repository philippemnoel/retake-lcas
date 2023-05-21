import {
  Button,
  Title,
  Text,
  Flex,
  TextInput,
  Divider,
  Icon,
  Bold,
} from "@tremor/react"
import { ClipboardDocumentIcon, TrashIcon } from "@heroicons/react/24/outline"
import classNames from "classnames"

import { SupplierData } from "lib/types/supabase-row.types"

type Props = {
  open: boolean
  data?: Partial<SupplierData>
  onSave: () => void
  onDismiss: () => void
  onChange: (data: Partial<SupplierData>) => void
  editOnly?: boolean
}

export default (props: Props) => {
  return (
    <>
      <div className="absolute top-0 right-0">
        <div
          id="drawer-contact"
          className={classNames(
            "fixed top-0 left-0 z-40 h-screen py-4 px-6 overflow-y-auto transition-transform w-80 bg-neutral-50",
            props.open ? "translate-x-0" : "-translate-x-full"
          )}
          tabIndex={-1}
          aria-labelledby="drawer-contact-label"
        >
          <div className="text-left py-2 relative h-full">
            <Flex justifyContent="justify-start" spaceX="space-x-3">
              <Icon
                icon={ClipboardDocumentIcon}
                color="indigo"
                variant="light"
              />
              <Title>Supplier</Title>
            </Flex>
            <Divider />
            <Text marginTop="mt-4">
              <Bold>Supplier Name</Bold>
            </Text>
            {props.editOnly ? (
              <Text marginTop="mt-1">{props.data?.name}</Text>
            ) : (
              <TextInput
                marginTop="mt-1"
                value={props.data?.name ?? ""}
                onChange={(event) =>
                  props.onChange({ name: event.target.value })
                }
                placeholder="Supplier and Co."
              />
            )}
            <Text marginTop="mt-4">
              <Bold>Supplier Website</Bold>
            </Text>
            <TextInput
              marginTop="mt-1"
              value={props.data?.website?.toString() ?? ""}
              onChange={(event) =>
                props.onChange({ website: event.target.value })
              }
              placeholder="http://supplier.com"
            />
            <Flex marginTop="mt-4">
              <Text>
                <Bold>Contact Emails</Bold>
              </Text>
              <Button
                text="Add New"
                color="indigo"
                variant="light"
                onClick={() => {
                  const contacts = props.data?.contacts ?? []
                  const lastContact =
                    contacts.length > 0 ? contacts[contacts.length - 1] : null
                  if (lastContact === "") return
                  props.onChange({
                    contacts: [...(props.data?.contacts ?? []), ""],
                  })
                }}
              />
            </Flex>
            <div className="max-h-[24rem] overflow-y-scroll">
              {props.data?.contacts?.map((contact, index) => (
                <Flex spaceX="space-x-4" marginTop="mt-1" key={index}>
                  <TextInput
                    value={contact}
                    onChange={(event) => {
                      const contacts = props.data?.contacts
                      if (!contacts) return
                      contacts[index] = event.target.value
                      props.onChange({ contacts: contacts })
                    }}
                    placeholder="john@supplier.com"
                  />
                  <Button
                    variant="light"
                    icon={TrashIcon}
                    color="indigo"
                    size="xs"
                    onClick={() => {
                      const contacts = props.data?.contacts ?? []

                      const before = [...contacts.slice(0, index)]
                      const after = [...contacts.slice(index + 1)]
                      props.onChange({ contacts: [...before, ...after] })
                    }}
                  />
                </Flex>
              ))}
            </div>
            <div className="absolute bottom-0">
              <Flex spaceX="space-x-4">
                <Button
                  text="Save"
                  color="indigo"
                  disabled={[props.data?.name].some(
                    (value) => value === undefined
                  )}
                  onClick={props.onSave}
                />
                <Button
                  text="Cancel"
                  color="indigo"
                  variant="light"
                  onClick={props.onDismiss}
                />
              </Flex>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
