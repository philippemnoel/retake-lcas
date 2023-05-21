// Loading
const GENERIC_LOADING = {
  title: "Saving changes",
  description: `Please allow a few seconds while Retake saves your changes`,
  type: "loading",
  disappear: false,
}

const SUPPLIER_ENGAGEMENT_LOADING = {
  title: "Please Wait",
  description: `Retake is sending requests to the suppliers you specified`,
  type: "loading",
  disappear: false,
}

const REPORT_LOADING = {
  title: "Please Wait",
  description: `Retake is generating your report. This may take a few seconds.`,
  type: "loading",
  disappear: false,
}

const EPD_REQUEST_LOADING = {
  title: "Please Wait",
  description: `Sending your EPD request.`,
  type: "loading",
  disappear: false,
}

// Success
const GENERIC_SUCCESS = {
  title: "Success",
  description: "Your changes were saved successfully",
  type: "success",
}

const SUPPLIER_ENGAGEMENT_SUCCESS = {
  title: "Success",
  description:
    "When your suppliers provide carbon footprint data, you will receive a notification and your dashboard will be automatically updated",
  type: "success",
}

const REPORT_SUCCESS = {
  title: "Success",
  description: "Your report was generated successfully",
  type: "success",
}

const EPD_REQUEST_SUCCESS = {
  title: "Success",
  description:
    "Retake has received your EPD request. You will receive an email within 24 hours when your EPD is ready.",
  type: "success",
  disappear: false,
}

// Error
const GENERIC_ERROR = {
  title: "An unexpected error occurred",
  description: `We deeply apologize for our mistake - please let our support team know and we will fix it`,
  type: "warning",
}

export {
  GENERIC_LOADING,
  GENERIC_SUCCESS,
  GENERIC_ERROR,
  SUPPLIER_ENGAGEMENT_LOADING,
  SUPPLIER_ENGAGEMENT_SUCCESS,
  REPORT_LOADING,
  REPORT_SUCCESS,
  EPD_REQUEST_LOADING,
  EPD_REQUEST_SUCCESS,
}
