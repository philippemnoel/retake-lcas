import { NextApiRequest, NextApiResponse } from "next"
import { supabase } from "lib/api/supabase"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { table, ...params } = req.query as {
      table: string
    }
    const body = req.body

    let query = supabase.from(table).update(body)

    for (const param of Object.entries(params)) {
      const [column, value] = param
      query = query.eq(column, value)
    }

    const { error } = await query

    if (error !== null) {
      console.error(table, error)
      res.status(500).end()
    }

    res.status(200).end()
  } else {
    res.status(404).end()
  }
}
