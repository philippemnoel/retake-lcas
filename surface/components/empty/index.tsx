import { Icon, Title, Text, Flex } from "@tremor/react"
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline"

export default ({
  title,
  description,
  buttons,
}: {
  title: string
  description: string
  buttons: Array<JSX.Element> | undefined
}) => {
  return (
    <div className="w-full pt-16 max-w-sm mx-auto text-center">
      <Icon
        icon={ExclamationTriangleIcon}
        color="indigo"
        size="lg"
        variant="light"
      />
      <Title marginTop="mt-4" textAlignment="text-center" color="indigo">
        {title}
      </Title>
      <Text marginTop="mt-2" textAlignment="text-center">
        {description}
      </Text>
      <Flex marginTop="mt-6" justifyContent="justify-center" spaceX="space-x-4">
        {buttons?.map((button) => button)}
      </Flex>
    </div>
  )
}
