export interface UserFollow {
  targetId?: string;
  actorId?: string;
  createdDate?: string;
  targetUsername?: string;
  actorUsername?: string;
  following?: boolean;
}
