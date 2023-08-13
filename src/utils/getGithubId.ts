import { RequestError } from "@octokit/request-error"
import { octokit } from "./githubAPIClient"

export async function getUserIdFromUserName(username: string): Promise<number | RequestError> {
    try {
      const response = await octokit.request('GET /users/{username}', { username: username })
      return response.data.id as number
    } catch (e) {
      console.warn(`[WARN] ${e}`)
      const error = e as RequestError
      return error
    }
  }
