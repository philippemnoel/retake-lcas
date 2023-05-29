import { useState, useEffect } from "react"
import classNames from "classnames"

export default ({
  value,
  onValueChange,
  hint,
  marginTop,
  maxValue,
  placeholder,
}: {
  value?: number
  onValueChange?: (value: number) => void
  hint?: string
  marginTop?: string
  maxValue?: number
  placeholder?: string
}) => {
  const [inputValue, setInputValue] = useState(
    value === undefined || isNaN(value) ? "" : value.toString()
  )
  const [warning, setWarning] = useState(false)

  useEffect(() => {
    setInputValue(value === undefined || isNaN(value) ? "" : value.toString())
  }, [value])

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const isNumber = /[0-9]/.test(event.key)
    const isDecimalPoint = event.key === "."
    const isBackspace = event.key === "Backspace"
    const isArrow = event.key === "ArrowRight" || event.key === "ArrowLeft"
    const hasDecimalPoint = inputValue.includes(".")

    if (!isNumber && !isBackspace && !isArrow) {
      if (isDecimalPoint && !hasDecimalPoint) {
        return
      }
      event.preventDefault()
    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = event.target.value
    const numberValue = parseFloat(newValue)

    newValue = newValue.replace(/^0{2,}/, "0")

    setInputValue(newValue)

    if (maxValue !== undefined && numberValue > maxValue) {
      setWarning(true)
    } else {
      setWarning(false)
    }

    if (!isNaN(numberValue) || newValue === "") {
      onValueChange && onValueChange(numberValue)
    }
  }

  return (
    <div className="relative">
      <input
        type="text"
        className={classNames(
          "w-full rounded-md bg-white ring-1 border-none px-4 focus:border-none text-sm py-2",
          marginTop && marginTop,
          warning
            ? "ring-red-500 focus:ring-red-500"
            : "ring-gray-300 focus:ring-gray-300"
        )}
        placeholder={placeholder ?? ""}
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyPress}
      />
      {hint && !warning && (
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 text-xs">
          {hint}
        </div>
      )}
      {warning && (
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-red-500 text-xs">
          Too high
        </div>
      )}
    </div>
  )
}
