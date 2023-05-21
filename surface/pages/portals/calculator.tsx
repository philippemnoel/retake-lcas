import { useState, useEffect } from "react"
import {
  Button,
  Title,
  Text,
  Card,
  ColGrid,
  Col,
  Flex,
  Icon,
  Metric,
  Badge,
} from "@tremor/react"
import { Widget } from "@typeform/embed-react"
import { useRouter } from "next/router"
import { useUser } from "@auth0/nextjs-auth0"

import { useQuery } from "@/components/hooks"
import { Database } from "lib/types/database.types"
import { get, post } from "lib/api"
import {
  Bars3BottomLeftIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline"
import { ArrowRightIcon, CheckCircleIcon } from "@heroicons/react/20/solid"
import Logo from "@/components/brand/logo"
import { LinkError } from "@/components/layouts/error"
import Loading from "@/components/layouts/loading"

const welcomeId = "i4sTtHO4"
const materialsId = "SvHlujcd"
const manufacturingId = "K2WSiLIm"

export default () => {
  const router = useRouter()
  const {
    recipientEmail,
    engagementId,
    retakePartId,
    supplierId,
    form_id: formId,
  } = router.query
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [showLCASurveys, setShowLCASurveys] = useState(false)

  const {
    data,
    error,
    refresh: refreshEngagement,
  } = useQuery<
    Database["public"]["Tables"]["supplier_product_engagement"]["Row"]
  >("supplier_product_engagement", {
    id: engagementId,
  })

  const engagement = data?.[0]

  const { data: parts, refresh: refreshParts } = useQuery<
    Database["public"]["Tables"]["parts"]["Row"]
  >("parts", {
    retake_part_id: retakePartId,
  })

  const part = parts?.[0]

  const surveys = [
    {
      isCompleted: engagement?.materials_completed ?? false,
      text: `You will be asked for the material composition or bill of
      materials for ${part?.part_description}.`,
      title: "Materials",
      id: materialsId,
      icon: Bars3BottomLeftIcon,
    },
    {
      isCompleted: engagement?.manufacturing_completed ?? false,
      text: `You will be asked for the energy consumption of plants or
      facilities that produce ${part?.part_description}.`,
      title: "Manufacturing",
      id: manufacturingId,
      icon: BuildingOffice2Icon,
    },
  ]

  useEffect(() => {
    if (engagement?.retake_part_id !== undefined) refreshParts()
  }, [engagement?.retake_part_id])

  useEffect(() => {
    if (engagement?.welcome_completed && !engagement?.fully_completed)
      setShowLCASurveys(true)
  }, [engagement])

  useEffect(() => {
    if (
      engagement?.materials_completed &&
      engagement.manufacturing_completed &&
      !engagement.fully_completed
    ) {
      post(
        `/api/supabase/${user?.org_id}/update/supplier_product_engagement?id=${engagementId}`,
        {
          fully_completed: true,
        }
      ).then(() => {
        refreshEngagement()
      })
    }
  }, [engagement])

  useEffect(() => {
    if (engagement?.fully_completed)
      router.push(
        `/portals/tasks?supplierId=${supplierId}&recipientEmail=${recipientEmail}`
      )
  }, [engagement?.fully_completed])

  if (data === undefined || parts === undefined || loading) return <Loading />

  if (
    data.length === 0 ||
    parts.length === 0 ||
    error ||
    (formId !== undefined &&
      ![welcomeId, materialsId, manufacturingId].includes(formId as string))
  )
    return <LinkError />

  if (
    !engagement?.retake_part_id ||
    !part?.part_description ||
    !engagement?.org_id ||
    !engagement?.organization_name
  )
    return <LinkError />

  if ([materialsId, manufacturingId].includes(formId as string)) {
    return (
      <Widget
        id={formId as string}
        className="w-screen h-[calc(100vh-5rem)]"
        hidden={{
          retake_part_id: engagement.retake_part_id,
          part_description: part.part_description,
          org_id: engagement.org_id,
          respondent_email: recipientEmail as string,
          organization_name: engagement.organization_name,
          year: (new Date().getFullYear() - 1).toString(),
        }}
        onSubmit={async () => {
          setLoading(true)
          // Tech debt: It takes a few seconds for the Typeform backend to update
          // Replace w/ more robust retry logic
          post(
            `/api/supabase/${user?.org_id}/update/supplier_product_engagement?id=${engagementId}`,
            {
              ...(formId === materialsId && { materials_completed: true }),
              ...(formId === manufacturingId && {
                manufacturing_completed: true,
              }),
            }
          ).then(() => {
            setLoading(false)
            refreshEngagement()
            router.push({
              pathname: router.pathname,
              query: { engagementId, recipientEmail, supplierId, retakePartId },
            })
          })
        }}
      />
    )
  }

  if (showLCASurveys) {
    return (
      <div className="bg-stone-50 h-screen relative">
        <div className="absolute bottom-4 left-4">
          <Badge text="Powered by Retake" color="indigo" size="sm" />
        </div>
        <div className="border-b border-gray-200 px-6 py-4 bg-white fixed w-full">
          <Logo width={30} height={30} />
        </div>
        <div className="p-6 pt-20 mx-auto max-w-6xl">
          <ColGrid numCols={6} gapY="gap-y-4" gapX="gap-x-4">
            <Col numColSpan={3}>
              <Card shadow={false}>
                <Metric>Carbon Footprint Calculator</Metric>
                <Text marginTop="mt-4">
                  Please complete these two short surveys. Once completed, we
                  will calculate a carbon footprint for {part?.part_description}{" "}
                  and share that footprint with {engagement.organization_name}.
                  If someone else at your company is better equipped to answer
                  these survey questions, you can share the URL of this page
                  with them.
                </Text>
              </Card>
            </Col>
            <Col numColSpan={3}>
              <Card shadow={false}>
                <div className="flex flex-col space-y-12">
                  {surveys.map((survey, index) => (
                    <div key={index}>
                      <div className="flex justify-between">
                        <Flex justifyContent="justify-start" spaceX="space-x-4">
                          {survey.isCompleted ? (
                            <Icon
                              icon={CheckCircleIcon}
                              variant="light"
                              color="emerald"
                            />
                          ) : (
                            <Icon
                              icon={survey.icon}
                              variant="light"
                              color="indigo"
                            />
                          )}
                          <Title>{survey.title}</Title>
                        </Flex>
                        {survey.isCompleted && (
                          <Badge text="Completed" color="emerald" />
                        )}
                      </div>
                      {!survey.isCompleted && (
                        <>
                          <Text marginTop="mt-4">{survey.text}</Text>
                          <Button
                            marginTop="mt-6"
                            color="indigo"
                            text="Begin Survey"
                            variant="light"
                            icon={ArrowRightIcon}
                            iconPosition="right"
                            onClick={() => {
                              router.push({
                                pathname: router.pathname,
                                query: {
                                  engagementId,
                                  recipientEmail,
                                  supplierId,
                                  retakePartId,
                                  form_id: survey.id,
                                },
                              })
                            }}
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
          </ColGrid>
        </div>
      </div>
    )
  }

  if (!engagement?.welcome_completed) {
    return (
      <Widget
        id={welcomeId}
        className="w-screen h-[calc(100vh-5rem)]"
        hidden={{
          retake_part_id: engagement.retake_part_id,
          part_description: part.part_description,
          org_id: engagement.org_id,
          respondent_email: recipientEmail as string,
          organization_name: engagement.organization_name,
        }}
        onSubmit={async ({ responseId }) => {
          setLoading(true)
          // Tech debt: It takes a few seconds for the Typeform backend to update
          // Replace w/ more robust retry logic
          setTimeout(() => {
            get(`/api/typeform/responses`, {
              formId: welcomeId,
              responseId,
            })
              .json()
              .then((response: any) => {
                const footprintProvided = response?.answers?.some(
                  (answer: any) =>
                    answer.field.id === "YIcytTh1d56J" ||
                    answer.field.id === "cujKffapC5Np"
                )
                post(
                  `/api/supabase/${user?.org_id}/update/supplier_product_engagement?id=${engagementId}`,
                  {
                    fully_completed: footprintProvided,
                    welcome_completed: true,
                  }
                ).then(() => {
                  refreshEngagement()
                  setLoading(false)
                })
              })
          }, 5000)
        }}
      />
    )
  }

  return <LinkError />
}
