import { IsBoolean } from 'class-validator';

export class ToggleAutoReplyDto {
  @IsBoolean()
  enabled: boolean;
}
