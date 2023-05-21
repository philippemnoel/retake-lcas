import ky from "ky"

// The maximum number of rows returned from a Supabase GET request
const defaultPageLimit = 500
// Number of times to retry on a failed http request
const retry = 5
// Number of seconds to wait before timing out a request
const seconds = 1000
const timeout = 30 * seconds

const get = (endpoint: string, params?: Record<string, any>) => {
  return ky.get(endpoint, {
    searchParams: params,
    retry,
    timeout,
  })
}

const post = <T>(endpoint: string, body: T, headers?: Record<string, any>) => {
  return ky.post(endpoint, {
    headers: {
      "Content-Type": "application/json",
      ...(headers !== undefined && headers),
    },
    json: body,
    timeout,
  })
}

const remove = <T>(endpoint: string, body?: Record<string, T>) => {
  return ky.delete(endpoint, {
    ...(body !== undefined && { json: body }),
  })
}

export { get, post, remove, defaultPageLimit }
