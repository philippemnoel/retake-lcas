const { execSync } = require("child_process")

// We need to maintain our own fork of @tremor/react because
// @tremor/react is now on v2 and we are on v1. We tried to switch
// to v2 but it was breaking the app. So we are maintaining our own fork,
// which contains enhancements to some v1 components.
const cwd = `${process.cwd()}/node_modules/@tremor/react`
execSync(`yarn && yarn run rollup`, {
  stdio: "inherit",
  cwd,
})
