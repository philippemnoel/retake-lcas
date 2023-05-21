import Papa from "papaparse"
import { ReadableWebToNodeStream } from "readable-web-to-node-stream"

// Tech Debt: We don't have subscriptions to the database, so in the meantime we
// create a function that repeatedly calls the same function multiple times,
// which allows us to catchjk the database when it updates

const isDevelopment = process.env.RETAKE_ENV === "dev"

const callFunctionRepeatedly = (
  func: () => void,
  times: number,
  interval = 2000
) => {
  let count = 0
  func()
  const intervalId = setInterval(() => {
    func()
    count++
    if (count === times) {
      clearInterval(intervalId)
    }
  }, interval)
}

const formatNumber = (value: number) => {
  if (value < 0.01) return value.toExponential(2)
  if (value < 1000) return value.toFixed(2)
  return value.toExponential(2)
}

const makeSingular = (str: string) => {
  const lastChar = str.slice(-1)
  const secondLastChar = str.slice(-2, -1)

  if (lastChar === "s") {
    if (secondLastChar === "e" && str.slice(-3, -2) === "i") {
      // Plurals like 'cities' -> 'city'
      return str.slice(0, -3) + "y"
    } else if (secondLastChar === "e" && str.slice(-3, -2) === "s") {
      // Plurals like 'buses' -> 'bus'
      return str.slice(0, -2)
    } else {
      // General case: remove 's' from the end
      return str.slice(0, -1)
    }
  }

  return str
}

const formatTimestamp = (timestamp: string) =>
  new Date(timestamp).toLocaleString()

const downloadBlobAsFile = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.download = fileName

  // Simulate a click event on the link
  const clickEvent = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: false,
  })
  link.dispatchEvent(clickEvent)

  // Cleanup
  setTimeout(() => {
    URL.revokeObjectURL(url)
    link.remove()
  }, 0)
}

const openUrlInNewTab = (url: string) => {
  const link = document.createElement("a")

  link.href = url
  link.target = "_blank"

  // Simulate a click event on the link
  const clickEvent = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: false,
  })
  link.dispatchEvent(clickEvent)

  // Cleanup
  setTimeout(() => {
    link.remove()
  }, 0)
}

const parseCsvStream = <T>(
  stream: ReadableStream<Uint8Array>,
  callback: (row: T[]) => void
): Promise<void> => {
  return new Promise((resolve) => {
    // PapaParse only accepts NodeJS-style streams, so we use a helper to convert.
    const nodeStream = new ReadableWebToNodeStream(stream)
    const handleChunk = (rows: Papa.ParseResult<unknown>) => {
      const data = rows.data as T[]
      if (data.length > 0) {
        callback(data)
      } else {
        // Chunk function will be called with empty data when parsing is complete.
        resolve()
      }
    }
    // @ts-ignore
    Papa.parse(nodeStream, { header: true, chunk: handleChunk })
  })
}

const truncateText = (text: string, maxLength = 15): string => {
  if (text.length <= maxLength) {
    return text
  }

  const truncatedText = text.substring(0, maxLength - 3)

  const lastSpaceIndex = truncatedText.lastIndexOf(" ")

  if (lastSpaceIndex !== -1) {
    const finalText = truncatedText.substring(0, lastSpaceIndex) + "..."
    return finalText
  }

  return truncatedText + "..."
}

const allAssigned = (...fields: (number | string | null | undefined)[]) => {
  return fields.every(
    (x) => x !== null && x !== undefined && !Number.isNaN(x) && x !== ""
  )
}

export {
  callFunctionRepeatedly,
  formatNumber,
  parseCsvStream,
  formatTimestamp,
  makeSingular,
  isDevelopment,
  downloadBlobAsFile,
  openUrlInNewTab,
  truncateText,
  allAssigned,
}
