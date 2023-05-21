// [...auth0].ts

/**
 * Register auth handlers.
 */

import { handleAuth, handleLogin } from "@auth0/nextjs-auth0"

export default handleAuth({
  async login(req, res) {
    try {
      await handleLogin(req, res, {
        authorizationParams: {
          invitation: Array.isArray(req.query.invitation)
            ? req.query.invitation[0]
            : req.query.invitation,
          prompt: "select_account",
          organization: Array.isArray(req.query.organization)
            ? req.query.organization[0]
            : req.query.organization,
        },
      })
    } catch (err) {
      res.status(500).end(err)
    }
  },
})
