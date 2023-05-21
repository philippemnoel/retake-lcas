import { isDevelopment } from "lib/utils"

enum templateIds {
  supplierEngagement = isDevelopment ? 31571854 : 31649693,
}

const templates = [
  {
    templateId: templateIds.supplierEngagement,
    model: {
      product_url: "https://retake.earth",
      product_name: "Retake",
      company_name: "Retake, Inc.",
      company_address: "36 East 20th, Floor 8, New York, NY 10003",
    },
  },
]

export { templateIds, templates }
