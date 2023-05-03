import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class Auth42Dto {
    // @IsNumber()
    // @IsNotEmpty()
    id: number;

    // @IsString()
    // @IsNotEmpty()
    email: string;

    // @IsString()
    // @IsNotEmpty()
    username: string;

    // @IsString()
    // @IsNotEmpty()
    avatar: string;
}