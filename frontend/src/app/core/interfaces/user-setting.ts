export interface UserSetting {
  id?: string;
  findableByImageUrl?: string;
  whoCanAddYouToGroupChat?: WhoCanAddYouToGroupChat;
  whoCanSendYouNewMessage?: WhoCanSendYouNewMessage;
  userId?: string;
}

export enum WhoCanAddYouToGroupChat {
  EVERYONE = 'EVERYONE',
  ONLY_PEOPLE_YOU_FOLLOW = 'ONLY_PEOPLE_YOU_FOLLOW',
  NO_ONE = 'NO_ONE',
}

export enum WhoCanSendYouNewMessage {
  EVERYONE = 'EVERYONE',
  ONLY_PEOPLE_YOU_FOLLOW = 'ONLY_PEOPLE_YOU_FOLLOW',
  NO_ONE = 'NO_ONE',
}