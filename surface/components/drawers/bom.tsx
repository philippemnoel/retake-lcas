import { useState } from "react"
import {
  Button,
  Text,
  TextInput,
  Flex,
  Dropdown,
  DropdownItem,
  Icon,
  Title,
  Divider,
  Bold,
} from "@tremor/react"
import { useUser } from "@auth0/nextjs-auth0"
import classNames from "classnames"
import { useRouter } from "next/router"
import axios from "axios"
import { v4 as uuidv4 } from "uuid"

import Upload from "../upload"
import BOMListFlatfile from "../flatfile/bomList"
import BOMFlatfile from "../flatfile/bom"
import { post } from "lib/api"
import { useNotification } from "../hooks"
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline"

const uploadOptions = ["Excel or CSV", "IMDS Report"]
const bomOptions = ["Single Bill of Materials", "Multiple Bill of Materials"]

export default ({ button }: { button: JSX.Element }) => {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [partId, setPartId] = useState("")
  const [weight, setWeight] = useState<number | undefined>(undefined)
  const [uploadOption, setUploadOption] = useState(uploadOptions[0])
  const [bomOption, setBomOptions] = useState(bomOptions[0])

  const { user } = useUser()
  const { withNotification } = useNotification()
  const router = useRouter()
  const uploadBucket = "evidence"

  return (
    <>
      <div onClick={() => setOpen(!open)}>{button}</div>
      <div
        id="drawer-contact"
        className={classNames(
          "bg-neutral-50 bg-opacity-70 backdrop-blur-md fixed top-0 -left-4 z-40 h-screen p-4 overflow-y-auto transition-transform w-80",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        tabIndex={-1}
        aria-labelledby="drawer-contact-label"
      >
        <div className="text-left py-2 relative h-full">
          <Flex justifyContent="justify-start" spaceX="space-x-3">
            <Icon
              icon={ClipboardDocumentListIcon}
              color="indigo"
              variant="light"
            />
            <Title>Upload File</Title>
          </Flex>
          <Divider />
          <Text>
            <Bold>Document Type *</Bold>
          </Text>
          <Dropdown
            marginTop="mt-1"
            onValueChange={(value: string) => setUploadOption(value)}
            value={uploadOption}
          >
            {uploadOptions.map((option, index) => (
              <DropdownItem value={option} text={option} key={index} />
            ))}
          </Dropdown>
          {uploadOption === uploadOptions[0] && (
            <>
              <Text marginTop="mt-4">
                <Bold>File Contents *</Bold>
              </Text>
              <Dropdown
                marginTop="mt-1"
                onValueChange={(value: string) => setBomOptions(value)}
                value={bomOption}
              >
                {bomOptions.map((option, index) => (
                  <DropdownItem value={option} text={option} key={index} />
                ))}
              </Dropdown>
            </>
          )}
          {((bomOption === bomOptions[0] &&
            uploadOption === uploadOptions[0]) ||
            bomOption === bomOptions[2]) && (
            <>
              <Text marginTop="mt-4">
                <Bold>Description *</Bold>
              </Text>
              <TextInput
                placeholder="Example Widget"
                marginTop="mt-1"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <Text marginTop="mt-4">
                <Bold>Identifier / SKU *</Bold>
              </Text>
              <TextInput
                placeholder="ABC-123456"
                marginTop="mt-1"
                value={partId}
                onChange={(event) => setPartId(event.target.value)}
              />
              <Text marginTop="mt-4">
                <Bold>Declared Unit Weight (Grams) *</Bold>
              </Text>
              <input
                type="text"
                value={weight ?? ""}
                className="mt-1 w-full rounded-md border border-gray-300 py-1.5"
                onChange={(event) => {
                  const weight = Number(event.target.value)
                  if (!isNaN(weight)) setWeight(Number(event.target.value))
                }}
                onKeyDown={(event) => {
                  const isNumber = /[0-9]/.test(event.key)
                  const isDecimalPoint = event.key === "."
                  const isBackspace = event.key === "Backspace"
                  if (!isNumber && !isDecimalPoint && !isBackspace) {
                    event.preventDefault()
                  }
                }}
              />
            </>
          )}
          <div className="absolute bottom-0">
            <Flex spaceX="space-x-4">
              {bomOption === bomOptions[0] &&
                uploadOption === uploadOptions[0] && (
                  <BOMFlatfile
                    disabled={
                      name === "" || partId === "" || (weight ?? 0) === 0
                    }
                    description={name}
                    weight={weight}
                    partId={partId}
                    onSuccess={() => {
                      setTimeout(() => {
                        router.reload()
                      }, 1500)
                    }}
                  />
                )}
              {bomOption === bomOptions[1] &&
                uploadOption === uploadOptions[0] && (
                  <BOMListFlatfile
                    disabled={false}
                    onSuccess={() => {
                      setTimeout(() => {
                        router.reload()
                      }, 1500)
                    }}
                  />
                )}
              {uploadOption === uploadOptions[1] && (
                <Upload
                  disabled={false}
                  onUpload={async (data: FormData) => {
                    if (
                      bomOption === bomOptions[0] &&
                      uploadOption === uploadOptions[0]
                    ) {
                      setOpen(false)
                    } else {
                      setPartId("")
                      setName("")
                      setWeight(undefined)
                      setOpen(false)
                    }

                    const lcaId = uuidv4()
                    await withNotification([
                      axios
                        .post(
                          `/api/storage/${user?.org_id}/upload?bucket=${uploadBucket}&orgId=${user?.org_id}&lcaId=${lcaId}`,
                          data
                        )
                        .then((response) =>
                          post("/api/gcp/imds", {
                            org_id: user?.org_id,
                            docs: response.data,
                            lca_id: lcaId,
                          })
                        ),
                    ])

                    setTimeout(() => {
                      router.reload()
                    }, 1500)
                  }}
                >
                  <Button text="Next Step: Upload" color="indigo" />
                </Upload>
              )}
              <Button
                text="Cancel"
                variant="light"
                color="indigo"
                onClick={() => setOpen(false)}
              />
            </Flex>
          </div>
        </div>
      </div>
    </>
  )
}
