import { ApiPropertyOptional } from "@nestjs/swagger";
import { Column } from "typeorm";

export class ProfileDto {
    
      @ApiPropertyOptional()
      nick_name: string;
      @ApiPropertyOptional({ nullable: true })
      bio: string;
      @ApiPropertyOptional({ nullable: true })
      gender: string;
      @ApiPropertyOptional({ nullable: true })
      bg_image: string;
      @ApiPropertyOptional({ nullable: true })
      profile_image: string;
      @ApiPropertyOptional({ nullable: true })
      birthday: Date;
      @ApiPropertyOptional({ nullable: true })
      instagram: string;
      
    }
    
