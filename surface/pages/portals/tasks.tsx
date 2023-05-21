import { useRouter } from "next/router"
import {
  Button,
  Title,
  Text,
  Badge,
  List,
  ListItem,
  Bold,
  ColGrid,
  Col,
  Card,
} from "@tremor/react"
import Link from "next/link"

import { useQuery } from "@/components/hooks"
import { Database } from "lib/types/database.types"
import { ChevronRightIcon } from "@heroicons/react/20/solid"
import { LinkError } from "@/components/layouts/error"
import Loading from "@/components/layouts/loading"
import Logo from "@/components/brand/logo"

export default () => {
  const router = useRouter()
  const { supplierId, recipientEmail } = router.query

  const { data, error } = useQuery<
    Database["public"]["Tables"]["supplier_product_engagement"]["Row"]
  >("supplier_product_engagement", {
    supplier_id: supplierId,
  })

  const completed = data?.filter((item) => item.fully_completed)
  const pending = data?.filter((item) => !item.fully_completed)

  if (error) return <LinkError />
  if (data === undefined || pending === undefined || completed === undefined)
    return <Loading />

  return (
    <div className="bg-stone-50 h-screen relative">
      <div className="absolute bottom-4 left-4">
        <Badge text="Powered by Retake" color="indigo" size="sm" />
      </div>
      <div className="border-b border-gray-200 px-6 py-4 bg-white fixed w-full">
        <Logo width={30} height={30} />
      </div>
      <div className="p-6 pt-20 mx-auto max-w-6xl">
        <ColGrid numCols={10} gapX="gap-x-4">
          <Col numColSpan={4}>
            {pending.length === 0 ? (
              <Card shadow={false}>
                <Title>You&apos;re all set!</Title>
                <Text marginTop="mt-4">
                  Thank you for providing this information. In a few days, you
                  will receive an email from Retake containing carbon footprint
                  calculations for your products based on the information you
                  provided. You may safely close this window.
                </Text>
              </Card>
            ) : (
              <Card shadow={false}>
                <Title>Instructions</Title>
                <Text marginTop="mt-4">
                  {data?.[0]?.organization_name} is engaged in an effort to
                  measure its carbon footprint. Since you are one of our
                  suppliers, {data?.[0]?.organization_name} is asking you to
                  complete the task(s) to the right.
                </Text>
                <Text marginTop="mt-4">
                  Please complete these surveys within one week of the request
                  date. If you have any questions, you may use our live chat
                  support by clicking the purple chat button in the bottom right
                  corner of the screen.
                </Text>
              </Card>
            )}
          </Col>
          <Col numColSpan={6}>
            {pending.length > 0 && (
              <Card shadow={false}>
                <div className="h-[calc(50vh-8rem)] overflow-y-scroll">
                  <Title>Pending Tasks</Title>
                  <List>
                    {pending.map((item, index) => {
                      const progress = [
                        item.materials_completed,
                        item.manufacturing_completed,
                      ].reduce((count, bool) => {
                        if (bool) return count + 1
                        return count
                      }, 0)

                      return (
                        <ListItem key={index}>
                          <div className="py-2">
                            <div className="flex items-start gap-x-3">
                              <Text>
                                <Bold>
                                  Provide Data for{" "}
                                  {item.part_description ?? "Unnamed Part"}
                                </Bold>
                              </Text>
                              <Badge
                                text={`${progress} / 2 Complete`}
                                size="xs"
                                color={progress === 0 ? "rose" : "amber"}
                              />
                            </div>
                            <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
                              <p className="truncate">
                                Requested on{" "}
                                {item.created_at &&
                                  new Date(item.created_at).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    }
                                  )}
                              </p>
                            </div>
                          </div>
                          <Link
                            href={`/portals/calculator?engagementId=${item.id}&recipientEmail=${recipientEmail}&retakePartId=${item.retake_part_id}&supplierId=${supplierId}`}
                          >
                            <Button
                              text={progress === 0 ? "Start" : "Continue"}
                              color="indigo"
                              icon={ChevronRightIcon}
                              iconPosition="right"
                              variant="light"
                            />
                          </Link>
                        </ListItem>
                      )
                    })}
                  </List>
                </div>
              </Card>
            )}
            {completed.length > 0 && (
              <Card
                shadow={false}
                marginTop={pending.length > 0 ? "mt-4" : "mt-0"}
              >
                <div className="h-[calc(50vh-8rem)] overflow-y-scroll">
                  <Title marginTop="mt-4">Completed Tasks</Title>
                  <List>
                    {completed.map((item, index) => {
                      return (
                        <ListItem key={index}>
                          <div className="py-2">
                            <div className="flex items-start gap-x-3">
                              <Text>
                                <Bold>
                                  Provided Data for{" "}
                                  {item.part_description ?? "Unnamed Part"}
                                </Bold>
                              </Text>
                            </div>
                            <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
                              <p className="truncate">
                                Requested on{" "}
                                {item.created_at &&
                                  new Date(item.created_at).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    }
                                  )}
                              </p>
                            </div>
                          </div>
                          <Badge text={`Complete`} size="xs" color="emerald" />
                        </ListItem>
                      )
                    })}
                  </List>
                </div>
              </Card>
            )}
          </Col>
        </ColGrid>
      </div>
    </div>
  )
}
