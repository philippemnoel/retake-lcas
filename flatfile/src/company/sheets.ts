/**
 * This is a scaffold for defining a Workbook with Sheets and Portals.
 * Test this scaffold using the sample file in examples/sample-uploads/my-sheet-sample.csv.
 *
 * See examples/workbooks/FullExample.ts for a full, working example of a Workbook.
 */

import {
  NumberField,
  Sheet,
  TextField,
  makeField,
  Message,
} from "@flatfile/configure"

const PurchaseSheetName = "Purchases"
const TravelByLocationSheetName = "TravelByLocation"
const TravelByDistanceSheetName = "TravelByDistance"
const CommuteByLocationSheetName = "CommuteByLocation"
const CommuteByDistanceSheetName = "CommuteByDistance"
const WasteSheetName = "Waste"
const EnergySheetName = "Energy"
const MobileCombustionSheetName = "MobileCombustion"
const RefrigerantSheetName = "Refrigerants"
const ProcessingSheetName = "Processing"
const SiteSheetName = "Sites"
const ProductUseSheetName = "ProductUse"
const OtherSheetName = "Other"

const RequiredTextField = makeField(TextField(), {
  required: true,
  validate: (val: string) => {
    if (val === null || val === undefined || val === "") {
      return [new Message("This field cannot be empty", "error", "validate")]
    }
  },
})

const RequiredNumberField = makeField(NumberField(), {
  required: true,
  validate: (val: number) => {
    if (val === null || val === undefined) {
      return [new Message("This field cannot be empty", "error", "validate")]
    }
  },
})

const NonEmptyNumberField = makeField(NumberField(), {
  validate: (val: number) => {
    if (val === null || val === undefined) {
      return [new Message("This field cannot be empty", "error", "validate")]
    }
  },
})

const Energy = new Sheet(
  EnergySheetName,
  {
    supplier: TextField({
      label: "Supplier",
      description: "Name of energy supplier or utility provider.",
    }),
    description: RequiredTextField({
      label: "Description",
      description:
        "A description of the fuel or utility, e.g. Electricity, Natural Gas.",
    }),
    year: RequiredNumberField({
      label: "Year",
      description: "The year that the fuel or utility was consumed.",
    }),
    location: RequiredTextField({
      label: "Location",
      description:
        "Location of the site or utility provider, either State, Country or Country.",
    }),
    quantity: RequiredNumberField({
      label: "Quantity",
      description:
        "Quantity consumed. For instance, if 5kWh electricity was consumed, quantity would be 5.",
    }),
    units: RequiredTextField({
      label: "Units",
      description:
        "Units of measurement for the quantity, e.g. gallons, kWh, etc.",
    }),
    kgCO2e: NonEmptyNumberField({
      label: "kgCO2e",
      description:
        "Total kgCO2e impact of the item or activity. If this column provided, Retake will not compute emissions factors and will use this column as the carbon footprint.",
    }),
  },
  {
    allowCustomFields: true,
  }
)

const MobileCombustion = new Sheet(
  MobileCombustionSheetName,
  {
    supplier: TextField({
      label: "Supplier",
      description: "Name of energy supplier or fuel company.",
    }),
    description: RequiredTextField({
      label: "Description",
      description: "A description of the fuel used, e.g. Diesel, Gasoline/",
    }),
    year: RequiredNumberField({
      label: "Year",
      description: "The year that the fuel was consumed.",
    }),
    vehicle_type: TextField({
      label: "Vehicle Type",
      description: "Type of vehicle that consumed the fuel.",
    }),
    location: RequiredTextField({
      label: "Location",
      description:
        "Location of where the fuel wasw produced was combusted, depending on whether a well-to-tank or tank-to-wheel emissions factor is desired. Please format as State, Country or Country.",
    }),
    quantity: RequiredNumberField({
      label: "Quantity",
      description:
        "Quantity consumed. For instance, if 5 gallons of fuel was consumed, quantity would be 5.",
    }),
    units: RequiredTextField({
      label: "Units",
      description:
        "Units of measurement for the quantity, e.g. gallons, liters, etc.",
    }),
    kgCO2e: NonEmptyNumberField({
      label: "kgCO2e",
      description:
        "Total kgCO2e impact of the item or activity. If this column provided, Retake will not compute emissions factors and will use this column as the carbon footprint.",
    }),
  },
  {
    allowCustomFields: true,
  }
)

const Refrigerants = new Sheet(
  RefrigerantSheetName,
  {
    supplier: TextField({
      label: "Supplier",
      description: "Name of the refrigerant supplier or maintenance company.",
    }),
    description: RequiredTextField({
      label: "Refrigerant Name",
      description: "The name of the refrigerant or chemical.",
    }),
    year: RequiredNumberField({
      label: "Year",
      description: "The year that the refrigerant was consumed.",
    }),
    location: RequiredTextField({
      label: "Location",
      description:
        "Location of the site where the refrigerant was consumed. Please format as State, Country or Country.",
    }),
    quantity: RequiredNumberField({
      label: "Quantity",
      description:
        "Quantity consumed. For instance, if 5kg of refrigerant was consumed, quantity would be 5.",
    }),
    units: RequiredTextField({
      label: "Units",
      description: "Units of measurement for the quantity, e.g. kg, m3.",
    }),
    kgCO2e: NonEmptyNumberField({
      label: "kgCO2e",
      description:
        "Total kgCO2e impact of the item or activity. If this column provided, Retake will not compute emissions factors and will use this column as the carbon footprint.",
    }),
  },
  {
    allowCustomFields: true,
  }
)

const Purchases = new Sheet(
  PurchaseSheetName,
  {
    supplier: TextField({
      label: "Supplier",
      description: "Name of the supplier.",
    }),
    description: RequiredTextField({
      label: "Description",
      description:
        "A description of the item, activity, or expense that helps Retake find an emissions factor.",
    }),
    year: RequiredNumberField({
      label: "Year",
      description: "The year that this activity took place.",
    }),
    location: RequiredTextField({
      label: "Location",
      description:
        "Location of the activity or origin of the item, preferably as State, Country or Country.",
    }),
    quantity: RequiredNumberField({
      label: "Quantity",
      description:
        "Quantity of the item or activity. For instance, if the activity was 5kWh electricity, quantity would be 5.",
    }),
    units: RequiredTextField({
      label: "Units",
      description:
        "Units of measurement for the quantity, e.g. USD, kg, kWh, etc.",
    }),
    kgCO2e: NonEmptyNumberField({
      label: "kgCO2e",
      description:
        "Total kgCO2e impact of the item or activity. If this column provided, Retake will not compute emissions factors and will use this column as the carbon footprint.",
    }),
  },
  {
    allowCustomFields: true,
  }
)

const Processing = new Sheet(
  ProcessingSheetName,
  {
    description: RequiredTextField({
      label: "Description",
      description:
        "A description of the product, including type, composition, and other relevant characteristics.",
    }),
    year: RequiredNumberField({
      label: "Year",
      description: "The year that the product was processed.",
    }),
    location: RequiredTextField({
      label: "Location",
      description:
        "Location of where the product was processed, preferably as State, Country or Country.",
    }),
    quantity: RequiredNumberField({
      label: "Quantity",
      description:
        "Quantity of the product. For instance, if 10 grams of cotton was processed, this would be 10.",
    }),
    units: RequiredTextField({
      label: "Units",
      description:
        "Units of measurement for the quantity. Can also be the name of the item, e.g. shirts or cans.",
    }),
    energy_source: TextField({
      label: "Energy Source",
      description:
        "Name of the energy source used to power the processing of the equipment.",
    }),
    kgCO2e: NonEmptyNumberField({
      label: "kgCO2e",
      description:
        "Total kgCO2e impact of the item or activity. If this column provided, Retake will not compute emissions factors and will use this column as the carbon footprint.",
    }),
  },
  {
    allowCustomFields: true,
  }
)

const ProductUse = new Sheet(
  ProductUseSheetName,
  {
    description: RequiredTextField({
      label: "Product Description",
      description:
        "A description of the product, including type, composition, and other relevant characteristics.",
    }),
    year: RequiredNumberField({
      label: "Year",
      description: "The year that the product was processed.",
    }),
    location: RequiredTextField({
      label: "Location",
      description:
        "Location of where the product is used, preferably as State, Country or Country.",
    }),
    quantity: RequiredNumberField({
      label: "Quantity",
      description:
        "Quantity of energy used by the product. For instance, if the product consumes 5kWh per hour, quantity would be 5.",
    }),
    units: RequiredTextField({
      label: "Units",
      description:
        "Units of measurement for the quantity. For example, if the product consumes 5kWh per hour, units would be kWh per hour.",
    }),
    service_life: RequiredTextField({
      label: "Service Life",
      description:
        "Amount of time that the product is expected to consume energy during its service life. Please include units of time, e.g. hours or days.",
    }),
    energy_source: RequiredTextField({
      label: "Source Description",
      description: "Name of the energy used by the product.",
    }),
    kgCO2e: NonEmptyNumberField({
      label: "kgCO2e",
      description:
        "Total kgCO2e impact of the item or activity. If this column provided, Retake will not compute emissions factors and will use this column as the carbon footprint.",
    }),
  },
  {
    allowCustomFields: true,
  }
)

const Sites = new Sheet(
  SiteSheetName,
  {
    year: RequiredNumberField({
      label: "Year",
      description:
        "The year that the site or franchise's activities are being measured.",
    }),
    location: RequiredTextField({
      label: "Location",
      description:
        "Location of the site or activity, preferably as State, Country or Country.",
    }),
    description: RequiredNumberField({
      label: "Activity Name",
      description:
        "Description of the activity that the site is performing, e.g. type of fuel or transportation.",
    }),
    site_description: TextField({
      label: "Site or Franchise Description",
      description:
        "A description of the site or franchise, including business type, size, and other relevant characteristics.",
    }),
    quantity: RequiredNumberField({
      label: "",
      description:
        "Quantity of the activity performed by the site. For instance, if the activity was 5kWh electricity, quantity would be 5.",
    }),
    units: RequiredTextField({
      label: "Units",
      description:
        "Units of measurement for the quantity, e.g. USD, kg, kWh, etc.",
    }),
    kgCO2e: NonEmptyNumberField({
      label: "kgCO2e",
      description:
        "Total kgCO2e generated by the site or franchise. If this column provided, Retake will not compute emissions factors and will use this column as the carbon footprint.",
    }),
  },
  {
    allowCustomFields: true,
  }
)

const Other = new Sheet(
  OtherSheetName,
  {
    supplier: TextField({
      label: "Supplier",
      description: "Name of the supplier.",
    }),
    description: RequiredTextField({
      label: "Description",
      description:
        "A description of the item or activity that helps Retake find an emissions factor.",
    }),
    year: RequiredNumberField({
      label: "Year",
      description: "The year that this activity took place.",
    }),
    location: RequiredTextField({
      label: "Location",
      description:
        "Location of the activity or origin of the item, preferably as State, Country or Country.",
    }),
    quantity: RequiredNumberField({
      label: "Quantity",
      description: "Quantity of the item or activity.",
    }),
    units: RequiredTextField({
      label: "Units",
      description: "Units of measurement for the quantity.",
    }),
    kgCO2e: NonEmptyNumberField({
      label: "kgCO2e",
      description:
        "Total kgCO2e impact of the item or activity. If this column provided, Retake will not compute emissions factors and will use this column as the carbon footprint.",
    }),
  },
  {
    allowCustomFields: true,
  }
)

const TravelByLocation = new Sheet(TravelByLocationSheetName, {
  description: TextField({
    label: "Description",
    description:
      "Travel details. For instance, passenger name, airline name, goods transported, etc.",
  }),
  travel_type: RequiredTextField({
    label: "Travel Type",
    description: "Type of commute, e.g. Car Ride, Bus Ride.",
  }),
  origin: RequiredTextField({
    label: "Origin",
    description:
      "The origin of travel or transportation, preferably as State, Country or Country.",
  }),
  destination: RequiredTextField({
    label: "Destination",
    description:
      "The destination of travel or transportation, preferably as State, Country or Country.",
  }),
  year: RequiredTextField({
    label: "Year",
    description: "Year that this travel or transporation took place.",
  }),
  quantity: NumberField({
    label: "Distance",
    description:
      "The distance of travel or transportation. For instance, if the distance was 100 miles, distance would be 100.",
  }),
  units: TextField({
    label: "Units",
    description: "The units of distance, e.g. mile, km.",
  }),
  kgCO2e: NonEmptyNumberField({
    label: "kgCO2e",
    description:
      "Total kgCO2e impact of travel or transportation. If this column provided, Retake will not compute emissions factors and will use this column as the carbon footprint.",
  }),
})

const TravelByDistance = new Sheet(TravelByDistanceSheetName, {
  description: TextField({
    label: "Description",
    description:
      "Travel details. For instance, passenger name, airline name, goods transported, etc.",
  }),
  travel_type: RequiredTextField({
    label: "Travel Type",
    description: "Type of travel or transportation, e.g. Car Ride, Plane Ride.",
  }),
  quantity: RequiredNumberField({
    label: "Distance",
    description:
      "The distance of travel or transportation. For instance, if the distance was 100 miles, distance would be 100.",
  }),
  units: RequiredTextField({
    label: "Units",
    description: "The units of distance, e.g. mile, km.",
  }),
  year: RequiredNumberField({
    label: "Year",
    description: "Year that this travel took place.",
  }),
  kgCO2e: NonEmptyNumberField({
    label: "kgCO2e",
    description:
      "Total kgCO2e impact of the travel. If this column provided, Retake will not compute emissions factors and will use this column as the carbon footprint.",
  }),
})

const CommuteByLocation = new Sheet(CommuteByLocationSheetName, {
  description: TextField({
    label: "Description",
    description:
      "Travel details. For instance, passenger name, airline name, goods transported, etc.",
  }),
  travel_type: RequiredTextField({
    label: "Travel Type",
    description: "Type of commute, e.g. Car Ride, Bus Ride.",
  }),
  origin: RequiredTextField({
    label: "Origin",
    description:
      "The origin of the commute, preferably as State, Country or a zip code.",
  }),
  destination: RequiredTextField({
    label: "Destination",
    description:
      "The destination of the commute, preferably as State, Country or a zip code.",
  }),
  quantity: NumberField({
    label: "Distance",
    description:
      "The distance of the commute. For instance, if the distance was 100 miles, distance would be 100.",
  }),
  units: TextField({
    label: "Units",
    description: "The units of distance, e.g. mile, km.",
  }),
  year: RequiredNumberField({
    label: "Year",
    description: "Year that this commute took place.",
  }),
  timesPerWeek: RequiredNumberField({
    label: "Times Per Week",
    description:
      "Number of times per week that this commute takes place. If this is a single commute, the value should be 1.",
  }),
  kgCO2e: NonEmptyNumberField({
    label: "kgCO2e",
    description:
      "Total kgCO2e impact of the travel. If this column provided, Retake will not compute emissions factors and will use this column as the carbon footprint.",
  }),
})

const CommuteByDistance = new Sheet(CommuteByDistanceSheetName, {
  description: TextField({
    label: "Description",
    description:
      "Travel details. For instance, passenger name, airline name, goods transported, etc.",
  }),
  travel_type: RequiredTextField({
    label: "Travel Type",
    description: "Type of commute, e.g. Car Ride, Bus Ride.",
  }),
  quantity: RequiredNumberField({
    label: "Distance",
    description:
      "The distance of the commute. For instance, if the distance was 10 miles, distance would be 10.",
  }),
  units: RequiredTextField({
    label: "Units",
    description: "The units of distance, e.g. mile, km.",
  }),
  year: RequiredNumberField({
    label: "Year",
    description: "Year that this commute took place.",
  }),
  timesPerWeek: RequiredNumberField({
    label: "Times Per Week",
    description:
      "Number of times per week that this commute takes place. If this is a single commute, the value should be 1.",
  }),
  kgCO2e: NonEmptyNumberField({
    label: "kgCO2e",
    description:
      "Total kgCO2e impact of the travel. If this column provided, Retake will not compute emissions factors and will use this column as the carbon footprint.",
  }),
})

const Waste = new Sheet(
  WasteSheetName,
  {
    description: RequiredTextField({
      label: "Waste Stream",
      description: "A description of the type of waste, e.g. Organics, Trash.",
    }),
    year: RequiredNumberField({
      label: "Year",
      description: "The year that this activity took place.",
    }),
    location: RequiredTextField({
      label: "Location",
      description:
        "Location of where the waste was treated, either as State, Country or Country.",
    }),
    quantity: RequiredNumberField({
      label: "Quantity",
      description:
        "Quantity of waste. For instanc,e if the waste was 15 lbs, quantity would be 15.",
    }),
    units: RequiredTextField({
      label: "Units",
      description: "Units of measurement for the quantity, e.g. lbs, kg.",
    }),
    treatment_method: TextField({
      label: "Treatment Method",
      description:
        "How the waste was treated or disposed, e.g. compost, landfill, incineration.",
    }),
    kgCO2e: NonEmptyNumberField({
      label: "kgCO2e",
      description:
        "Total kgCO2e impact of the item or activity. If this column provided, Retake will not compute emissions factors and will use this column as the carbon footprint.",
    }),
  },
  {
    allowCustomFields: true,
  }
)

export {
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
}

export {
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
}
