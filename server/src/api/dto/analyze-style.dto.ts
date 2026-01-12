import { IsOptional, IsString } from 'class-validator';

export class AnalyzeStyleDto {
  @IsOptional()
  @IsString()
  userId?: string;
}
