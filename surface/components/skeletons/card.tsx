export default () => {
  return (
    <div
      role="status"
      className="w-full border border-gray-200 rounded-lg animate-pulse py-5 px-8"
    >
      <div className="h-2.5 bg-gray-100 rounded-full w-48 mb-4"></div>
      <div className="h-2 bg-gray-100 rounded-full mb-2.5"></div>
      <div className="h-2 bg-gray-100 rounded-full mb-2.5"></div>
      <div className="h-2 bg-gray-100 rounded-full"></div>
    </div>
  )
}
