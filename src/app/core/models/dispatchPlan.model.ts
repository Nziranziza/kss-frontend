export interface DispatchPlan {
  _id: string
  inputId: string,
  qty: number,
  cws: Array<CWS>
}

export interface CWS {
  _id: string,
  org_id: string,
  qty: number,
  name: string
}
