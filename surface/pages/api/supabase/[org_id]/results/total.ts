// write a template nextjs endpoint
// that will upsert a row in the lca table

import { NextApiRequest, NextApiResponse } from "next"
import { asyncUpdateLCAResults } from "./utils"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { lca_id: lcaId } = req.body

  asyncUpdateLCAResults(lcaId)
  res.status(202).end()
}
