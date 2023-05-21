import { useState, useEffect, useRef, Dispatch, SetStateAction } from "react"
import { useUser } from "@auth0/nextjs-auth0"
import omitBy from "lodash.omitby"
import debounce from "lodash.debounce"
import Fuse from "fuse.js"

import { defaultPageLimit } from "lib/api"
import { parseCsvStream } from "lib/utils"
import { get, post } from "lib/api"
import { Notification, useAppState } from "./state"
import {
  GENERIC_ERROR,
  GENERIC_LOADING,
  GENERIC_SUCCESS,
} from "lib/constants/notifications"
import { CMLTotalResultsData } from "lib/types/supabase-row.types"

type QueryRow<T> = {
  data: Array<T>
  count: number
}

export type Pagination = {
  rows: number
  from: number
  to: number
}

export type UseStreamParameters = Parameters<typeof useStream>

const useQuery = <T,>(
  endpoint: string,
  params?: Record<string, any>,
  searchColumn?: string
) => {
  const [pagination, setPagination] = useState<Pagination>({
    rows: 0,
    from: 0,
    to: defaultPageLimit,
  })
  const [searchQuery, setSearchQuery] = useState("")

  const [data, setData] = useState<Array<T> | undefined>(undefined)
  const [error, setError] = useState(false)
  const { user } = useUser()

  const coolOffMs = 250
  const refreshWithDebounce = debounce(() => {
    refresh()
  }, coolOffMs)

  const refresh = async () => {
    if (user?.org_id !== undefined) {
      setError(false)

      const result = await get(
        `/api/supabase/${user.org_id}/query/${endpoint}`,
        {
          ...omitBy(params, (value) => value === undefined),
          from: pagination.from,
          to: pagination.to,
          ...(searchQuery !== "" &&
            searchColumn !== undefined && {
              ilikeFilters: [searchColumn],
              [searchColumn]: searchQuery,
            }),
        }
      )

      if (result.status >= 400) {
        setError(true)
      } else {
        const json = await result.json<QueryRow<T>>()
        setData(json.data)
        setPagination({ ...pagination, rows: json?.count })
      }
    }
  }

  useEffect(() => {
    if (data === undefined) refresh()
  }, [user?.org_id, data])

  useEffect(() => {
    refresh()
  }, [pagination.from, pagination.to])

  useEffect(() => {
    refreshWithDebounce()

    return () => {
      refreshWithDebounce.cancel()
    }
  }, [searchQuery])

  return {
    data,
    error,
    refresh,
    pagination,
    setPagination,
    searchQuery,
    setSearchQuery,
  }
}

// Streams chunks of CSV data.
const useStream = <T extends Record<string, any>>(
  endpoint: string,
  params?: Record<string, any>,
  transforms?: { [K in keyof Partial<T>]: (value: string) => T[K] }
) => {
  const ref = useRef<T[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    rows: 0,
    from: 0,
    to: defaultPageLimit,
  })
  const [pageData, setPageData] = useState<T[]>([])
  const [error, setError] = useState<boolean>(false)
  const [loadingFirstPage, setLoadingFirstPage] = useState(false)
  const [loadingAll, setLoadingAll] = useState(false)
  const [loadedOnce, setLoadedOnce] = useState(false)
  const { user } = useUser()

  const canFillPage = () => ref.current.length > defaultPageLimit
  const fillPage = (pag: Pagination) => {
    const newPage = ref.current.slice(pagination.from, pagination.to)
    setPageData(newPage)
    setPagination({ ...pag, rows: newPage.length })
  }

  const refresh = async () => {
    if (user?.org_id !== undefined) {
      setError(false)
      setLoadingFirstPage(true)
      setLoadingAll(true)
      ref.current = [] // Clear ref state

      try {
        const response = await get(
          endpoint,
          omitBy(params, (value) => value === undefined)
        )

        if (response.ok && response.body) {
          await parseCsvStream<T>(response.body, (rows) => {
            rows.forEach((r) => {
              for (const [key, xf] of Object.entries(transforms ?? {})) {
                if (r[key]) {
                  // @ts-ignore
                  r[key] = xf(r[key])
                }
              }
              ref.current.push(r)
            })

            // Fill the first page, so the UI renders with data while we wait for
            // the rest of the stream.
            if (pageData.length === 0 && canFillPage()) {
              setLoadingFirstPage(false)
              fillPage(pagination)
            }
          })
        }

        // If we didn't load enough items to fill an entire page, the page won't be filled yet.
        // We need to check again here, and fill if needed.
        if (!canFillPage()) fillPage(pagination)

        if (!response.ok) {
          setError(true)
        }

        setLoadingFirstPage(false)
        setLoadingAll(false)
      } catch (err) {
        setError(true)
      }

      setLoadedOnce(true)
    }
  }

  return {
    ref,
    pageData,
    error,
    refresh,
    pagination,
    loadedOnce,
    loadingFirstPage,
    loadingAll,
    setPagination: fillPage as Dispatch<SetStateAction<Pagination>>,
  }
}

const useLCAResults = <T,>(endpoint: string, params?: Record<string, any>) => {
  const [data, setData] = useState<Array<T> | undefined>(undefined)
  const [error, setError] = useState(false)
  const { user } = useUser()

  const refresh = async () => {
    if (user?.org_id !== undefined) {
      setError(false)

      const result = await post(
        `/api/supabase/${user.org_id}/results/${endpoint}`,
        omitBy(params, (value) => value === undefined)
      )

      const data = await result.json<Array<T>>()

      if (result.status >= 400) {
        setError(true)
      } else {
        setData(data)
      }
    }
  }

  useEffect(() => {
    if (data === undefined) refresh()
  }, [user?.org_id, data])

  return {
    data,
    error,
    refresh,
  }
}

const usePart = (lcaID?: string) => {
  const [part, setPart] = useState<CMLTotalResultsData | undefined>(undefined)
  const { user } = useUser()

  const refresh = async () => {
    if (lcaID && user?.org_id !== undefined) {
      const result = await get(
        `/api/supabase/${user?.org_id}/query/cml_total_results`,
        {
          lca_id: lcaID,
        }
      )
      const json = await result.json<QueryRow<any>>()
      setPart(json?.data?.[0])
    }
  }
  useEffect(() => {
    refresh()
  }, [lcaID, user?.org_id])

  return {
    part,
    refresh,
  }
}

// A convenience hook for search bar logic.
// The data to be filtered is passed as the first argument, and the filtered data is returned.
// The hook stores the string state of a search query, and checks if any of the data contains the query.
// An accessor function is passed as the second to specify the search criteria from the data object.
// The return type is a 4-tuple of the filtered array, search state/setter, and error flag.
const useSearchFilter = <T,>(
  array: T[] | undefined,
  accessor: (item: T) => string | undefined | null
): [T[], string, (q: string) => void, boolean] => {
  const [searchQuery, setSearchQuery] = useState("")
  const safeArray = array ?? []

  const filteredArray = safeArray.filter((item) => {
    const label = (accessor(item) ?? "").toLowerCase()
    const query = searchQuery.toLowerCase().trim()

    if (query === "") return true
    if (label === "") return false

    return label.includes(query)
  })

  // If the search returns no result, set the error flag.
  // But only if we had data in the first place.
  const hasError =
    safeArray.length > 0 && filteredArray.length === 0 && searchQuery.length > 0

  return [filteredArray, searchQuery, setSearchQuery, hasError]
}

const useFuseSearch = <T,>(
  array: T[] | undefined
  // options: Fuse.IFuseOptions<T>
): [T[], string, (q: string) => void, boolean] => {
  const [searchQuery, setSearchQuery] = useState("")
  const safeArray = array ?? []

  // const fuse = useMemo(() => new Fuse(array ?? [], options), [array])
  const fuse = new Fuse(array ?? [])

  let filteredArray: T[] = []
  if (searchQuery !== "") {
    filteredArray = fuse
      .search(searchQuery)
      .map((result: { item: T }) => result.item)
  }

  // If the search returns no result, set the error flag.
  // But only if we had data in the first place.
  const hasError =
    safeArray.length > 0 && filteredArray.length === 0 && searchQuery.length > 0

  return [filteredArray, searchQuery, setSearchQuery, hasError]
}

const useNotification = () => {
  const { setNotification } = useAppState()

  const withNotification = (
    tasks: Array<Promise<Response | Array<Response>>>,
    before?: Notification,
    after?: Notification
  ) => {
    setNotification(before ?? GENERIC_LOADING)
    return Promise.all(tasks)
      .then(() => {
        setNotification(after ?? GENERIC_SUCCESS)
      })
      .catch(() => {
        setNotification(GENERIC_ERROR)
      })
  }

  return { withNotification }
}

const useStorage = (bucket: string, folder?: string | null) => {
  const [data, setData] = useState<
    | Array<{
        name: string
        updated_at: string
        created_at: string
        id: string
      }>
    | undefined
  >(undefined)
  const [error, setError] = useState(false)
  const { user } = useUser()

  const refresh = async () => {
    if (user?.org_id !== undefined) {
      setError(false)

      const result = await get(`/api/storage/${user.org_id}/list`, {
        bucket,
        folder,
      })

      if (result.status >= 400) {
        setError(true)
      } else {
        const json = await result.json<{ data: any }>()
        setData(json?.data)
      }
    }
  }

  useEffect(() => {
    if (data === undefined) refresh()
  }, [user?.org_id, data])

  return {
    data,
    error,
    refresh,
  }
}

export {
  useQuery,
  usePart,
  useSearchFilter,
  useNotification,
  useStorage,
  useStream,
  useFuseSearch,
  useLCAResults,
}
