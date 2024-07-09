import { MessageRoomMember } from "./message-room-member";

export interface MessageRoom {
  id?: string;
  name?: string;
  createdDate?: string;
  group?: boolean;
  createdBy?: string;
  members?: MessageRoomMember[];
}
