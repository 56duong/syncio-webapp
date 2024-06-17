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
}
