import {
  Button,
  Title,
  Flex,
  Divider,
  Icon,
  Card,
  Text,
  Bold,
  Badge,
} from "@tremor/react"
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline"
import classNames from "classnames"

import { CMLPartsWithImpactsData } from "lib/types/supabase-row.types"

type Props = {
  open: boolean
  data?: Partial<CMLPartsWithImpactsData>
  onDismiss: () => void
}

export default (props: Props) => {
  return (
    <>
      <div className="absolute top-0 right-0">
        <div
          id="drawer-contact"
          className={classNames(
            "fixed top-0 left-0 z-40 h-screen py-4 px-6 overflow-y-auto transition-transform w-96 bg-neutral-50 bg-opacity-70 backdrop-blur",
            props.open ? "translate-x-0" : "-translate-x-full"
          )}
          tabIndex={-1}
          aria-labelledby="drawer-contact-label"
        >
          <div className="text-left py-2 relative h-full">
            <Flex justifyContent="justify-start" spaceX="space-x-3">
              <Icon
                icon={DocumentDuplicateIcon}
                color="indigo"
                variant="light"
              />
              <Title truncate={true}>{props.data?.part_description}</Title>
            </Flex>
            <Divider />
            <div className="max-h-[calc(100vh-12rem)] overflow-y-scroll p-1">
              <Card shadow={false}>
                <Title>EPD Details</Title>
                <Divider />
                <Flex>
                  <Text>
                    <Bold>Verified By Retake</Bold>
                  </Text>
                  <Badge text="Yes" color="indigo" size="xs" />
                </Flex>
                <Flex marginTop="mt-3">
                  <Text>
                    <Bold>Verified By</Bold>
                  </Text>
                  <Text truncate={true}>Dr. Lawrence Stanton, LCACP</Text>
                </Flex>
                <Flex marginTop="mt-3">
                  <Text>
                    <Bold>Issued</Bold>
                  </Text>
                  <Text>May 8, 2022</Text>
                </Flex>
                <Flex marginTop="mt-3">
                  <Text>
                    <Bold>Expires</Bold>
                  </Text>
                  <Text>May 8, 2026</Text>
                </Flex>
              </Card>
              <Card shadow={false} marginTop="mt-6">
                <Title>Documents</Title>
                <Divider />
                <Flex>
                  <Text>
                    <Bold>EPD_Verified.pdf</Bold>
                  </Text>
                  <Button text="View" variant="light" color="indigo" />
                </Flex>
              </Card>
              <Card shadow={false} marginTop="mt-6">
                <Title>Evidence</Title>
                <Divider />
                <Flex>
                  <Text>
                    <Bold>bill_of_materials.pdf</Bold>
                  </Text>
                  <Button text="View" variant="light" color="indigo" />
                </Flex>
                <Flex marginTop="mt-3">
                  <Text>
                    <Bold>utilities.pdf</Bold>
                  </Text>
                  <Button text="View" variant="light" color="indigo" />
                </Flex>
              </Card>
            </div>
            <div className="absolute bottom-0">
              <Flex spaceX="space-x-4">
                <Button text="Close" color="indigo" onClick={props.onDismiss} />
              </Flex>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
