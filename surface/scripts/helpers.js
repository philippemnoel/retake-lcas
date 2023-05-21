const fs = require("fs")

const getEnv = (env) => {
  const filteredLines = fs
    .readFileSync(".env.local", "utf-8")
    .split("\n")
    .filter((line) => !line.startsWith("#"))

  let token
  for (const line of filteredLines) {
    if (line.startsWith(`${env}=`)) {
      token = line.split("=")[1].trim()
      break
    }
  }
  return token
}

module.exports = {
  getEnv,
}
