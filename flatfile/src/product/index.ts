/**
 * This is a scaffold for defining a Workbook with Sheets and Portals.
 * Test this scaffold using the sample file in examples/sample-uploads/my-sheet-sample.csv.
 *
 * See examples/workbooks/FullExample.ts for a full, working example of a Workbook.
 */
import { Portal, Workbook } from "@flatfile/configure"

import {
  BOMSheetName,
  BOMListSheetName,
  MaterialSheetName,
  SupplierSheetName,
} from "./sheets"
import { BOM, BOMList, Materials, Suppliers } from "./sheets"

const portals = [
  {
    name: "BOMPortal",
    sheetName: BOMSheetName,
    sheet: BOM,
  },
  {
    name: "BOMListPortal",
    sheetName: BOMListSheetName,
    sheet: BOMList,
  },
  {
    name: "MaterialsPortal",
    sheetName: MaterialSheetName,
    sheet: Materials,
  },
  {
    name: "SuppliersPortal",
    sheetName: SupplierSheetName,
    sheet: Suppliers,
  },
]

export default new Workbook({
  name: "Products",
  namespace: "product-workbook",
  portals: portals.map(
    (portal) =>
      new Portal({
        name: portal.name,
        sheet: portal.sheetName,
      })
  ),
  sheets: portals.reduce((acc: Record<string, any>, obj) => {
    acc[obj.sheetName] = obj.sheet
    return acc
  }, {} as {}),
})
