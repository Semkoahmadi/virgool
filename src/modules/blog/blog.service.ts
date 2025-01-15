import { BadRequestException, Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogEntity } from './entities/blog.entity';
import { Repository } from 'typeorm';
import { CreateBlogDto } from './dto/blog.dto';
import { createSlug, randomId } from 'src/common/utils/function.util';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { BlogStatus } from './enum/enum.status';
import { PaginationDto } from 'src/common/dtos/pagination..dto';
import {
  paginationGenerator,
  paginationSolver,
} from 'src/common/utils/pagination.util';
import { CategoryService } from '../category/category.service';
import { isArray } from 'class-validator';
import { BlogCategoryEntity } from './entities/blog-category.entity';

@Injectable({ scope: Scope.REQUEST })
export class BlogService {
  constructor(
    @InjectRepository(BlogEntity)
    private blogRepository: Repository<BlogEntity>,
    @InjectRepository(BlogCategoryEntity)
    private blogCategoryRepository: Repository<BlogCategoryEntity>,
    @Inject(REQUEST) private request: Request,
    private categoryService: CategoryService
  ) {}
  async create(blogDto: CreateBlogDto) {
    const user = this.request.user;
    let {
      title,
      slug,
      description,
      contetnt,
      image,
      time_for_read,
      categories,
    } = blogDto;
    if (!isArray(categories) && typeof categories === 'string') {
      categories = categories.split(',');
    } else if (isArray(categories)) {
      throw new BadRequestException('Sory For Error');
    }
    let slugData = slug ?? title;
    slug = createSlug(slugData);
    const isExist = await this.checkBlogBySlog(slug);
    if (isExist) {
      slug += `-${randomId()}`;
    }
    let blog = this.blogRepository.create({
      title,
      slug,
      description,
      contetnt,
      status: BlogStatus.Draft,
      image,
      time_for_read,
      authorId: user.id,
    });
    blog = await this.blogRepository.save(blog);
    for (const categoryTitle of categories) {
      let category = await this.categoryService.findOneByTitle(categoryTitle);
      if (!category) {
        category = await this.categoryService.inserByTitle(categoryTitle);
      }
      await this.blogCategoryRepository.insert({
        blogId: blog.id,
        categoryId: category.id,
      });
    }
    return { message: 'با موفقیت ایجاد شد گووات' };
  }
  async checkBlogBySlog(slug: string) {
    const blog = await this.blogRepository.findOneBy({ slug });
    return !!blog;
  }
  async myBlog() {
    const { id } = this.request.user;
    return await this.blogRepository.find({
      where: {
        authorId: id,
      },
      order: { id: 'DESC' },
    });
  }

  async blogList(paginationDto: PaginationDto) {
    const { page, limit, skip } = paginationSolver(paginationDto);
    const [blogs, count] = await this.blogRepository.findAndCount({
      where: {},
      order: { id: 'DESC' },
      skip,
      take: limit,
    });
    return {
      pagination: paginationGenerator(count, page, limit),
      blogs,
    };
  }
}
