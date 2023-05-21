import pg from "pg"
import format from "pg-format"
import { NextApiRequest, NextApiResponse } from "next"
import { to as copyTo } from "pg-copy-streams"

const getPool = () => {
  return new pg.Pool({
    user: "postgres",
    database: "postgres",
    host: process.env.POSTGRES_HOST,
    password: process.env.POSTGRES_PASSWORD,
    port: 5432,
  })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.status(404).end()
    return
  }

  const { org_id, fields } = req.query

  if (!org_id || !fields) {
    res.status(400).end()
    return
  }

  try {
    const pool = getPool()
    const client = await pool.connect()

    const sanitizedFields = Array.isArray(fields) ? fields.join(", ") : fields
    const sqlTemplate = `COPY (SELECT %s FROM suppliers where org_id = %L) TO STDOUT WITH (FORMAT csv, HEADER)`

    // The 'format' function from pg-format escapes the variables before placing into the SQL
    // string to protect from injection attacks.
    const sql = format(sqlTemplate, sanitizedFields, org_id)
    const copyToStream = client.query(copyTo(sql))

    res.setHeader("Content-Type", "text/plain")
    copyToStream.pipe(res) // Pipe the copyToStream to the HTTP response

    copyToStream.on("end", async () => {
      client.release()
      await pool.end()
    })

    copyToStream.on("error", async (err: any) => {
      console.error("Error:", err)
      res.statusCode = 500
      res.end("An error occurred while streaming the data.")
      client.release()
      await pool.end()
    })
  } catch (err) {
    console.error("Error:", err)
    res.statusCode = 500
    res.end("An error occurred while setting up the stream.")
  }
}
