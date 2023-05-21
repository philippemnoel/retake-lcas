import { useEffect, useMemo } from "react"
import { useUser } from "@auth0/nextjs-auth0"
import {
  SelectBox,
  SelectBoxItem,
  MultiSelectBox,
  MultiSelectBoxItem,
} from "@tremor/react"

import { useStream, useSearchFilter } from "components/hooks"
import { SelectBoxProps } from "@tremor/react/dist/components/input-elements/SelectBox/SelectBox"
import uniq from "lodash.uniq"

type Props<T extends Record<string, any>> = {
  selected: string[]
  onChange: (value: string[]) => void
  keyField: keyof T
  displayField: keyof T
  endpoint: string
  placeholder?: string
  multiple?: boolean
  marginTop?: SelectBoxProps<any>["marginTop"]
}

// To simplify the type definitions, ConnectedCombobox deals only with arrays
// in "selected" and "onChange" props, even if multiple=false.
// This is because the behavior the the select box should change subtly if the user
// is expected to select one or multiple items.
// If multiple=false, it's expected that the parent passes an array of one element
// for the "selected" props, and will receive and array of one element for "onChange".

export default <T extends Record<string, any>>(props: Props<T>) => {
  const { user } = useUser()
  const selected = props.selected
  const keyField = props.keyField
  const marginTop = props.marginTop ?? "mt-1"

  // Make a set for fast lookup of a given ID in props.value.
  // We'll need to do this lookup to check if a combo box item is selected,
  // and this will save some iterations in a large list of selected items.
  const valueIdSet = useMemo(() => {
    const set: Record<string, true> = {}
    selected.forEach((v) => {
      set[v] = true
    })
    return set
  }, [selected])

  const { ref, refresh, loadingAll, loadedOnce, error } = useStream<T>(
    props.endpoint,
    {
      org_id: user?.org_id,
      fields: [props.keyField, props.displayField],
    }
  )

  // Manage the state for the search bar in the combo box.
  const [searchFilteredData, , setSearchBarQuery] = useSearchFilter(
    ref.current,
    (i) => i.name
  )

  // Refreshing large amounts of data can be expensive, so we only do it once.
  // Either the parent will need to remount this component, or the user will have
  // to refresh the page to see new data.
  useEffect(() => {
    if (!loadingAll && !loadedOnce) {
      refresh()
    }
  }, [loadingAll, loadedOnce])

  const selectedItems = useMemo(() => {
    const items = []
    for (const item of ref.current) {
      if (valueIdSet[item[keyField]]) {
        items.push(item)
      }
    }
    return items
  }, [selected, ref, keyField])

  // Only show up to 50 search results. The user can just keep typing in the
  // search box to filter down what they're trying to find.
  // Because the search results will include the selected items, we need to
  // filter those out from the list, because we'll display them up top.
  const nonSelectedItems = searchFilteredData.slice(0, 50).filter((item) => {
    const id = item[props.keyField] as string
    if (valueIdSet[id]) return false
    return true
  })

  // Items to show in the dropdown - ensure that at least 10 items are shown
  const displayItems = uniq([
    ...selectedItems,
    ...nonSelectedItems,
    ...(nonSelectedItems.length === 0
      ? ref.current.slice(0, Math.min(10, ref.current.length))
      : []),
  ])

  // Return error UI if something went wrong loading the stream.
  // Note the exact height specified on the spinner. It should match the
  // height of the Input so there is no reflow when loading is complete.
  if (error) {
    return (
      <SelectBox
        placeholder="Unexpected error loading data"
        marginTop={marginTop}
      >
        <></>
      </SelectBox>
    )
  }

  // Return loading spinner if we're not done loading the entire stream.
  // Note the exact height specified on the spinner. It should match the
  // height of the Input so there is no reflow when loading is complete.
  if (!loadedOnce || loadingAll) {
    return (
      <SelectBox placeholder="Loading..." marginTop={marginTop}>
        <></>
      </SelectBox>
    )
  }

  if (displayItems.length === 0) {
    return (
      <SelectBox placeholder="No items found" marginTop={marginTop}>
        <></>
      </SelectBox>
    )
  }

  if (!props.multiple) {
    return (
      <SelectBox
        value={props.selected[0] ?? ""}
        onValueChange={(value: string) => props.onChange([value])}
        onInputValueChange={(value: string) => setSearchBarQuery(value)}
        marginTop={marginTop}
      >
        {displayItems.map((item) => (
          <SelectBoxItem
            value={item[props.keyField] as string}
            key={item[props.keyField] as string}
            text={item[props.displayField]}
          />
        ))}
      </SelectBox>
    )
  } else {
    return (
      <MultiSelectBox
        value={props.selected}
        onValueChange={props.onChange}
        onInputValueChange={(value: string) => setSearchBarQuery(value)}
        marginTop={marginTop}
      >
        {displayItems.map((item) => (
          <MultiSelectBoxItem
            value={item[props.keyField] as string}
            key={item[props.keyField] as string}
            text={item[props.displayField]}
          />
        ))}
      </MultiSelectBox>
    )
  }
}
