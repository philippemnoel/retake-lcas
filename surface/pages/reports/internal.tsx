import { useEffect, useState } from "react"
import { main, reports } from "lib/constants/routes"
import Layout from "@/components/layouts/sidebar"
import {
  Title,
  Subtitle,
  List,
  ListItem,
  Text,
  Bold,
  Badge,
  Button,
  TextInput,
  Flex,
} from "@tremor/react"
import Link from "next/link"
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import { ChevronRightIcon } from "@heroicons/react/20/solid"
import { useUser } from "@auth0/nextjs-auth0"
import axios from "axios"

import Skeleton from "@/components/skeletons/list"
import Pagination from "@/components/tables/pagination"
import ReportDrawer from "@/components/drawers/report"
import EPDModal from "@/components/modals/epd"
import { useQuery } from "@/components/hooks"
import { useStorage } from "@/components/hooks"
import { useNotification } from "@/components/hooks"

import { Methodology, methodologies } from "lib/calculator/methodologies"
import { post } from "lib/api"
import { CMLTotalResultsData } from "lib/types/supabase-row.types"
import {
  EPD_REQUEST_LOADING,
  EPD_REQUEST_SUCCESS,
  REPORT_LOADING,
  REPORT_SUCCESS,
} from "lib/constants/notifications"
import { upsertPart, upsertLCA } from "lib/api/upsert"
import { getPublicUrl } from "lib/api/query"
import { openUrlInNewTab } from "lib/utils"
import Empty from "@/components/empty"
import { sendEPDNotificationToSlack } from "lib/api/effects"

const completionBadge = (completed: boolean) => {
  if (completed) return <Badge text="Report Available" color="blue" size="xs" />
  return (
    <Badge
      text="LCA Incomplete"
      size="xs"
      color="stone"
      tooltip="In order for a report to be generated, all five steps (materials, transportation, manufacturing, use phase, and end of life) of the LCA must be completed."
    />
  )
}

export default () => {
  const {
    data,
    refresh: refreshPartsData,
    pagination,
    setPagination,
    searchQuery,
    setSearchQuery,
  } = useQuery<CMLTotalResultsData>(
    "cml_total_results",
    {
      orderAsc: "part_description",
    },
    "part_description"
  )

  const [methodology, setMethodology] = useState<Methodology>(Methodology.CML)
  const [reportGenerating, setReportGenerating] = useState(false)
  const [reportDrawerOpen, setReportDrawerOpen] = useState(false)
  const [epdModalOpen, setEPDModalOpen] = useState(false)
  const [reportData, setReportData] = useState<Partial<CMLTotalResultsData>>()

  const { withNotification } = useNotification()
  const { user } = useUser()
  const { data: internalLCAs, refresh: refreshInternalLCAs } = useStorage(
    "internal-lcas",
    reportData?.lca_id
  )
  const { data: evidence, refresh: refreshEvidence } = useStorage(
    "evidence",
    reportData?.lca_id
  )

  const canGenerateReport = (reportData?.long_description ?? "").length > 0

  const onUploadEvidence = async (data: FormData) => {
    await withNotification([
      axios.post(
        `/api/storage/${user?.org_id}/upload?bucket=evidence&orgId=${user?.org_id}&lcaId=${reportData?.lca_id}`,
        data
      ),
    ])
    refreshEvidence()
  }

  const createReport = async (
    value: Partial<CMLTotalResultsData> | undefined,
    methodology: Methodology,
    organizationName: string
  ) => {
    setReportGenerating(true)
    await withNotification(
      [
        upsertLCA({
          ...value,
          retake_part_id: value?.retake_part_id ?? undefined,
        }),
        upsertPart(
          [
            {
              ...value,
              retake_part_id: value?.retake_part_id ?? undefined,
            },
          ],
          user?.org_id,
          false
        )
          .then(() =>
            post(`/api/supabase/${user?.org_id}/results/report`, {
              lcaId: value?.lca_id,
              methodology,
              partDescription: value?.part_description,
              organizationName,
              longDescription:
                value?.long_description ??
                "No description provided by the manufacturer.",
            })
          )
          .then(async (response) => {
            const { url } = await response.json<{ url: string }>()
            openUrlInNewTab(url)
            return response
          }),
      ],
      REPORT_LOADING,
      REPORT_SUCCESS
    )
    setReportGenerating(false)
    refreshEvidence()
    refreshInternalLCAs()
    refreshPartsData()
  }

  const onRequestEPD = async (message: string) => {
    // Tech Debt: To avoid adding a new table, we store the fact that an EPD has been requested
    // by storing an empty file called epd-requested.txt in the evidence bucket
    const blob = new Blob([""], { type: "text/plain" })
    const formData = new FormData()
    formData.append("file", blob, "epd-requested.txt")

    await withNotification(
      [
        // We also notify our Slack channel so we can begin preparing the EPD
        sendEPDNotificationToSlack(
          user?.org_id,
          user?.sub,
          reportData?.lca_id,
          message
        ),
        axios.post(
          `/api/storage/${user?.org_id}/upload?bucket=internal-lcas&orgId=${user?.org_id}&lcaId=${reportData?.lca_id}`,
          formData
        ),
      ],
      EPD_REQUEST_LOADING,
      EPD_REQUEST_SUCCESS
    )
    setReportDrawerOpen(false)
    refreshInternalLCAs()
  }

  useEffect(() => {
    if (reportData?.lca_id) {
      refreshInternalLCAs()
      refreshEvidence()
    }
  }, [reportData?.lca_id])

  useEffect(() => {
    if (!reportDrawerOpen) setReportData(undefined)
  }, [reportDrawerOpen])

  return (
    <Layout mainNavigation={main} pageNavigation={reports} name="Reports">
      <ReportDrawer
        open={reportDrawerOpen}
        data={reportData}
        methodology={methodology}
        setMethodology={setMethodology}
        methodologies={methodologies}
        canGenerateReport={canGenerateReport}
        reports={reportData?.lca_id !== undefined ? internalLCAs : undefined}
        evidence={reportData?.lca_id !== undefined ? evidence : undefined}
        onChange={(key, value) => {
          setReportData({ ...reportData, [key]: value })
        }}
        onGenerateReport={(value) => {
          createReport(value, methodology, user?.organization_name as string)
        }}
        onOpenReport={async (bucket, name) => {
          const url = await getPublicUrl(
            bucket,
            `${reportData?.lca_id}/${name}`,
            user?.org_id
          )
          openUrlInNewTab(url)
        }}
        onDismiss={() => {
          setReportDrawerOpen(false)
        }}
        onOpenEPDModal={() => setEPDModalOpen(true)}
        onUploadEvidence={onUploadEvidence}
        reportGenerating={reportGenerating}
      />
      <EPDModal
        open={epdModalOpen}
        onDismiss={() => setEPDModalOpen(false)}
        onRequestEPD={onRequestEPD}
      />
      <div className="p-6">
        <Title>Life Cycle Assessment Reports</Title>
        <Subtitle>
          ISO-compliant life cycle assessment reports on products manufactured
          by your organization. Reports are only available for a product once
          all LCA data has been provided.
        </Subtitle>
        <Flex marginTop="mt-6">
          <TextInput
            placeholder="Search"
            maxWidth="max-w-sm"
            icon={MagnifyingGlassIcon}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Flex>
        {data && data.length > 0 && (
          <List marginTop="mt-4">
            {data.map((item, index) => {
              const completed =
                [
                  item.materials_completed ?? false,
                  item.transportation_completed ?? false,
                  item.manufacturing_completed ?? false,
                  item.use_phase_completed ?? false,
                  item.end_of_life_completed ?? false,
                ].filter(Boolean).length === 5
              return (
                <ListItem key={index}>
                  <div className="py-2">
                    <div className="flex items-start gap-x-3">
                      <Text>
                        <Bold>{item.part_description ?? "Unnamed Part"}</Bold>
                      </Text>
                      {completionBadge(completed)}
                    </div>
                    <Text marginTop="mt-1">{item.customer_part_id}</Text>
                  </div>
                  <Flex justifyContent="justify-end" spaceX="space-x-8">
                    <Button
                      text="View"
                      color="indigo"
                      variant="light"
                      icon={ChevronRightIcon}
                      iconPosition="right"
                      disabled={reportGenerating}
                      onClick={() => {
                        setReportData(item)
                        setReportDrawerOpen(!reportDrawerOpen)
                      }}
                    />
                  </Flex>
                </ListItem>
              )
            })}
          </List>
        )}
        {data && data.length === 0 && (
          <Empty
            title="No Life Cycle Assessments Found"
            description="When life cycle assessments are completed, their reports will be shown here."
            buttons={[
              <Link href="/data/products" key={0}>
                <Button
                  text="Create Life Cycle Asessment"
                  color="indigo"
                  key={0}
                />
              </Link>,
            ]}
          />
        )}
        {data === undefined && (
          <div className="mt-6">
            <Skeleton />
          </div>
        )}
        {pagination !== undefined && (
          <Pagination pagination={pagination} onPageChange={setPagination} />
        )}
      </div>
    </Layout>
  )
}
