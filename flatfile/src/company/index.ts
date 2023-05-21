/**
 * This is a scaffold for defining a Workbook with Sheets and Portals.
 * Test this scaffold using the sample file in examples/sample-uploads/my-sheet-sample.csv.
 *
 * See examples/workbooks/FullExample.ts for a full, working example of a Workbook.
 */
import { Portal, Workbook } from "@flatfile/configure"

import {
  PurchaseSheetName,
  TravelByLocationSheetName,
  TravelByDistanceSheetName,
  CommuteByLocationSheetName,
  CommuteByDistanceSheetName,
  WasteSheetName,
  MobileCombustionSheetName,
  EnergySheetName,
  RefrigerantSheetName,
  ProcessingSheetName,
  ProductUseSheetName,
  OtherSheetName,
  SiteSheetName,
} from "./sheets"

import {
  Purchases,
  TravelByLocation,
  TravelByDistance,
  CommuteByDistance,
  CommuteByLocation,
  Waste,
  MobileCombustion,
  Energy,
  Refrigerants,
  Processing,
  ProductUse,
  Other,
  Sites,
} from "./sheets"

import {
  purchases,
  mobile,
  refrigerants,
  energy,
  processing,
  sites,
  travelByDistance,
  travelByLocation,
  commuteByDistance,
  commuteByLocation,
  waste,
} from "./help"

const portals = [
  {
    name: "PurchasesPortal",
    sheetName: PurchaseSheetName,
    sheet: Purchases,
    helpContent: purchases,
  },
  {
    name: "TravelByLocationPortal",
    sheetName: TravelByLocationSheetName,
    sheet: TravelByLocation,
    helpContent: travelByLocation,
  },
  {
    name: "TravelByDistancePortal",
    sheetName: TravelByDistanceSheetName,
    sheet: TravelByDistance,
    helpContent: travelByDistance,
  },
  {
    name: "CommuteByLocationPortal",
    sheetName: CommuteByLocationSheetName,
    sheet: CommuteByLocation,
    helpContent: commuteByLocation,
  },
  {
    name: "CommuteByDistancePortal",
    sheetName: CommuteByDistanceSheetName,
    sheet: CommuteByDistance,
    helpContent: commuteByDistance,
  },
  {
    name: "WastePortal",
    sheetName: WasteSheetName,
    sheet: Waste,
    helpContent: waste,
  },
  {
    name: "MobileCombustionPortal",
    sheetName: MobileCombustionSheetName,
    sheet: MobileCombustion,
    helpContent: mobile,
  },
  {
    name: "EnergyPortal",
    sheetName: EnergySheetName,
    sheet: Energy,
    helpContent: energy,
  },
  {
    name: "RefrigerantPortal",
    sheetName: RefrigerantSheetName,
    sheet: Refrigerants,
    helpContent: refrigerants,
  },
  {
    name: "ProcessingPortal",
    sheetName: ProcessingSheetName,
    sheet: Processing,
    helpContent: processing,
  },
  {
    name: "ProductUsePortal",
    sheetName: ProductUseSheetName,
    sheet: ProductUse,
  },
  {
    name: "OtherPortal",
    sheetName: OtherSheetName,
    sheet: Other,
  },
  {
    name: "SitesPortal",
    sheetName: SiteSheetName,
    sheet: Sites,
    helpContent: sites,
  },
]

export default new Workbook({
  name: "CarbonAccounting",
  namespace: "carbon-accounting-workbook",
  portals: portals.map(
    (portal) =>
      new Portal({
        name: portal.name,
        sheet: portal.sheetName,
        ...(portal.helpContent !== undefined && {
          helpContent: portal.helpContent as string,
        }),
      })
  ),
  sheets: portals.reduce((acc: Record<string, any>, obj) => {
    acc[obj.sheetName] = obj.sheet
    return acc
  }, {} as {}),
})
