import type { NextApiRequest, NextApiResponse } from "next"
import { withApiAuthRequired } from "@auth0/nextjs-auth0"
import multer from "multer"
import { supabase } from "lib/api/supabase"
import { read, utils } from "xlsx"
import path from "path"

const XLS_TYPE = "application/vnd.ms-excel"
const XLSX_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

// Create a new Multer instance with the appropriate storage configuration
const upload = multer({ storage: multer.memoryStorage() })

export const config = {
  api: {
    bodyParser: false,
  },
}

export default withApiAuthRequired(
  async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === "POST") {
      try {
        await new Promise<void>((resolve, reject) => {
          upload.any()(req as any, res as any, (err: unknown) => {
            if (err) {
              reject(err)
            } else {
              resolve()
            }
          })
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const files = (req as any).files
        const { bucket, lcaId, org_id: orgId } = req.query

        if (!bucket || !lcaId)
          return res
            .status(400)
            .json({ message: "Missing required query params" })

        if (!files || files.length === 0) {
          return res.status(400).json({ message: "No files provided" })
        }

        const docs: { bucket: string; path: string; mimeType: string }[] = []
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fileUploadPromises = files.map(async (file: any) => {
          let contents, mimeType, fileName
          if (file.mimetype === XLSX_TYPE || file.mimetype === XLS_TYPE) {
            const workbook = read(file.buffer)

            let finalCsv = ""
            for (const sheetName of workbook.SheetNames) {
              finalCsv += utils.sheet_to_csv(workbook.Sheets[sheetName])
            }

            contents = finalCsv
            mimeType = "text/csv"
            fileName = path.parse(file.originalname).name + ".csv"
          } else {
            contents = file.buffer
            mimeType = file.mimetype
            fileName = file.originalname
          }

          const storagePath = `${orgId}/${lcaId}/${encodeURIComponent(
            fileName
          )}`
          const { error } = await supabase.storage
            .from(bucket as string)
            .upload(storagePath, contents, {
              contentType: mimeType,
              upsert: true,
            })

          if (error) throw error
          docs.push({
            bucket: bucket as string,
            path: storagePath,
            mimeType: mimeType,
          })
          return
        })

        await Promise.all(fileUploadPromises)
        return res.status(200).send(docs)
      } catch (err) {
        console.error(err)
        return res.status(500).json({ message: "Error uploading files" })
      }
    } else {
      res.status(405).json({ message: "Method not allowed" })
    }
  }
)
