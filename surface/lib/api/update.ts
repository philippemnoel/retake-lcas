import { post } from "."
import { LCACompletionSchema } from "./schemas"
import { CMLTotalResultsData } from "lib/types/supabase-row.types"

const updateLCA = (values: Partial<CMLTotalResultsData>) => {
  try {
    const parsed = LCACompletionSchema.parse(values)
    return Promise.all([
      post(
        `/api/supabase/${parsed.org_id}/update/cml_total_results?lca_id=${parsed.lca_id}`,
        parsed
      ),
      post(
        `/api/supabase/${parsed.org_id}/update/ef_total_results?lca_id=${parsed.lca_id}`,
        parsed
      ),
      post(
        `/api/supabase/${parsed.org_id}/update/rmh_total_results?lca_id=${parsed.lca_id}`,
        parsed
      ),
    ])
  } catch (err) {
    return Promise.reject(err)
  }
}

export { updateLCA }
