export default () => {
  return (
    <div className="p-4 pt-0 space-y-4 divide-y animate-pulse divide-gray-200 w-full">
      {Array.from({ length: 5 }, (_el, index) => (
        <div
          className="flex items-center justify-between pt-6 pb-3"
          key={index}
        >
          <div>
            <div className="h-2.5 bg-gray-200 rounded-full w-24 mb-2.5"></div>
            <div className="w-32 h-2 bg-gray-100 rounded-full "></div>
          </div>
          <div className="h-2.5 bg-gray-200 rounded-full w-12"></div>
        </div>
      ))}
    </div>
  )
}
