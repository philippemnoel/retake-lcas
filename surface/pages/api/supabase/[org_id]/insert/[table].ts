import { NextApiRequest, NextApiResponse } from "next"
import { supabase } from "lib/api/supabase"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { table } = req.query as { table: string }
    const { error } = await supabase.from(table).insert(req.body)

    if (error !== null) {
      console.error(error)
      res.status(500).end()
    }

    res.status(200).end()
  } else {
    res.status(404).end()
  }
}
