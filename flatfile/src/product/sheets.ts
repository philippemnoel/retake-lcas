/**
 * This is a scaffold for defining a Workbook with Sheets and Portals.
 * Test this scaffold using the sample file in examples/sample-uploads/my-sheet-sample.csv.
 *
 * See examples/workbooks/FullExample.ts for a full, working example of a Workbook.
 */

import { Sheet, TextField, NumberField } from "@flatfile/configure"

import { RequiredTextField } from "../shared/fields"

const BOMSheetName = "BOM"
const BOMListSheetName = "BOMList"
const MaterialSheetName = "Materials"
const SupplierSheetName = "Suppliers"

const BOM = new Sheet(BOMSheetName, {
  part_id: TextField({
    label: "Part Identifier or Code",
  }),
  description: RequiredTextField({
    label: "Part Description or Name",
  }),
  weight_kilograms: NumberField({
    label: "Total Weight (kg)",
  }),
  weight_grams: NumberField({
    label: "Total Weight (g)",
  }),
  supplier: TextField({
    label: "Supplier",
  }),
  origin: TextField({
    label: "Geographic Origin",
  }),
  manufacturing_process: TextField({
    label: "Manufacturing Process",
  }),
  material: TextField({
    label: "Material Name",
  }),
  category: TextField({
    label: "Material Category",
  }),
})

const BOMList = new Sheet(BOMListSheetName, {
  parent_part_id: RequiredTextField({
    label: "Parent Part Identifier",
  }),
  child_part_id: RequiredTextField({
    label: "Child Part Identifier",
  }),
  child_description: RequiredTextField({
    label: "Child Part Description",
  }),
  weight_kilograms: NumberField({
    label: "Total Weight (kg)",
  }),
  weight_grams: NumberField({
    label: "Total Weight (g)",
  }),
  parent_description: TextField({
    label: "Parent Part Description",
  }),
  supplier: TextField({
    label: "Supplier",
  }),
  origin: TextField({
    label: "Geographic Origin",
  }),
  manufacturing_process: TextField({
    label: "Manufacturing Process",
  }),
  material: TextField({
    label: "Material Name",
  }),
  category: TextField({
    label: "Material Category",
  }),
})

const Materials = new Sheet(MaterialSheetName, {
  part_id: RequiredTextField({
    label: "Part Identifier or Code",
  }),
  description: RequiredTextField({
    label: "Part Description or Name",
  }),
  supplier: TextField({
    label: "Supplier",
  }),
  origin: TextField({
    label: "Geographic Origin",
  }),
  manufacturing_process: TextField({
    label: "Manufacturing Process",
  }),
  material: TextField({
    label: "Primary Material",
  }),
})

const Suppliers = new Sheet(SupplierSheetName, {
  name: RequiredTextField({
    label: "Supplier Name",
  }),
  email: TextField({
    label: "Supplier Email",
  }),
  website: TextField({
    label: "Supplier Website",
  }),
})

export { BOMSheetName, BOMListSheetName, MaterialSheetName, SupplierSheetName }
export { BOM, BOMList, Materials, Suppliers }
