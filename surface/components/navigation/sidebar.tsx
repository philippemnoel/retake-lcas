import { useRouter } from "next/router"
import Link from "next/link"
import { Text, Title, Bold } from "@tremor/react"
import classNames from "classnames"

const Sidebar = ({
  name,
  navigation,
}: {
  name: string
  navigation: Array<{ name: string; href: string }>
}) => {
  const { asPath } = useRouter()

  return (
    <>
      <div>
        <div className="hidden md:fixed md:inset-y-0 md:flex md:flex-col w-48">
          <div className="flex flex-grow flex-col overflow-y-auto border-r border-gray-200 bg-stone-50">
            <div className="mt-5 flex flex-grow flex-col">
              <div className={classNames("px-4 pb-3 border-b h-10")}>
                <Title truncate={true}>{name}</Title>
              </div>
              <nav className="p-4">
                {navigation.map((child, index) => {
                  const focused = child.href?.replace(/ /g, "%20") === asPath
                  return (
                    <Link href={child.href} key={index}>
                      <div
                        key={index}
                        className={classNames(
                          focused
                            ? "bg-indigo-100"
                            : "text-gray-600 hover:bg-neutral-50 hover:text-gray-900",
                          "group rounded-md py-3 px-2 flex items-center text-sm font-medium"
                        )}
                      >
                        <Text truncate={true}>
                          {focused && (
                            <Bold>
                              {
                                <span className="text-indigo-600">
                                  {child.name}
                                </span>
                              }
                            </Bold>
                          )}
                          {!focused && child.name}
                        </Text>
                      </div>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar
