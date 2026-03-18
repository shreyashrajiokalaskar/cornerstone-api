import { IsString, IsUUID } from "class-validator";

export class CreateChatDto {

    @IsString()
    question: string;

    @IsUUID()
    workspaceId: string;
}
