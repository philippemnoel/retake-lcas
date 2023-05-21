import { NextApiRequest, NextApiResponse } from "next"
import { supabase } from "lib/api/supabase"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { skipEmail, ...body } = req.body

  if (req.method === "POST") {
    const { error } = await supabase
      .from("organizations")
      .upsert([body], { onConflict: "id", ignoreDuplicates: true })

    if (error !== null) {
      console.error(error)
      res.status(500).end()
    }

    if (!skipEmail) {
      const serversResponse = await supabase.functions.invoke(
        `email/servers/${body.id}`
      )
      if (serversResponse.error !== null) {
        console.error(serversResponse.error)
        res.status(500).end()
      }
    }

    res.status(200).end()
  } else {
    res.status(404).end()
  }
}
