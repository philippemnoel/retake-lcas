import { MagnifyingGlassIcon } from "@heroicons/react/24/outline"

export default ({
  buttons,
  onChange,
}: {
  buttons: Array<JSX.Element>
  onChange: (value: string) => void
}) => {
  return (
    <div className="bg-white w-full box-border flex flex-col-reverse md:flex-row items-center justify-between md:space-x-4 pb-3 pt-4 px-3">
      <div className="w-72 flex flex-col space-y-3 md:space-y-0 md:flex-row md:items-center">
        <form className="w-full md:max-w-sm flex-1 md:mr-4">
          <label
            htmlFor="default-search"
            className="text-sm font-medium text-gray-900 sr-only"
          >
            Search
          </label>
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="search"
              id="default-search"
              className="w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-neutral-50 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Search..."
              onChange={(event) => onChange(event.target.value)}
            />
          </div>
        </form>
      </div>
      <div className="flex flex-row items-center justify-end space-x-6">
        {buttons.map((button) => button)}
      </div>
    </div>
  )
}
