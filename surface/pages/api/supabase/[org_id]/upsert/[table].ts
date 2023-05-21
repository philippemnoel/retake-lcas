import { NextApiRequest, NextApiResponse } from "next"
import { supabase } from "lib/api/supabase"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { table, onConflict, ignoreDuplicates } = req.query as {
      table: string
      onConflict: string
      ignoreDuplicates: string
    }
    const body = req.body

    const { error } = await supabase.from(table).upsert(body, {
      onConflict,
      ignoreDuplicates: ignoreDuplicates.toLowerCase() === "true",
    })

    // There was some other error
    if (error !== null) {
      console.error(`Error upserting table ${table}`, error, body)

      // There was a unique conflict
      if (error?.code === "23505") res.status(409).end()
      res.status(500).end()
      return
    }

    res.status(200).end()
  } else {
    res.status(404).end()
  }
}
