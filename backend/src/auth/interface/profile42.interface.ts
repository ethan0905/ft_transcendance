//used to extract the profile from the 42 API

export interface Profile42 {
    id: number;
    email: string;
    username: string;
    avatar: string;
    access_token: string;
    refresh_token: string;
}