import { post } from "."
import { templateIds } from "lib/constants/postmark"
import { SlackEPDDataSchema, SupplierEngagementDataSchema } from "./schemas"
import { Methodology } from "lib/calculator/methodologies"

const fromEmail = "support@retake.earth"

const engageSupplier = (
  contact: string | undefined,
  organizationName: string | null | undefined,
  supplierId: string | undefined
) => {
  try {
    const parsed = SupplierEngagementDataSchema.parse({
      contact,
      organizationName,
      supplierId,
    })

    return post(`/api/notifications/email`, {
      fromEmail,
      toEmail: parsed.contact,
      organizationName: parsed.organizationName,
      actionUrl: `${process.env.BASE_URL}/portals/tasks?supplierId=${supplierId}&recipientEmail=${parsed.contact}`,
      templateId: templateIds.supplierEngagement,
    })
  } catch (err) {
    return Promise.reject(err)
  }
}

const sendEPDNotificationToSlack = (
  orgId: string | null | undefined,
  userId: string | null | undefined,
  lcaId: string | null | undefined,
  message: string | null | undefined
) => {
  try {
    const parsed = SlackEPDDataSchema.parse({
      orgId,
      userId,
      lcaId,
      message,
    })

    const text = `User ${parsed.userId} from ${
      parsed.orgId
    } requested an EPD for ${
      parsed.lcaId
    }. The following message was provided: ${
      parsed.message ?? "No message provided"
    }`

    return post(`/api/notifications/slack`, {
      orgId,
      text,
      lcaId,
    })
  } catch (err) {
    return Promise.reject(err)
  }
}

const assignEmissionsFactor = (retakePartIds: Array<string | undefined>) => {
  return post(
    `/api/emissions-factors`,
    {
      part_ids: retakePartIds,
    },
    {
      "x-api-key": process.env.EMISSIONS_WEBHOOK_API_KEY,
    }
  )
}

const updateLCAResults = (
  lcaId: string | null | undefined,
  orgId: string | null | undefined
) => {
  return post(`/api/supabase/${orgId}/results/total`, {
    lca_id: lcaId,
  })
}

const materialCompositionImpacts = (
  lcaId: string | null | undefined,
  orgId: string | null | undefined,
  methodology = Methodology.CML
) =>
  post(`/api/supabase/${orgId}/results/materials`, {
    lca_id: lcaId,
    methodology,
  })

export {
  engageSupplier,
  sendEPDNotificationToSlack,
  assignEmissionsFactor,
  updateLCAResults,
  materialCompositionImpacts,
}
