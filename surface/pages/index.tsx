// index.ts

/**
 * The entry point for our application
 */
import { useUser, withPageAuthRequired } from "@auth0/nextjs-auth0"
import { Button } from "@tremor/react"
import { useRouter } from "next/router"

import { useEffect } from "react"
import { upsertOrganization, upsertUser } from "lib/api/upsert"

export default ({ authorized }: { authorized: boolean }) => {
  const { user } = useUser()
  const router = useRouter()

  // When the user is authorized, update them in the database
  useEffect(() => {
    if (authorized && user !== undefined) {
      if (user?.org_id && user?.sub) {
        upsertOrganization({
          id: user?.org_id,
          name: user?.organization_name as string,
        }).then(() => upsertUser(user))
      }
      router.push("/data/products")
    }
  }, [authorized, user])

  if (!authorized || (authorized && user === undefined))
    return (
      <div className="flex h-screen justify-center items-center">
        <Button loading={true} variant="light" size="xl"></Button>
      </div>
    )

  return <></>
}

export const getServerSideProps = withPageAuthRequired({
  getServerSideProps: async (): Promise<{
    props: {
      authorized: boolean
    }
  }> => {
    return {
      props: {
        authorized: true,
      },
    }
  },
})
