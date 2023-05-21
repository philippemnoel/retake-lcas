import { useRef, ChangeEvent } from "react"

export default ({
  disabled,
  onUpload,
  children,
}: {
  disabled: boolean
  onUpload: (data: FormData) => void
  children: React.ReactNode
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onClick = () => {
    if (fileInputRef.current && !disabled) fileInputRef.current.click()
  }

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]

    if (!selectedFile) return

    const formData = new FormData()
    formData.append("file", selectedFile, selectedFile.name)

    onUpload(formData)
  }

  return (
    <div onClick={onClick}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
      />
      {children}
    </div>
  )
}
