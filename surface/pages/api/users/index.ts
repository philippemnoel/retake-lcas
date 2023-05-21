import { NextApiRequest, NextApiResponse } from "next"
import { supabase } from "lib/api/supabase"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { orgId } = req.query
  const body = req.body

  if (req.method === "GET") {
    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .eq("org_id", orgId)

    if (error !== null) {
      console.error(error)
      res.status(500).end()
    }

    res.status(200).send(users)
  } else if (req.method === "POST") {
    if (req.body.user == null) {
      res.status(400).end()
    }

    // Delete organization name to be consistent with the db
    delete body.user["organization_name"]
    const user = {
      ...body.user,
      id: body.user.sub,
    }

    const { data, error } = await supabase
      .from("users")
      .upsert([user], { onConflict: "id" })

    if (error !== null) {
      console.error(error)
      res.status(500).end()
    }

    res.status(200).send(data)
  } else {
    res.status(404).end()
  }
}
