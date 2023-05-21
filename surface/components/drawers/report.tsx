import {
  Button,
  Title,
  Text,
  Flex,
  Bold,
  Divider,
  Icon,
  ColGrid,
  Col,
  Dropdown,
  DropdownItem,
  List,
  ListItem,
  Card,
  Badge,
} from "@tremor/react"
import {
  DocumentChartBarIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline"
import { ChevronRightIcon } from "@heroicons/react/20/solid"
import classNames from "classnames"
import Link from "next/link"

import TextAreaInput from "@/components/inputs/textarea"
import Upload from "@/components/upload"
import Empty from "@/components/empty"

import { Methodology } from "lib/calculator/methodologies"
import { CMLTotalResultsData } from "lib/types/supabase-row.types"
import { formatTimestamp } from "lib/utils"

const epdLockFile = "epd-requested.txt"
const placeholderFiles = [epdLockFile, ".emptyFolderPlaceholder"]

export default ({
  open,
  data,
  canGenerateReport,
  reports,
  evidence,
  onGenerateReport,
  onDismiss,
  onChange,
  methodology,
  setMethodology,
  methodologies,
  onOpenReport,
  onUploadEvidence,
  onOpenEPDModal,
  reportGenerating,
}: {
  open: boolean
  data: Partial<CMLTotalResultsData> | undefined
  canGenerateReport: boolean
  methodology: Methodology
  setMethodology: (value: Methodology) => void
  methodologies: Array<Methodology>
  reports: Array<{ name: string; updated_at: string }> | undefined
  evidence: Array<{ name: string; updated_at: string }> | undefined
  onChange: <K extends keyof Partial<CMLTotalResultsData>>(
    key: K,
    value?: CMLTotalResultsData[K]
  ) => void
  onGenerateReport: (value: Partial<CMLTotalResultsData> | undefined) => void
  onOpenReport: (bucket: string, name: string) => void
  onDismiss: () => void
  onUploadEvidence: (data: FormData) => void
  onOpenEPDModal: () => void
  reportGenerating: boolean
}) => {
  const filteredReports = reports?.filter(
    (report) => !placeholderFiles.includes(report.name)
  )

  const completed =
    [
      data?.materials_completed ?? false,
      data?.transportation_completed ?? false,
      data?.manufacturing_completed ?? false,
      data?.use_phase_completed ?? false,
      data?.end_of_life_completed ?? false,
    ].filter(Boolean).length === 5

  return (
    <>
      <div className="absolute top-0 right-0">
        <div
          id="drawer-facilities"
          className={classNames(
            "fixed top-0 left-0 z-10 h-screen py-4 px-6 overflow-y-auto transition-transform w-[70rem] bg-neutral-50 bg-opacity-70 backdrop-blur",
            open ? "translate-x-0" : "-translate-x-full"
          )}
          tabIndex={-1}
          aria-labelledby="drawer-facilities-label"
        >
          <div className="text-left py-2 relative h-full">
            <Flex justifyContent="justify-start" spaceX="space-x-3">
              <Icon
                icon={DocumentChartBarIcon}
                color="indigo"
                variant="light"
              />
              <Title>{data?.part_description}</Title>
            </Flex>
            <Divider />
            <ColGrid numCols={4} gapX="gap-x-6">
              <Col numColSpan={1}>
                {completed && (
                  <>
                    <Text>
                      <Bold>Methodology *</Bold>
                    </Text>
                    <Dropdown
                      marginTop="mt-1"
                      value={methodology}
                      onValueChange={(value) => setMethodology(value)}
                    >
                      {methodologies.map((methodology, index) => (
                        <DropdownItem
                          text={methodology}
                          value={methodology}
                          key={index}
                        ></DropdownItem>
                      ))}
                    </Dropdown>
                    <Text marginTop="mt-4">
                      <Bold>Part Description *</Bold>
                    </Text>
                    <TextAreaInput
                      marginTop="mt-1"
                      value={data?.long_description ?? ""}
                      onValueChange={(value) =>
                        onChange("long_description", value)
                      }
                      placeholder={`Example: ${data?.part_description} is a silicon mat designed for countertop heat resistance, incorporating interwoven fiberglass for reinforcement and is available in four thicknesses: 1.8 mm, 2.0 mm, 1.8 mm, and 2.5 mm.`}
                    />
                  </>
                )}
                {!completed && (
                  <Card shadow={false}>
                    <Empty
                      title="LCA Incomplete"
                      description="In order to generate a new report, all sections of the LCA must be completed"
                      buttons={[
                        <Link
                          href={`/data/products/${data?.lca_id}/materials`}
                          key={0}
                        >
                          <Button
                            text="Complete LCA"
                            color="indigo"
                            icon={ChevronRightIcon}
                            iconPosition="right"
                          />
                        </Link>,
                      ]}
                    />
                    <div className="mt-16"></div>
                  </Card>
                )}
              </Col>
              <Col numColSpan={3}>
                <ColGrid numCols={5} gapX="gap-x-6">
                  <Col numColSpan={2}>
                    <Card shadow={false}>
                      <div className="max-h-[calc(100vh-14rem)] overflow-y-scroll">
                        <Title>Reports ({filteredReports?.length ?? 0})</Title>
                        {filteredReports ? (
                          <List marginTop="mt-1">
                            {filteredReports.map((report, index) => (
                              <ListItem key={index}>
                                <div
                                  className="cursor-pointer"
                                  onClick={() =>
                                    onOpenReport("internal-lcas", report.name)
                                  }
                                >
                                  <Text color="indigo" marginTop="mt-1">
                                    <Bold>{report.name}</Bold>
                                  </Text>
                                  <Text marginTop="mt-1">
                                    Last Updated{" "}
                                    {formatTimestamp(report.updated_at)}
                                  </Text>
                                </div>
                              </ListItem>
                            ))}
                          </List>
                        ) : (
                          <Text>No reports created</Text>
                        )}
                      </div>
                    </Card>
                  </Col>
                  <Col numColSpan={3}>
                    <Card shadow={false}>
                      <div className="max-h-[calc(100vh-14rem)] overflow-y-scroll">
                        <Flex>
                          <Title>Evidence ({evidence?.length ?? 0})</Title>
                          <Flex justifyContent="justify-end" spaceX="space-x-4">
                            <Upload
                              disabled={false}
                              onUpload={(data: FormData) => {
                                onUploadEvidence(data)
                              }}
                            >
                              <Button
                                text="Upload"
                                color="indigo"
                                variant="light"
                              />
                            </Upload>
                            {reports?.find(
                              (file) => file.name === epdLockFile
                            ) ? (
                              <Badge
                                color="amber"
                                text="EPD Requested"
                                tooltip="An EPD has been requested for this product. An EPD reviewer will be in touch within 24 hours via email."
                              />
                            ) : (
                              <Button
                                text="Request EPD"
                                color="indigo"
                                variant="light"
                                onClick={onOpenEPDModal}
                                disabled={!completed || !canGenerateReport}
                              />
                            )}
                          </Flex>
                        </Flex>
                        {evidence ? (
                          <List marginTop="mt-1">
                            {evidence?.map((report, index) => (
                              <ListItem key={index}>
                                <div
                                  className="cursor-pointer"
                                  onClick={() =>
                                    onOpenReport("evidence", report.name)
                                  }
                                >
                                  <Text color="indigo" marginTop="mt-1">
                                    <Bold>{report.name}</Bold>
                                  </Text>
                                  <Text marginTop="mt-1">
                                    Last Updated{" "}
                                    {formatTimestamp(report.updated_at)}
                                  </Text>
                                </div>
                              </ListItem>
                            ))}
                          </List>
                        ) : (
                          <Text>No evidence uploaded</Text>
                        )}
                      </div>
                    </Card>
                  </Col>
                </ColGrid>
              </Col>
            </ColGrid>
            <div className="absolute bottom-0">
              <Flex spaceX="space-x-6">
                {completed && (
                  <Button
                    text="Create New Report"
                    color="indigo"
                    disabled={!canGenerateReport}
                    loading={reportGenerating}
                    icon={DocumentDuplicateIcon}
                    onClick={() => onGenerateReport(data)}
                  />
                )}
                <Button
                  text="Cancel"
                  color="indigo"
                  variant="light"
                  onClick={() => onDismiss()}
                />
              </Flex>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
