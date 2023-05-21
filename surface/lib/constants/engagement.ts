enum Engagement {
  DataReceived = "data_received",
  AwaitingResponse = "awaiting_response",
  NotEngaged = "not_engaged",
}

const engagementStatus = [
  {
    name: "Data Received",
    value: Engagement.DataReceived,
  },
  {
    name: "Awaiting Response",
    value: Engagement.AwaitingResponse,
  },
  {
    name: "Not Engaged",
    value: Engagement.NotEngaged,
  },
]

export { Engagement, engagementStatus }
