import { NextApiRequest, NextApiResponse } from "next"

import { getLCAStageWithImpacts } from "./utils"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { lca_id: lcaId, methodology } = req.body
    const results = await getLCAStageWithImpacts(
      methodology,
      "end_of_life",
      lcaId
    )

    if (results === undefined)
      res.status(404).json({ message: "End of life data not found" })

    res.status(200).send(results)
  } else {
    res.status(405).json({ message: "Method not allowed" })
  }
}
