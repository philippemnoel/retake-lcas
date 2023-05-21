import axios from "axios"
import { Configuration, OpenAIApi } from "openai"
import promiseRetry from "promise-retry"

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_TOKEN,
})
const openai = new OpenAIApi(configuration)

async function createEmbedding(data: string): Promise<number[] | undefined> {
  try {
    const operation = {
      retries: 10,
      factor: 3,
      minTimeout: 1 * 1000,
      maxTimeout: 60 * 1000,
      randomize: true,
    }

    let embedding: number[] | undefined
    await promiseRetry(async (retry, currentAttempt: number) => {
      console.log(
        `Querying ChatGPT for an embedding ${data}: attempt ${currentAttempt}`
      )
      try {
        const completionResponse = await openai.createEmbedding(
          {
            model: "text-embedding-ada-002",
            input: data,
          },
          {
            timeout: 0,
            maxContentLength: Number.POSITIVE_INFINITY,
            maxBodyLength: Number.POSITIVE_INFINITY,
          }
        )
        embedding = completionResponse.data.data[0].embedding
      } catch (error) {
        console.log(`Failed on attempt ${currentAttempt}`)
        if (axios.isAxiosError(error)) {
          if (error.response) {
            console.warn(error.response.status)
          } else {
            console.warn(error.message)
          }
        } else {
          console.warn(error)
        }

        retry(error)
      }
    }, operation)

    return embedding
  } catch (error) {
    console.error(error)
    return undefined
  }
}

export { createEmbedding }
