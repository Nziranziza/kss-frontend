export interface LocationWithNames {
  _id: string
  prov_id: ProvId
  dist_id: DistId
  sect_id: SectId
  cell_id: CellId
  village_id: VillageId
}

interface ProvId {
  _id: string
  namek: string
}

interface DistId {
  _id: string
  name: string
}

interface SectId {
  _id: string
  name: string
}

interface CellId {
  _id: string
  name: string
}

interface VillageId {
  _id: string
  name: string
}
