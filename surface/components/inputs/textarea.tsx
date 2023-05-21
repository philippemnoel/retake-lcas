import { useState, useEffect } from "react"
import classNames from "classnames"

export default ({
  value,
  onValueChange,
  marginTop,
  placeholder,
  rows = 20,
}: {
  value?: string
  onValueChange?: (value: string) => void
  marginTop?: string
  placeholder?: string
  rows?: number
}) => {
  const [inputValue, setInputValue] = useState<string | undefined>(value)

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(event.target.value)
  }

  useEffect(() => {
    if (onValueChange) onValueChange(inputValue ?? "")
  }, [inputValue])

  return (
    <div className="relative">
      <textarea
        rows={rows}
        className={classNames(
          "w-full rounded-md bg-white ring-1 border-none focus:border-none text-sm py-2.5 px-3 resize-none ring-gray-300 focus:ring-gray-300",
          marginTop && marginTop
        )}
        placeholder={placeholder ?? ""}
        value={inputValue}
        onChange={handleChange}
      />
    </div>
  )
}
