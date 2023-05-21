import {
  ArrowLongLeftIcon,
  ArrowLongRightIcon,
} from "@heroicons/react/20/solid"
import { Dispatch, SetStateAction, useState } from "react"
import classNames from "classnames"

import { defaultPageLimit } from "lib/api"

export default ({
  pagination,
  pageLimit = defaultPageLimit,
  onPageChange,
}: {
  pagination: { rows: number; from: number; to: number }
  pageLimit?: number
  onPageChange: Dispatch<
    SetStateAction<{ rows: number; from: number; to: number }>
  >
}) => {
  const pageNum = Math.ceil(pagination.rows / pageLimit)

  // Create a mapping of all pages with their corresponding start and end.
  const pagesArr = []
  let start = 0,
    end = pageLimit
  for (let index = 0; index < pageNum; index++) {
    pagesArr.push({
      index,
      start,
      end,
    })
    start += pageLimit
    end += pageLimit
  }

  const [currentPage, setCurrentPage] = useState(0)

  const paginateLeft = () => {
    if (currentPage <= 0) {
      return
    }

    const newIndex = currentPage - 1
    handlePageClick(newIndex)
  }

  const paginateRight = () => {
    if (currentPage >= pageNum - 1) {
      return
    }

    const newIndex = currentPage + 1
    handlePageClick(newIndex)
  }

  const handlePageClick = (index: number) => {
    const start = index * pageLimit
    const end =
      start + pageLimit > pagination.rows ? pagination.rows : start + pageLimit

    onPageChange({
      rows: pagination.rows,
      from: start,
      to: end,
    })
    setCurrentPage(index)
  }

  if (pagesArr.length > 1) {
    return (
      <nav className="flex items-center justify-between border-t pb-4 px-24 w-full">
        <div className="-mt-px flex w-0 flex-1">
          <button
            onClick={paginateLeft}
            className="inline-flex items-center border-t-2 border-transparent pt-4 pr-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
          >
            <ArrowLongLeftIcon
              className="mr-3 h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
            Previous
          </button>
        </div>
        <div className="hidden md:-mt-px md:flex">
          {pagesArr.map((page, index) => {
            // Hide the page if it's not the first, last, current page,
            // the page before the current one, or the page after the current one.
            if (
              index !== 0 &&
              index !== pageNum - 1 &&
              index !== currentPage &&
              index !== currentPage - 1 &&
              index !== currentPage + 1
            )
              return null

            // Determine when to show the ellipsis.
            const shouldShowEllipsisBefore =
              index === currentPage - 1 && currentPage > 2
            const shouldShowEllipsisAfter =
              index === currentPage + 1 && currentPage < pageNum - 3

            return (
              <div className="inline-flex items-center" key={index}>
                <button
                  key={index}
                  className={classNames(
                    currentPage === index
                      ? "text-indigo-500 font-semibold border-indigo-500"
                      : "text-gray-500",
                    "border-t-2 border-transparent px-4 pt-4 text-sm font-medium hover:border-gray-300 hover:text-gray-700"
                  )}
                  onClick={() => handlePageClick(index)}
                >
                  {index + 1}
                </button>
                {(shouldShowEllipsisBefore || shouldShowEllipsisAfter) && (
                  <div className="mt-2 px-2">...</div>
                )}
              </div>
            )
          })}
        </div>
        <div className="-mt-px flex w-0 flex-1 justify-end">
          <button
            onClick={paginateRight}
            className="inline-flex items-center border-t-2 border-transparent pt-4 pl-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
          >
            Next
            <ArrowLongRightIcon
              className="ml-3 h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </button>
        </div>
      </nav>
    )
  } else {
    return <></>
  }
}
