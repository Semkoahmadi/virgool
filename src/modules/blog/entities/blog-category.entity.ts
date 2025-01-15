import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { Column, Entity, ManyToMany } from "typeorm";
import { BlogEntity } from "./blog.entity";
import { CategoryEntity } from "src/modules/category/entities/category.entity";

@Entity(EntityName.BlogCategory)
    export class BlogCategoryEntity extends BaseEntity {
        @Column()
        blogId: number;
        @Column()
        categoryId: number;
        @ManyToMany(() => BlogEntity,blog=>blog.categories,{onDelete:"CASCADE"})
        blog:BlogEntity;
        @ManyToMany(() => CategoryEntity,category=>category.blog_categories,{onDelete:"CASCADE"})
        category:CategoryEntity;
    }