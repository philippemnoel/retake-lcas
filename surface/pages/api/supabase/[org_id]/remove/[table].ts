import { NextApiRequest, NextApiResponse } from "next"
import { supabase } from "lib/api/supabase"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "DELETE") {
    const { table } = req.query
    let query = supabase.from(table as string).delete()

    for (const param of Object.entries(req.body)) {
      const [column, value] = param
      query = query.eq(column, value)
    }

    const { error } = await query

    if (error !== null) {
      console.error(error)
      res.status(500).end()
    }

    res.status(200).end()
  } else {
    res.status(404).end()
  }
}
