import { User } from "./user";

export interface MessageContent {
  id?: string;
  messageRoomId?: string;
  user?: User;
  message?: string;
  dateSent?: string;
  replyTo?: MessageContent;
  type?: MessageContentTypeEnum;
}

export enum MessageContentTypeEnum {
  TEXT = 'TEXT',
  STICKER = 'STICKER',
  IMAGE = 'IMAGE',
  NOTIFICATION_CREATE_ROOM = 'NOTIFICATION_CREATE_ROOM',
  NOTIFICATION_ADD_MEMBER = 'NOTIFICATION_ADD_MEMBER',
  NOTIFICATION_REMOVE_MEMBER = 'NOTIFICATION_REMOVE_MEMBER',
  NOTIFICATION_LEAVE_ROOM = 'NOTIFICATION_LEAVE_ROOM',
  NOTIFICATION_CHANGE_NAME = 'NOTIFICATION_CHANGE_NAME',
  NOTIFICATION_MAKE_ADMIN = 'NOTIFICATION_MAKE_ADMIN',
  NOTIFICATION_REMOVE_ADMIN = 'NOTIFICATION_REMOVE_ADMIN',
}
