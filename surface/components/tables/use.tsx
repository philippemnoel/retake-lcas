import { useState } from "react"
import {
  MagnifyingGlassIcon,
  TrashIcon,
  PlusCircleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline"
import {
  Bold,
  Text,
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
  Divider,
  Badge,
} from "@tremor/react"
import { useUser } from "@auth0/nextjs-auth0"
import sumBy from "lodash.sumby"
import mapValues from "lodash.mapvalues"
import groupBy from "lodash.groupby"

import Menu from "@/components/menus"
import Skeleton from "@/components/skeletons/list"
import ServiceDrawer from "@/components/drawers/service"
import UseDrawer from "@/components/drawers/use"
import ImpactBadge from "@/components/badges/impact"
import Empty from "@/components/empty"
import CompletionButton from "@/components/buttons/completion"
import { useQuery, useLCAResults } from "@/components/hooks"
import { useNotification } from "@/components/hooks"

import { UseType, ServiceLifeData } from "lib/types/supabase-row.types"
import { LCAStage, UsePhaseWithImpacts } from "lib/types/calculator.types"

import { upsertServiceLife, upsertUsePhase } from "lib/api/upsert"
import { updateLCA } from "lib/api/update"
import { isDevelopment, makeSingular, formatNumber } from "lib/utils"
import {
  lookupUseTypeDescription,
  lookupUseTypeUnits,
} from "lib/calculator/use"
import { regions } from "lib/calculator/factors"
import { removeUsePhase } from "lib/api/remove"
import { Methodology } from "lib/calculator/methodologies"

const lookupFactorId = (
  useType: UseType,
  location: string
): string | undefined => {
  const region = regions.find(({ name }) => name === location)
  switch (useType) {
    case "WATER":
      return region?.water_factor_id
    case "PETROL":
      return region?.petrol_factor_id
    case "NATURAL_GAS":
      return region?.natural_gas_factor_id
    case "ELECTRICITY":
      return region?.energy_factor_id
  }
}

const canSaveServiceLife = (data?: Partial<ServiceLifeData> | null) => {
  return (
    Boolean(data?.has_use_phase && data?.quantity && data?.unit) ||
    !data?.has_use_phase
  )
}

const canSaveUsePhase = (data?: Partial<UsePhaseWithImpacts> | null) => {
  return Boolean(data?.use_type && data?.location && data?.quantity)
}

export default ({
  lcaID,
  complete,
  refresh,
}: {
  lcaID: string
  complete: boolean
  refresh: () => void
}) => {
  const [serviceLifeDrawerOpen, setServiceLifeDrawerOpen] = useState(false)
  const [draftServiceLifeData, setDraftServiceLifeData] = useState<
    Partial<ServiceLifeData> | undefined
  >(undefined)

  const [usePhaseDrawerOpen, setUsePhaseDrawerOpen] = useState(false)
  const [draftUsePhaseData, setDraftUsePhaseData] = useState<
    Partial<UsePhaseWithImpacts> | undefined
  >(undefined)

  const { user } = useUser()
  const { withNotification } = useNotification()

  const { data: serviceLife, refresh: refreshServiceLife } =
    useQuery<ServiceLifeData>("service_life", {
      lca_id: lcaID,
    })

  const { data: usePhase, refresh: refreshUsePhase } =
    useLCAResults<UsePhaseWithImpacts>("use", {
      lca_id: lcaID,
      methodology: Methodology.CML,
    })

  const usePhasesTotal100Percent = Object.values(
    mapValues(groupBy(usePhase, "description"), (items) =>
      sumBy(items, "percent_at_location")
    )
  ).every((percent) => percent === 100)

  const canMarkComplete =
    serviceLife?.[0]?.has_use_phase === false ||
    (serviceLife?.[0]?.has_use_phase === true &&
      (usePhase?.length ?? 0) > 0 &&
      usePhasesTotal100Percent)

  const onSaveServiceLife = async (value: Partial<ServiceLifeData>) => {
    await withNotification([
      upsertServiceLife({
        ...value,
        has_use_phase: value?.has_use_phase ?? false,
        lca_id: lcaID,
        org_id: user?.org_id,
      }),
      updateLCA({
        lca_id: lcaID,
        org_id: user?.org_id,
        use_phase_completed: false,
      }),
    ])

    refreshServiceLife()
    refreshUsePhase()
    refresh()
    setDraftServiceLifeData({})
  }

  const onSaveUsePhase = async (value: Partial<UsePhaseWithImpacts>) => {
    let factor_id: string | undefined
    if (value.use_type && value.location && user?.org_id) {
      factor_id = lookupFactorId(value.use_type, value.location)
    }

    await withNotification([
      upsertUsePhase({
        ...value,
        factor_id,
        id: value.id ?? undefined,
        lca_id: lcaID,
        org_id: user?.org_id,
      }),
      updateLCA({
        lca_id: lcaID,
        org_id: user?.org_id,
        use_phase_completed: false,
      }),
    ])

    refreshUsePhase()
    refresh()
    setDraftUsePhaseData({})
  }

  const editUsePhase = (value: UsePhaseWithImpacts) => {
    setDraftUsePhaseData(value)
    setUsePhaseDrawerOpen(!usePhaseDrawerOpen)
  }

  const onRemoveUsePhase = async (value: Partial<UsePhaseWithImpacts>) => {
    await withNotification([
      removeUsePhase(value.id, lcaID, user?.org_id),
      updateLCA({
        lca_id: lcaID,
        org_id: user?.org_id,
        use_phase_completed: false,
      }),
    ])
    refreshUsePhase()
    refresh()
  }

  if (serviceLife === undefined || usePhase === undefined)
    return (
      <Card shadow={false}>
        <Skeleton />
      </Card>
    )

  return (
    <Card shadow={false}>
      <ServiceDrawer
        open={serviceLifeDrawerOpen}
        data={draftServiceLifeData}
        canSave={canSaveServiceLife(draftServiceLifeData)}
        onChange={(key, value) =>
          setDraftServiceLifeData({ ...draftServiceLifeData, [key]: value })
        }
        onDismiss={() => setServiceLifeDrawerOpen(false)}
        onSave={() => {
          setServiceLifeDrawerOpen(false)
          onSaveServiceLife(draftServiceLifeData ?? {})
        }}
      />
      <UseDrawer
        open={usePhaseDrawerOpen}
        data={draftUsePhaseData}
        canSave={canSaveUsePhase(draftUsePhaseData)}
        onChange={(key, value) =>
          setDraftUsePhaseData({ ...draftUsePhaseData, [key]: value })
        }
        onDismiss={() => {
          setUsePhaseDrawerOpen(false)
          setDraftUsePhaseData({})
        }}
        onSave={() => {
          setUsePhaseDrawerOpen(false)
          if (draftUsePhaseData) onSaveUsePhase(draftUsePhaseData)
        }}
        serviceLifeUnit={makeSingular(serviceLife?.[0]?.unit ?? "Unit")}
      />
      {serviceLife.length === 0 && (
        <div className="pb-12">
          <Empty
            title="No Use Phase Set"
            description="Specifiy whether this product consumes power or other carbon-emitting resources during its service life."
            buttons={[
              <Button
                icon={PlusCircleIcon}
                text="Set Use Phase"
                color="indigo"
                onClick={() => {
                  setDraftServiceLifeData(serviceLife[0])
                  setServiceLifeDrawerOpen(!serviceLifeDrawerOpen)
                }}
                key={0}
              />,
            ]}
          />
        </div>
      )}
      {serviceLife.length > 0 && (
        <>
          <Flex spaceX="space-x-4" justifyContent="justify-start">
            <Flex spaceX="space-x-2" justifyContent="justify-start">
              <Text>
                <Bold>Use Phase:</Bold>
              </Text>
              <Badge
                text={
                  serviceLife?.[0]?.has_use_phase
                    ? `${serviceLife?.[0]?.quantity ?? ""} ${
                        serviceLife?.[0]?.unit ?? "Unset"
                      }`
                    : "No relevant use phase"
                }
                color="indigo"
              />
            </Flex>
            <Flex justifyContent="justify-end" spaceX="space-x-8">
              <Button
                text={serviceLife.length > 0 ? "Change" : "Set Use Phase"}
                color="indigo"
                variant={serviceLife.length > 0 ? "light" : "primary"}
                onClick={() => {
                  setDraftServiceLifeData(serviceLife[0])
                  setServiceLifeDrawerOpen(true)
                }}
              />
              <CompletionButton
                complete={complete}
                canMarkComplete={canMarkComplete}
                lcaID={lcaID}
                stage={LCAStage.USE}
                onRefresh={refresh}
              />
            </Flex>
          </Flex>
          {serviceLife?.[0]?.has_use_phase && (
            <>
              <Divider />
              <Flex>
                <TextInput
                  placeholder="Search"
                  maxWidth="max-w-sm"
                  icon={MagnifyingGlassIcon}
                />
                <Flex justifyContent="justify-end" spaceX="space-x-8">
                  <Button
                    text="Add Use Phase"
                    icon={PlusCircleIcon}
                    onClick={() => {
                      setUsePhaseDrawerOpen(!usePhaseDrawerOpen)
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
                      color="stone"
                    />
                  )}
                </Flex>
              </Flex>
              {usePhase.length > 0 ? (
                <Table marginTop="mt-4">
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell> </TableHeaderCell>
                      <TableHeaderCell>Description</TableHeaderCell>
                      <TableHeaderCell>
                        Amount Per{" "}
                        {makeSingular(serviceLife?.[0]?.unit ?? "Unit")}
                      </TableHeaderCell>
                      <TableHeaderCell>Service Life Total</TableHeaderCell>
                      <TableHeaderCell>Location</TableHeaderCell>
                      <TableHeaderCell>
                        Percent Used at Location
                      </TableHeaderCell>
                      <TableHeaderCell>Global Warming</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Text color="indigo">
                          <Bold>Total ({usePhase.length})</Bold>
                        </Text>
                      </TableCell>
                      <TableCell> </TableCell>
                      <TableCell> </TableCell>
                      <TableCell> </TableCell>
                      <TableCell> </TableCell>
                      <TableCell> </TableCell>
                      <TableCell>
                        <Text>
                          <Bold>
                            {formatNumber(
                              sumBy(usePhase, "total_global_warming") ?? 0
                            )}{" "}
                            kg CO2-Eq
                          </Bold>
                        </Text>
                      </TableCell>
                    </TableRow>
                    {
                      usePhase?.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Menu
                              options={[
                                {
                                  name: "Remove",
                                  icon: TrashIcon,
                                  onClick: () => {
                                    onRemoveUsePhase(item)
                                  },
                                },
                              ]}
                            />
                          </TableCell>
                          <TableCell>
                            <div
                              className="cursor-pointer"
                              onClick={() => {
                                editUsePhase(item)
                              }}
                            >
                              <Text>
                                {lookupUseTypeDescription(item.use_type)}
                              </Text>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div
                              className="cursor-pointer"
                              onClick={() => {
                                editUsePhase(item)
                              }}
                            >
                              <Text>
                                {item.quantity}{" "}
                                {lookupUseTypeUnits(item.use_type)}
                              </Text>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div
                              className="cursor-pointer"
                              onClick={() => {
                                editUsePhase(item)
                              }}
                            >
                              <Text>
                                {formatNumber(
                                  (item.quantity ?? 0) *
                                    (serviceLife?.[0]?.quantity ?? 0)
                                )}{" "}
                                {lookupUseTypeUnits(item.use_type)}
                              </Text>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div
                              className="cursor-pointer"
                              onClick={() => {
                                editUsePhase(item)
                              }}
                            >
                              <Text>{item.location}</Text>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div
                              className="cursor-pointer"
                              onClick={() => {
                                editUsePhase(item)
                              }}
                            >
                              <Text>{item.percent_at_location} %</Text>
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
                <div className="text-center py-12 flex flex-col justify-center">
                  <div className="mx-auto max-w-sm">
                    <Text textAlignment="text-center">
                      Specify what resources (e.g. electricity, water) this
                      product consumes throughout its service life
                    </Text>
                  </div>
                  <div className="mx-auto">
                    <Button
                      marginTop="mt-4"
                      icon={PlusCircleIcon}
                      text="Add Use Phase"
                      color="indigo"
                      onClick={() => {
                        setDraftUsePhaseData({})
                        setUsePhaseDrawerOpen(true)
                      }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </Card>
  )
}
