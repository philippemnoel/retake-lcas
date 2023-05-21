import type { NextApiRequest, NextApiResponse } from "next"
import { supabase } from "lib/api/supabase"

// Returns a list of files in a supabase storage bucket
export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    const { org_id: orgId, bucket, folder } = req.query

    if (!bucket)
      return res.status(400).json({ message: "Missing required body param" })

    const path =
      folder !== undefined && folder !== "undefined"
        ? `${orgId}/${folder}`
        : (orgId as string)

    const { data, error } = await supabase.storage
      .from(bucket as string)
      .list(path, { limit: 1000 })

    if (error) {
      console.error(error)
      return res.status(500).json({ message: "Failed to list files" })
    }

    return res.status(200).json({ data })
  }
}
