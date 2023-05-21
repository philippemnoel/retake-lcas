import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { Title, Badge, Flex, Button } from "@tremor/react"
import { PencilSquareIcon } from "@heroicons/react/24/outline"
import { useUser } from "@auth0/nextjs-auth0"
import { v4 as uuidv4 } from "uuid"

import Layout from "@/components/layouts/sidebar"
import MaterialsTable from "@/components/tables/materials"
import Breadcrumbs from "@/components/breadcrumbs/panels"
import ComponentDrawer from "@/components/drawers/component"
import SupplierDrawer from "@/components/drawers/supplier"
import Header from "@/components/headers/product"
import { usePart, useQuery } from "@/components/hooks"
import { useNotification } from "@/components/hooks"
import withAuth from "@/components/auth/withAuth"

import { main, product } from "lib/constants/routes"
import {
  PartsData,
  SupplierData,
  MaterialCompositionData,
} from "lib/types/supabase-row.types"
import {
  upsertPart,
  upsertMaterialComposition,
  upsertSupplier,
} from "lib/api/upsert"
import { formatNumber } from "lib/utils"
import { MaterialCompositionDataSchema, PartsDataSchema } from "lib/api/schemas"

type ComponentDrawerDraft =
  | {
      part?: Partial<PartsData>
      materialComposition?: Partial<MaterialCompositionData>
    }
  | undefined

type SuppliersDraft = Partial<SupplierData> | undefined

export default withAuth(() => {
  const router = useRouter()
  const { lca_id: lcaID } = router.query as { lca_id: string }
  const { part: lcaPart, refresh } = usePart(lcaID)
  const { data: lcaMaterialComposition } = useQuery<MaterialCompositionData>(
    "material_composition",
    {
      lca_id: lcaID,
      level: 1,
    }
  )

  const { user } = useUser()
  const { withNotification } = useNotification()

  const [componentDrawerOpen, setComponentDrawerOpen] = useState(false)
  const [supplierDrawerOpen, setSupplierDrawerOpen] = useState(false)

  const [componentDrawerDraft, setComponentDrawerDraft] =
    useState<ComponentDrawerDraft>(undefined)
  const [suppliersDraft, setSuppliersDraft] =
    useState<SuppliersDraft>(undefined)

  useEffect(() => {
    if (lcaPart) {
      setComponentDrawerDraft({
        part: PartsDataSchema.optional().parse(lcaPart),
        materialComposition: MaterialCompositionDataSchema.optional().parse(
          lcaMaterialComposition?.[0]
        ),
      })
    }
  }, [lcaPart?.retake_part_id])

  const onSaveMaterialComposition = (
    values: Partial<MaterialCompositionData>
  ) => upsertMaterialComposition([values], user?.org_id)

  const onSaveParts = (values: Partial<PartsData>) =>
    upsertPart([values], user?.org_id)

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

  const withRetakePartId = <
    T extends Record<string, any> & { retake_part_id?: string | null }
  >(
    values?: T
  ): T => ({
    ...(values as T),
    retake_part_id:
      values?.retake_part_id ??
      `${values?.customer_part_id ?? uuidv4()}-${user?.org_id}`,
  })

  if (lcaPart === undefined)
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Button loading={true} color="indigo" size="xl" variant="light" />
      </div>
    )

  return (
    <>
      <Layout
        mainNavigation={main}
        pageNavigation={undefined}
        name="Materials"
        header={<Header />}
      >
        <SupplierDrawer
          data={suppliersDraft}
          open={supplierDrawerOpen}
          onChange={(data) => {
            setSuppliersDraft({ ...suppliersDraft, ...data })
          }}
          onSave={() => {
            onSaveSupplier(suppliersDraft)
            setSupplierDrawerOpen(false)
            setSuppliersDraft(undefined)
          }}
          onDismiss={() => {
            setSupplierDrawerOpen(false)
            setSuppliersDraft(undefined)
          }}
        />
        <ComponentDrawer
          open={componentDrawerOpen}
          isNewComponent={false}
          partsData={componentDrawerDraft?.part}
          materialCompositionData={componentDrawerDraft?.materialComposition}
          onDismiss={() => {
            setComponentDrawerDraft(undefined)
            setComponentDrawerOpen(false)
          }}
          onSave={() => {
            const partsData = withRetakePartId(componentDrawerDraft?.part)
            withNotification([
              onSaveParts(partsData),
              onSaveMaterialComposition({
                ...componentDrawerDraft?.materialComposition,
                retake_part_id: partsData.retake_part_id,
                org_id: user?.org_id,
                lca_id: lcaID,
              }),
            ]).then(refresh)
            setComponentDrawerDraft(undefined)
            setComponentDrawerOpen(false)
          }}
          onChangeMaterialComposition={(data) => {
            const materialComposition = {
              ...componentDrawerDraft?.materialComposition,
              ...data,
            }
            setComponentDrawerDraft({
              ...componentDrawerDraft,
              materialComposition,
            })
          }}
          onChangeParts={(data) => {
            const parts = { ...componentDrawerDraft?.part, ...data }
            setComponentDrawerDraft({ ...componentDrawerDraft, part: parts })
          }}
          onClickCreateSupplier={() => {
            setComponentDrawerDraft(undefined)
            setComponentDrawerOpen(false)
            setSupplierDrawerOpen(true)
          }}
        />
        <div className="p-6">
          <Flex>
            <Flex justifyContent="justify-start" spaceX="space-x-4">
              <Title>{lcaPart?.part_description ?? "Unnamed Product"}</Title>
              <Badge
                text={lcaPart?.customer_part_id ?? ""}
                color="indigo"
                size="sm"
              />
              <Badge
                text={`${formatNumber(lcaPart?.weight_grams ?? 0)} g`}
                color="stone"
                size="sm"
              />
            </Flex>
            <Button
              text="Edit"
              color="indigo"
              variant="light"
              icon={PencilSquareIcon}
              onClick={() => {
                setComponentDrawerOpen(true)
                setComponentDrawerDraft({
                  part: PartsDataSchema.optional().parse(lcaPart),
                  materialComposition:
                    MaterialCompositionDataSchema.optional().parse(
                      lcaMaterialComposition?.[0]
                    ),
                })
              }}
            />
          </Flex>
          <div className="mt-4"></div>
          <Breadcrumbs
            current={0}
            steps={product(lcaPart).map((item) => ({
              ...item,
            }))}
          />
          <div className="mt-6"></div>
          <MaterialsTable
            lcaID={lcaID}
            complete={lcaPart.materials_completed ?? false}
            refresh={refresh}
          />
        </div>
      </Layout>
    </>
  )
})
