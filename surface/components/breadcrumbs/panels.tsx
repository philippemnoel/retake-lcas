import { CheckIcon } from "@heroicons/react/24/solid"
import Link from "next/link"
import classNames from "classnames"
import { ChartBarIcon } from "@heroicons/react/24/outline"

import { LCAStage } from "lib/types/calculator.types"

import Step from "@/components/menus/step"

type Step = {
  id?: string
  name: string
  href: string
  complete: boolean
}

type Props = {
  steps: Step[]
  current?: number
}

const stages = [
  LCAStage.MATERIALS,
  LCAStage.TRANSPORTATION,
  LCAStage.MANUFACTURING,
  LCAStage.USE,
  LCAStage.DISPOSAL,
]

export default ({ current, steps }: Props) => (
  <div className="lg:border-b lg:border-t">
    <nav className="mx-auto max-w-7xl" aria-label="Progress">
      <ol
        role="list"
        className="overflow-hidden rounded-md lg:flex lg:rounded-none lg:border-l lg:border-r lg:border-gray-200"
      >
        {steps.map((step, stepIdx) => (
          <Step
            type={stages[stepIdx]}
            completed={step.complete}
            show={stepIdx !== 5}
            key={stepIdx}
          >
            <li key={step.id} className="relative overflow-hidden lg:flex-1">
              <div
                className={classNames(
                  "overflow-hidden border border-gray-200 lg:border-0 h-full",
                  {
                    "lg:border-r": stepIdx !== steps.length - 1,
                  }
                )}
              >
                <Link
                  href={step.href}
                  className={classNames(
                    "group flex items-start px-6 py-5 text-sm font-medium",
                    {
                      "lg:pl-6": stepIdx !== 0,
                    }
                  )}
                >
                  <span
                    className={classNames(
                      "absolute left-0 top-0 h-full w-1 bg-transparent lg:bottom-0 lg:top-auto lg:h-1 lg:w-full",
                      {
                        "bg-indigo-600": current === stepIdx,
                        "group-hover:bg-indigo-200": current !== stepIdx,
                      }
                    )}
                    aria-hidden="true"
                  />
                  <span className="flex-shrink-0">
                    <span
                      className={classNames(
                        "flex h-10 w-10 items-center justify-center rounded-full",
                        {
                          "bg-indigo-100 border-2 border-indigo-600":
                            step.complete,
                          "border-2": !step.complete,
                          "border-indigo-600": current === stepIdx,
                          "border-gray-300":
                            current !== stepIdx && !step.complete,
                        }
                      )}
                    >
                      {step.complete ? (
                        <CheckIcon
                          className="h-6 w-6 text-indigo-600"
                          aria-hidden="true"
                        />
                      ) : (
                        <span
                          className={classNames({
                            "text-indigo-600": current === stepIdx,
                            "text-gray-500": current !== stepIdx,
                          })}
                        >
                          {step.id}
                          {stepIdx === steps.length - 1 && (
                            <ChartBarIcon className="w-4 h-4" />
                          )}
                        </span>
                      )}
                    </span>
                  </span>
                  <span className="ml-4 mt-0.5 flex min-w-0 flex-col">
                    <span
                      className={classNames("text-sm font-medium", {
                        "text-indigo-600": step.complete || current === stepIdx,
                        "text-gray-500": !step.complete && current !== stepIdx,
                        "mt-2": stepIdx === steps.length - 1,
                      })}
                    >
                      {step.name}
                    </span>
                    <span
                      className={classNames(
                        "text-sm",
                        step.complete ? "text-indigo-400" : "text-rose-400"
                      )}
                    >
                      {stepIdx === steps.length - 1
                        ? ""
                        : step.complete
                        ? "Complete"
                        : "Incomplete"}
                    </span>
                  </span>
                </Link>
              </div>
            </li>
          </Step>
        ))}
      </ol>
    </nav>
  </div>
)
