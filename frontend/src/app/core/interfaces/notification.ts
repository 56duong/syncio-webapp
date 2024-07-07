export interface Notification {
  targetId?: string;
  actionPerformedId?: string;
  actorId?: string;
  actionType?: ActionEnum;
  redirectURL ?: string;
  createdDate ?: string;
  state ?: StateEnum;
  recipientId ?: string;
  actorCount ?: number;
  imageURL ?: string;
  previewText ?: string;
}

export enum ActionEnum {
  LIKE_POST = 'LIKE_POST',
  COMMENT_POST = 'COMMENT_POST',
  COMMENT_REPLY = 'COMMENT_REPLY',
  FOLLOW = 'FOLLOW',
}

export enum StateEnum {
  UNSEEN = 'UNSEEN',
  SEEN_BUT_UNREAD = 'SEEN_BUT_UNREAD',
  SEEN_AND_READ = 'SEEN_AND_READ',
}
