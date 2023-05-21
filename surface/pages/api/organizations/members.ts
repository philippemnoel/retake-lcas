import { NextApiRequest, NextApiResponse } from "next"
import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0"
import { supabase } from "lib/api/supabase"
import { ManagementClient } from "auth0"

async function createMember(name: string, email: string, orgId: string) {
  const auth0BaseUrl = process.env.AUTH0_ISSUER_BASE_URL ?? ""
  const auth0Url = process.env.AUTH0_MACHINE_DOMAIN ?? ""
  const clientId = process.env.AUTH0_API_CLIENT_ID ?? ""
  const clientSecret = process.env.AUTH0_API_CLIENT_SECRET ?? ""
  const portalId = process.env.AUTH0_CLIENT_ID ?? ""

  try {
    const auth0 = new ManagementClient({
      domain: auth0Url,
      clientId: clientId,
      clientSecret: clientSecret,
      audience: `${auth0BaseUrl}/api/v2/`,
    })

    const response = await auth0.organizations.createInvitation(
      { id: orgId },
      {
        client_id: portalId,
        inviter: {
          name: name,
        },
        invitee: {
          email: email,
        },
      }
    )

    return response
  } catch (error) {
    console.error(error)
    return null
  }
}

export default withApiAuthRequired(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = getSession(req, res)
  const orgId = session?.user.org_id

  if (req.method === "POST") {
    const body = req.body

    const invitedResponse = await createMember(
      body.name,
      body.email,
      body.org_id
    )

    if (invitedResponse === null) {
      res.status(500).end()
    }

    res.status(200).end()
  } else if (req.method === "GET") {
    const { data: users, error } = await supabase
      .from("users")
      .select("email,name,picture")
      .eq("org_id", orgId)

    if (error !== null) {
      console.error(error)
      res.status(500).end()
    }

    res.status(200).send(users)
  } else {
    res.status(404).end()
  }
})
