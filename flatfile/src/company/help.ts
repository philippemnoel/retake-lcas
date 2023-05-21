const purchases = `
## Instructions
In order for Retake to process your spreadsheet, it must be formatted in a certain way. Each row in your spreadsheet must correspond to a single item, activity, or expense. The following columns must also be present:

#### Year
The year that the item was purchased or the activity took place.

#### Description
A description of the item or activity that helps Retake AI find an emissions factor. For instance, "Macbook Pro 2017."

#### Location
Location of where the item was manufactured or where the activity occurred, formatted as "State, Country" or "Country."

#### Quantity
A single number representing quantity consumed. For instance, if 5 Macbooks were purchased, quantity would be 5.

#### Units
Units of measurement for the quantity. If 5 Macbooks were purchased, units could be "computers" or "units."
`

const mobile = `
## Instructions
In order for Retake to process your spreadsheet, it must be formatted in a certain way. Each row in your spreadsheet must correspond to a single item, activity, or expense. The following columns must also be present:

#### Year
The year that the fuel was combusted.

#### Description
A description of the fuel or activity that helps Retake AI find an emissions factor. For instance, "Kerosene Combustion."

#### Location
Location of where the combustion occurred, formatted as "State, Country" or "Country."

#### Quantity
A single number representing quantity (of fuel) consumed. For instance, if 5 gallons of fuel were consumed, quantity would be 5.

#### Units
Units of measurement for the quantity. If 5 gallons of fuel were consumed, units could be "gallons" or "US gal."
`

const refrigerants = `
## Instructions
In order for Retake to process your spreadsheet, it must be formatted in a certain way. Each row in your spreadsheet must correspond to a single item, activity, or expense. The following columns must also be present:

#### Year
The year that the refrigerant was consumed.

#### Description
A description of the refrigerant that helps Retake AI find an emissions factor. For instance, "R-410A."

#### Location
Location of where the refrigerant was consumed, formatted as "State, Country" or "Country."

#### Quantity
A single number representing quantity (of refrigerant) consumed. For instance, if 5kg of R-410A were consumed, quantity would be 5.

#### Units
Units of measurement for the quantity. If 5kg of R-410A were consumed, units could be "kg" or "kilograms."
`

const energy = `
## Instructions
In order for Retake to process your spreadsheet, it must be formatted in a certain way. Each row in your spreadsheet must correspond to a single item, activity, or expense. The following columns must also be present:

#### Year
The year that the item, activity, or expense took place.

#### Description
A description of the line item that helps Retake AI find an emissions factor. For instance, "Electricity Consumption."

#### Location
Location of the site or utility provider, formatted as "State, Country" or "Country."

#### Quantity
A single number representing quantity consumed. For instance, if 5kWh electricity was consumed, quantity would be 5.

#### Units
Units of measurement for the quantity. If 5kWh electricity were consumed, units could be "kWh."
`

const processing = `
## Instructions
In order for Retake to process your spreadsheet, it must be formatted in a certain way. Each row in your spreadsheet must correspond to a single item, activity, or expense. The following columns must also be present:

#### Year
The year that the processing took place.

#### Description
A description of the product that helps Retake AI find an emissions factor, including type, composition, and other relevant characteristics.

#### Location
Location of where the processing occurred, formatted as "State, Country" or "Country."

#### Quantity
A single number representing quantity processed. For instance, if 5kg was processed, quantity would be 5.

#### Units
Units of measurement for the quantity. If if 5kg was processed, units could be "kg" or "kilograms."
`

const sites = `
## Instructions
In order for Retake to process your spreadsheet, it must be formatted in a certain way. Each row in your spreadsheet must correspond to a single item, activity, or expense. The following columns must also be present:

#### Year
The year that the site or franchise's activities are being measured.

#### Description
Description of the activity that the site is performing that helps Retake find an emissions factor, e.g. type of fuel or transportation.

#### Location
Location of the site or franchise, formatted as "State, Country" or "Country."

#### Quantity
A single number representing quantity consumed. For instance, if 5 gallons of fuel were consumed, quantity would be 5.

#### Units
Units of measurement for the quantity. If 5 gallons of fuel were consumed, units could be "gallons" or "US gal."
`

const travelByLocation = `
## Instructions
In order for Retake to process your spreadsheet, it must be formatted in a certain way. Each row in your spreadsheet must correspond to a single item, activity, or expense. The following columns must also be present:

#### Year
The year that the site or franchise's activities are being measured.

#### Travel Type
Type of vehicle that helps Retake find an emissions factor, e.g. Small Truck or Plane."

#### Origin
Origin of the travel or transport, formatted as "State, Country" or "Country."

#### Destination
Destination of the travel or transport, formatted as "State, Country" or "Country."
`

const travelByDistance = `
## Instructions
In order for Retake to process your spreadsheet, it must be formatted in a certain way. Each row in your spreadsheet must correspond to a single item, activity, or expense. The following columns must also be present:

#### Year
The year that the travel or transportation took place.

#### Travel Type
Type of vehicle that helps Retake find an emissions factor, e.g. Small Truck or Plane."

#### Distance
The distance of travel or transportation. For instance, if the distance was 100 miles, distance would be 100.

#### Units
Units of measurement for distance. If the distance was 100 miles, units would be "miles."
`

const commuteByLocation = `
## Instructions
In order for Retake to process your spreadsheet, it must be formatted in a certain way. Each row in your spreadsheet must correspond to a single item, activity, or expense. The following columns must also be present:

#### Year
The year that the site or franchise's activities are being measured.

#### Travel Type
Type of vehicle that helps Retake find an emissions factor, e.g. Small Truck or Plane."

#### Origin
Origin of the commute, formatted as "State, Country" or as a zip code.

#### Destination
Destination of the travel or transport, formatted as "State, Country" or as a zip code.

#### Times per Week
Average number of times per week that this commute occurs.
`

const commuteByDistance = `
## Instructions
In order for Retake to process your spreadsheet, it must be formatted in a certain way. Each row in your spreadsheet must correspond to a single item, activity, or expense. The following columns must also be present:

#### Year
The year that the site or franchise's activities are being measured.

#### Travel Type
Type of vehicle that helps Retake find an emissions factor, e.g. Small Truck or Plane."

#### Distance
The distance of the commute. For instance, if the distance was 100 miles, distance would be 100.

#### Units
Units of measurement for distance. If the distance was 100 miles, units could be "miles."

#### Times per Week
Average number of times per week that this commute occurs.
`

const waste = `
## Instructions
In order for Retake to process your spreadsheet, it must be formatted in a certain way. Each row in your spreadsheet must correspond to a single item, activity, or expense. The following columns must also be present:

#### Year
The year that the waste was treated.

#### Waste Stream
A description of the waste that helps Retake AI find an emissions factor. For instance, "Organic Waste."

#### Location
Location of where the waste was treated, formatted as "State, Country" or "Country."

#### Quantity
A single number representing quantity of waste. For instance, if 5kg of waste was treated, quantity would be 5.

#### Units
Units of measurement for the quantity. For instance, if 5kg of waste was treated, units could be "kg" or "kilograms."
`

export {
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
}
