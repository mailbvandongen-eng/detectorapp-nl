/**
 * Google Fit API Service
 * Fetches step count data from Google Fit
 */

const GOOGLE_FIT_API = 'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate'

interface StepData {
  steps: number
  startTime: Date
  endTime: Date
}

interface GoogleFitResponse {
  bucket: Array<{
    startTimeMillis: string
    endTimeMillis: string
    dataset: Array<{
      point: Array<{
        value: Array<{
          intVal?: number
          fpVal?: number
        }>
      }>
    }>
  }>
}

/**
 * Get step count for today from Google Fit
 */
export async function getTodaySteps(accessToken: string): Promise<number> {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  return getStepsForPeriod(accessToken, startOfDay, now)
}

/**
 * Get step count for a specific period from Google Fit
 */
export async function getStepsForPeriod(
  accessToken: string,
  startTime: Date,
  endTime: Date
): Promise<number> {
  const requestBody = {
    aggregateBy: [{
      dataTypeName: 'com.google.step_count.delta',
      dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps'
    }],
    bucketByTime: { durationMillis: endTime.getTime() - startTime.getTime() },
    startTimeMillis: startTime.getTime(),
    endTimeMillis: endTime.getTime()
  }

  try {
    const response = await fetch(GOOGLE_FIT_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      if (response.status === 401) {
        console.warn('🏃 Google Fit: Token verlopen, opnieuw inloggen vereist')
        throw new Error('TOKEN_EXPIRED')
      }
      if (response.status === 403) {
        console.warn('🏃 Google Fit: Geen toegang - Fitness API mogelijk niet ingeschakeld')
        throw new Error('FITNESS_API_DISABLED')
      }
      throw new Error(`Google Fit API error: ${response.status}`)
    }

    const data: GoogleFitResponse = await response.json()

    // Sum up all steps from all buckets
    let totalSteps = 0
    for (const bucket of data.bucket || []) {
      for (const dataset of bucket.dataset || []) {
        for (const point of dataset.point || []) {
          for (const value of point.value || []) {
            totalSteps += value.intVal || 0
          }
        }
      }
    }

    console.log(`🏃 Google Fit: ${totalSteps} stappen vandaag`)
    return totalSteps
  } catch (error: any) {
    if (error.message === 'TOKEN_EXPIRED' || error.message === 'FITNESS_API_DISABLED') {
      throw error
    }
    console.error('🏃 Google Fit fout:', error)
    throw error
  }
}

/**
 * Get step history for multiple days
 */
export async function getStepHistory(
  accessToken: string,
  days: number = 7
): Promise<StepData[]> {
  const now = new Date()
  const results: StepData[] = []

  for (let i = 0; i < days; i++) {
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i, 23, 59, 59)
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i, 0, 0, 0)

    try {
      const steps = await getStepsForPeriod(accessToken, startOfDay, endOfDay)
      results.push({
        steps,
        startTime: startOfDay,
        endTime: endOfDay
      })
    } catch (error) {
      // Skip days with errors
      console.warn(`Kon stappen voor ${startOfDay.toDateString()} niet ophalen`)
    }
  }

  return results
}

/**
 * Check if Google Fit access is available
 */
export function hasGoogleFitAccess(accessToken: string | null): boolean {
  return !!accessToken
}
