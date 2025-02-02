import { Transform } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsPositive } from 'class-validator';

export class QueryParamsDto {
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsInt()
  @IsPositive()
  take: number = 30;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsInt()
  @IsPositive()
  page: number = 1;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsInt()
  @IsPositive()
  @IsOptional()
  age: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsInt()
  @IsOptional()
  @IsPositive()
  ageFrom: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsInt()
  @IsOptional()
  @IsPositive()
  ageTo: number;
}
