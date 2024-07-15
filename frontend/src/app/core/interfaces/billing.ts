export interface Billing {
    labelId?: string;
    buyerId?: string;
    ownerId?: number;
    orderNo?: string;
    amount?: string;
    createdDate?: string;
    status?: StatusEnum;
  }
  
  export enum StatusEnum {
    PROCESSING = 'PROCESSING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED'
  }