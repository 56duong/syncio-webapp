export interface Label {
  id?: string;
  name?: string;
  price?: number;
  description?: string;
  labelURL?: string;
  createdDate?: string;
  createdBy?: string;
  status?: StatusEnum;
}

export enum StatusEnum {
  ENABLED = 'ENABLED',
  DISABLED = 'DISABLED',
}