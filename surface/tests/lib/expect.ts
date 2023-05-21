import { GetLcaResultsResponses, PostLcaResponses } from "./request"

export const expectPostLcaResponses = async (responses: PostLcaResponses) => {
  responses.parts.forEach((res: any) => expect(res.part.statusCode).toBe(200))
  responses.materials.forEach((res: any) =>
    expect(res.material.statusCode).toBe(200)
  )
  responses.transportation.forEach((res: any) =>
    expect(res.transport.statusCode).toBe(200)
  )
  responses.manufacturing.forEach((res: any) => {
    expect(res.facility.statusCode).toBe(200)
    expect(res.purchased_energy.statusCode).toBe(200)
    expect(res.stationary_fuel.statusCode).toBe(200)
    expect(res.facility_allocation.statusCode).toBe(200)
  })
  responses.use.forEach((res: any) => {
    expect(res.service_life.statusCode).toBe(200)
    expect(res.use_phase.statusCode).toBe(200)
  })
  responses.end_of_life.forEach((res: any) =>
    expect(res.end_of_life.statusCode).toBe(200)
  )
  return responses
}

export const expectGetLcaResultsResponses = async (
  responses: GetLcaResultsResponses
) => {
  expect(responses.materials.length).toBeGreaterThan(0)
  expect(responses.transportations.length).toBeGreaterThan(0)
  expect(responses.facilities.length).toBeGreaterThan(0)
  expect(responses.uses.length).toBeGreaterThan(0)
  expect(responses.disposals.length).toBeGreaterThan(0)
}

// export const expectLcaSumTable = (expected: LcaSumTable, actual: LcaSumTable) => {
//   const phase_names = Object.keys(expected)
//   phase_names.forEach((phase_name) => {
//     const column_names = Object.keys(expected[phase_name])
//     expect(colu)
//   })
// }

// export const expectLcaMatch = async (responses: GetLcaResultsResponses, expected: GetLcaResultsResponses) => {
//     expectGetLcaResultsResponses(responses)
//     expect(expected).toMatchObject(responses)
// }
