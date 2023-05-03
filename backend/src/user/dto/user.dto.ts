import { IsNotEmpty, IsNumber, IsString, MaxLength } from "class-validator";

export class UserDto {
    @IsNumber()
    @IsNotEmpty()
    id: number;

    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(65_535)
    avatar: string;
    hash: string;
}