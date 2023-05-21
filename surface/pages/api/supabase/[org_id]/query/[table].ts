import { NextApiRequest, NextApiResponse } from "next"
import { supabase } from "lib/api/supabase"

import { defaultPageLimit } from "lib/api"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const {
      table,
      from,
      to,
      orderAsc,
      orderDesc,
      inFilters,
      ilikeFilters,
      ...params
    } = req.query

    const fromInt = from ? parseInt(from as string) : 0
    const toInt = to ? parseInt(to as string) : defaultPageLimit

    // TODO: Get only necessary rows, instead of the full table to improve performance
    let query = supabase
      .from(table as string)
      .select("*", { count: "exact", head: false })

    const inFilterColumns = (inFilters as string | undefined)?.split(",") ?? []
    const ilikeFilterColumns =
      (ilikeFilters as string | undefined)?.split(",") ?? []

    if (params !== undefined) {
      for (const param of Object.entries(params)) {
        const [column, value] = param
        if (value === "null") {
          query = query.is(column, null)
        } else if (inFilterColumns.includes(column)) {
          const decoded = decodeURIComponent(value as string)
          query = query.in(column, JSON.parse(decoded))
        } else if (ilikeFilterColumns.includes(column)) {
          query = query.ilike(column, `%${value}%`)
        } else {
          query = query.eq(column, value)
        }
      }
    }

    if (orderAsc !== undefined) {
      query = query.order(orderAsc as string, { ascending: true })
    }

    if (orderDesc !== undefined) {
      query = query.order(orderDesc as string, { ascending: false })
    }

    query = query.range(fromInt, toInt - 1)
    const { data, count, error } = await query

    if (error !== null) {
      console.error(table, error)
      res.status(500).end()
      return
    }

    res.status(200).send({ data, count: count })
  } else {
    res.status(404).end()
  }
}
