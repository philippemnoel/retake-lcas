import { useState } from "react"
import {
  Text,
  TableHeaderCell,
  Card,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Flex,
  TextInput,
  Button,
  Icon,
  Bold,
  Badge,
} from "@tremor/react"
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  UserCircleIcon,
  ExclamationTriangleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import { useUser } from "@auth0/nextjs-auth0"
import sumBy from "lodash.sumby"

import Skeleton from "@/components/skeletons/list"
import DisposalDrawer from "@/components/drawers/disposal"
import ImpactBadge from "@/components/badges/impact"
import Menu from "@/components/menus"
import Empty from "@/components/empty"
import CompletionButton from "@/components/buttons/completion"
import { usePart, useLCAResults, useNotification } from "@/components/hooks"

import { formatNumber, isDevelopment } from "lib/utils"
import { upsertDisposal } from "lib/api/upsert"
import { updateLCA } from "lib/api/update"
import disposal, {
  DefaultDisposalAverage,
  Disposal,
  DisposalAverages,
} from "lib/calculator/disposal"
import { removeEndOfLife } from "lib/api/remove"
import { Methodology } from "lib/calculator/methodologies"
import { EndOfLifeWithImpacts, LCAStage } from "lib/types/calculator.types"

const defaultDisposalTypes = [
  Disposal.INCINERATION_MUNICIPAL,
  Disposal.LANDFILL,
  Disposal.RECYCLING,
]

export default ({
  lcaID,
  complete,
  refresh,
}: {
  lcaID: string
  complete: boolean
  refresh: () => void
}) => {
  const [showDisposalDrawer, setShowDisposalDrawer] = useState(false)
  const [defaults, setDefaults] = useState<EndOfLifeWithImpacts>()
  const { data, refresh: refreshDisposal } =
    useLCAResults<EndOfLifeWithImpacts>("disposal", {
      lca_id: lcaID,
      methodology: Methodology.CML,
    })

  const { part } = usePart(lcaID)
  const { user } = useUser()
  const { withNotification } = useNotification()

  const totalPercentDisposed =
    sumBy(data, (item) => (item?.weight_grams ?? 0) * 100) /
    (part?.weight_grams ?? 1)
  const percentTooHigh = totalPercentDisposed > 101
  const percentTooLow = totalPercentDisposed < 99

  const canMarkComplete = !percentTooHigh && !percentTooLow

  const editDisposal = (value: EndOfLifeWithImpacts) => {
    setDefaults(value)
    setShowDisposalDrawer(!showDisposalDrawer)
  }

  const onSaveDisposal = async (value: Partial<EndOfLifeWithImpacts>) => {
    if (value?.description === Disposal.GENERAL) {
      const disposalAverage = (DisposalAverages.find(
        (item) => item.location === value.location
      ) ?? DefaultDisposalAverage) as {
        [key in Disposal]: number
      }

      const disposalPayloads = defaultDisposalTypes.map((type) => ({
        ...value,
        weight_grams: disposalAverage[type] * (value.weight_grams ?? 0),
        id: value?.id ?? undefined,
        lca_id: lcaID,
        org_id: user?.org_id,
        factor_id: disposal.find((item) => item.name === type)?.factor_id,
        description: type,
      }))

      await withNotification([
        upsertDisposal(disposalPayloads, user?.org_id),
        updateLCA({
          lca_id: lcaID,
          org_id: user?.org_id,
          end_of_life_completed: false,
        }),
      ])
    } else {
      const disposalPayload = {
        ...value,
        id: value?.id ?? undefined,
        lca_id: lcaID,
        org_id: user?.org_id,
        factor_id: disposal.find((item) => item.name === value.description)
          ?.factor_id,
      }
      await withNotification([
        upsertDisposal([disposalPayload], user?.org_id),
        updateLCA({
          lca_id: lcaID,
          org_id: user?.org_id,
          end_of_life_completed: false,
        }),
      ])
    }
    refreshDisposal()
    refresh()
  }

  const onRemoveDisposal = async (value: EndOfLifeWithImpacts) => {
    await withNotification([
      removeEndOfLife(value.id, lcaID, user?.org_id),
      updateLCA({
        lca_id: lcaID,
        org_id: user?.org_id,
        end_of_life_completed: false,
      }),
    ])
    refreshDisposal()
    refresh()
  }

  if (data === undefined || part === undefined || !user?.org_id)
    return (
      <Card shadow={false}>
        <Skeleton />
      </Card>
    )

  if (part.weight_grams === null || part.weight_grams === 0)
    return (
      <div className="text-center py-8 flex flex-col justify-center">
        <div className="mx-auto">
          <Icon icon={ExclamationTriangleIcon} color="indigo" size="lg" />
          <Text marginTop="mt-2">
            A weight for {part.part_description ?? "the product"} must be
            provided in the Materials section before its end of life can be
            measured.
          </Text>
        </div>
      </div>
    )

  return (
    <Card shadow={false}>
      <DisposalDrawer
        open={showDisposalDrawer}
        setOpen={setShowDisposalDrawer}
        defaults={defaults}
        onSave={onSaveDisposal}
        totalWeight={part.weight_grams}
      />
      <Flex spaceX="space-x-6">
        <TextInput
          placeholder="Search"
          maxWidth="max-w-sm"
          icon={MagnifyingGlassIcon}
        />
        <Flex justifyContent="justify-end" spaceX="space-x-8">
          <Button
            text="Add Disposal Activity"
            color="indigo"
            variant="light"
            icon={ArrowPathIcon}
            onClick={() => {
              setShowDisposalDrawer(!showDisposalDrawer)
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
            stage={LCAStage.DISPOSAL}
            onRefresh={refresh}
          />
        </Flex>
      </Flex>
      {data.length > 0 ? (
        <Table marginTop="mt-4">
          <TableHead>
            <TableRow>
              <TableHeaderCell> </TableHeaderCell>
              <TableHeaderCell>Disposal Type</TableHeaderCell>
              <TableHeaderCell>Percent Disposed this Way</TableHeaderCell>
              <TableHeaderCell>Location </TableHeaderCell>
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
              <TableCell>
                <Flex>
                  <Text>
                    <Bold>{formatNumber(totalPercentDisposed ?? 0)} %</Bold>
                  </Text>
                  {percentTooHigh && (
                    <Badge
                      text="Too high"
                      size="xs"
                      color="amber"
                      tooltip="The total percentage must equal 100%"
                      icon={ExclamationTriangleIcon}
                    />
                  )}
                  {percentTooLow && (
                    <Badge
                      text="Too low"
                      size="xs"
                      color="amber"
                      tooltip="The total percentage must equal 100%"
                      icon={ExclamationTriangleIcon}
                    />
                  )}
                </Flex>
              </TableCell>
              <TableCell> </TableCell>
              <TableCell>
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
                            onRemoveDisposal(item)
                          },
                        },
                      ]}
                    />
                  </TableCell>
                  <TableCell>
                    <div
                      className="cursor-pointer"
                      onClick={() => {
                        editDisposal(item)
                      }}
                    >
                      <Text>{item.description}</Text>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className="cursor-pointer"
                      onClick={() => {
                        editDisposal(item)
                      }}
                    >
                      <Text>
                        {formatNumber(
                          ((item?.weight_grams ?? 0) * 100) /
                            (part?.weight_grams ?? 1)
                        )}{" "}
                        %
                      </Text>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className="cursor-pointer"
                      onClick={() => {
                        editDisposal(item)
                      }}
                    >
                      <Text>{item.location}</Text>
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
            title="No Disposal Activities Found"
            description="Specify how this product is expected to be disposed at the end of
          its life."
            buttons={[
              <Button
                icon={ArrowPathIcon}
                text="Add Diposal Activity"
                color="indigo"
                onClick={() => {
                  setDefaults(undefined)
                  setShowDisposalDrawer(!showDisposalDrawer)
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
