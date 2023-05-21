import type { NextApiRequest, NextApiResponse } from "next"
import { supabase } from "lib/api/supabase"

// Returns a list of files in a supabase storage bucket
export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    const {
      bucket,
      path,
      org_id: orgId,
    } = req.query as { bucket: string; path: string; org_id: string }

    if (!bucket || !path)
      return res.status(400).json({ message: "Missing required body param" })

    const filePath = `${orgId}/${path}`
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)

    return res.status(200).json({ data })
  }
}
