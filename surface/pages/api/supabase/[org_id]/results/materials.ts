import { NextApiRequest, NextApiResponse } from "next"
import { getMaterialCompositionWithImpacts } from "./utils"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { lca_id: lcaId, methodology } = req.body
    const results = await getMaterialCompositionWithImpacts(methodology, lcaId)

    if (results === undefined) {
      return res
        .status(404)
        .json({ message: "Material composition data found" })
    }

    res.status(200).send(results)
  } else {
    res.status(405).json({ message: "Method not allowed" })
  }
}
