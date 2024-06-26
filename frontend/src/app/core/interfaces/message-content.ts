import { User } from "./user";

export interface MessageContent {
  id?: string;
  messageRoomId?: string;
  user?: User;
  message?: string;
  dateSent?: string;
}
