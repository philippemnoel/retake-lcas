import { NextApiRequest, NextApiResponse } from "next"
import { supabase } from "lib/api/supabase"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { uid } = req.query

  if (req.method === "GET") {
    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", uid)

    if (error !== null) {
      console.error(error)
      res.status(500).end()
    }

    res.status(200).send(users !== null ? users[0] : undefined)
  } else {
    res.status(404).end()
  }
}
