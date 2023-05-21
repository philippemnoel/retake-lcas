import classNames from "classnames"

export default ({ marginTop }: { marginTop?: string }) => {
  return (
    <div
      className={classNames(
        "w-full p-4 animate-pulse md:p-6",
        marginTop && marginTop
      )}
    >
      <div className="h-2.5 bg-gray-100 rounded-full w-32 mb-2.5"></div>
      <div className="w-48 h-2 mb-10 bg-gray-100 rounded-full "></div>
      <div className="flex items-baseline mt-4 space-x-6">
        <div className="w-full bg-gray-100 rounded-t-lg h-48 "></div>
        <div className="w-full h-56 bg-gray-100 rounded-t-lg "></div>
        <div className="w-full bg-gray-100 rounded-t-lg h-48 "></div>
        <div className="w-full h-64 bg-gray-100 rounded-t-lg "></div>
        <div className="w-full bg-gray-100 rounded-t-lg h-56 "></div>
        <div className="w-full bg-gray-100 rounded-t-lg h-48 "></div>
        <div className="w-full bg-gray-100 rounded-t-lg h-56 "></div>
        <div className="w-full bg-gray-100 rounded-t-lg h-48 "></div>
        <div className="w-full h-56 bg-gray-100 rounded-t-lg "></div>
        <div className="w-full bg-gray-100 rounded-t-lg h-48 "></div>
      </div>
    </div>
  )
}
