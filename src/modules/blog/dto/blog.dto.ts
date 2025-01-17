import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString, Length } from 'class-validator';

export class CreateBlogDto {
  @ApiProperty()
  @IsNotEmpty()
  @Length(5, 75)
  title: string;
  @ApiProperty()
  @IsNotEmpty()
  @Length(10, 110)
  description: string;
  @ApiProperty()
  @IsNotEmpty()
  @Length(5, 300)
  contetnt: string;
  @ApiPropertyOptional()
  slug: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  time_for_read: string;
  @ApiPropertyOptional({ format: 'binary' })
  image: string;
  @ApiProperty({type:String,isArray:true})
  categories:string[] | string
}
export class UpdateBlogDto extends PartialType (CreateBlogDto) {}

export class FilterBlogDto {
  category: string;
  search: string;
}
