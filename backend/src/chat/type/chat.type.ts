export type updateChat = {
    channelId: number;
    dm : boolean;
    email : string | null;
    isPassword : boolean;
    Password : string;
    targetId : number;
    Private : boolean;
    newPassword : string;
}

export type Tag = {
    id :  number;
    name : string;
}