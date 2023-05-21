import useSWR from "swr"
import { useState } from "react"
import { useUser } from "@auth0/nextjs-auth0"
import { CheckCircleIcon, PlusIcon } from "@heroicons/react/24/outline"
import {
  Title,
  Subtitle,
  Button,
  TextInput,
  Flex,
  Text,
  Bold,
  List,
  ListItem,
} from "@tremor/react"
import Image from "next/image"

import Layout from "@/components/layouts/sidebar"
import Ephemeral from "@/components/notifications/ephemeral"

import { main } from "lib/constants/routes"
import { post } from "lib/api"
import { Database } from "lib/types/database.types"
import withAuth from "@/components/auth/withAuth"

type Member = Database["public"]["Tables"]["users"]["Row"]

// Temporary: We hide retake.earth emails from the list of team members
// so we can access the dashboard without being listed as a team member.
const cloakAdmin = (userEmail: string, member: Partial<Member>) => {
  if (userEmail.match(/retake\.earth$/)) return true

  return !member.email?.match(/retake\.earth$/)
}

export default withAuth(() => {
  const { user } = useUser()

  const members = useSWR<any[]>(
    `/api/organizations/members`,
    async (input: RequestInfo, init?: RequestInit) => {
      const res = await fetch(input, init)
      return res.json()
    }
  )
  const [email, setEmail] = useState<string>("")
  const [inviting, setInviting] = useState(false)
  const [showInviteSuccess, setShowInviteSuccess] = useState(false)

  const invite = async () => {
    setInviting(true)
    await post(`/api/organizations/members`, {
      org_id: user?.org_id,
      name: user?.name,
      email: email,
    })
    setInviting(false)
    setShowInviteSuccess(true)
    setEmail("")
  }

  return (
    <>
      <Layout mainNavigation={main} pageNavigation={undefined} name="Settings">
        <div className="p-6 max-w-3xl mx-auto">
          <div>
            <Title>Settings</Title>
            <Subtitle>
              Update organizational information and invite team members here.
            </Subtitle>
            <Ephemeral
              show={showInviteSuccess}
              setShow={setShowInviteSuccess}
              title="User Invited"
              description={`When ${email} accepts your invitation, they will be able to access the Retake dashboard.`}
              icon={CheckCircleIcon}
              color="text-green-500"
            />
            <Flex marginTop="mt-6">
              <Text>
                <Bold>Your Name</Bold>
              </Text>
              <Text>{user?.name}</Text>
            </Flex>
            <Flex marginTop="mt-6">
              <Text>
                <Bold>Your Email</Bold>
              </Text>
              <Text>{user?.email}</Text>
            </Flex>
            <Flex marginTop="mt-6">
              <Text>
                <Bold>Organization Name</Bold>
              </Text>
              <Text>{user?.organization_name as string}</Text>
            </Flex>
            <Text marginTop="mt-6">
              <Bold>Add Team Members</Bold>
            </Text>
            <Flex
              justifyContent="justify-start"
              spaceX="space-x-2"
              marginTop="mt-1"
            >
              <TextInput
                placeholder="Email Address"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
              <Button
                text="Invite"
                icon={PlusIcon}
                onClick={invite}
                disabled={!(email.includes("@") && email.includes("."))}
                loading={inviting}
                color="indigo"
              />
            </Flex>
          </div>

          <List marginTop="mt-6">
            {members.data != undefined &&
              members.data
                .filter((member) => cloakAdmin(user?.email ?? "", member))
                .map((member) => (
                  <ListItem key={member.email}>
                    <Flex justifyContent="justify-start" spaceX="space-x-4">
                      <Image
                        className="h-10 w-10 rounded-full"
                        src={member.picture}
                        width={50}
                        height={50}
                        alt=""
                      />
                      <div>
                        <Text>
                          <Bold>{member.name}</Bold>
                        </Text>
                        <Text>{member.email}</Text>
                      </div>
                    </Flex>
                  </ListItem>
                ))}
          </List>
        </div>
      </Layout>
    </>
  )
})
