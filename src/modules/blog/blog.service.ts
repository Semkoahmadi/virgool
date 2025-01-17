import { BadRequestException, Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogEntity } from './entities/blog.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateBlogDto, FilterBlogDto, UpdateBlogDto } from './dto/blog.dto';
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
import { EntityName } from 'src/common/enums/entity.enum';
import { BlogLikesEntity } from './entities/like.entity';

@Injectable({ scope: Scope.REQUEST })
export class BlogService {
  constructor(
    @InjectRepository(BlogEntity) private blogRepository: Repository<BlogEntity>,
    @InjectRepository(BlogLikesEntity) private blogLikeRepository: Repository<BlogLikesEntity>,
    @InjectRepository(BlogCategoryEntity) private blogCategoryRepository: Repository<BlogCategoryEntity>,
    @Inject(REQUEST) private request: Request, private categoryService: CategoryService,

  ) { }
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
    return blog;
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

  async blogList(paginationDto: PaginationDto, filterDto: FilterBlogDto) {
    const { page, limit, skip } = paginationSolver(paginationDto);
    let { category, search } = filterDto;
    let where = '';
    if (category) {
      category = category.toLowerCase();
      if (where.length > 0) where += " AND ";
      where += "category.title = LOWER(:category)"
    }
    if (search) {
      if (where.length > 0) where += " AND ";
      search = `%${search}%`
      where += "CONCAT(blog.title,blog.description,blog.contetnt,contetnt) ILIKE :search"
    }
    const [blogs, count] = await this.blogRepository.createQueryBuilder(EntityName.Blog)
      .leftJoin("blog.categories", "categories")
      .leftJoin("categories.category", "category")
      .addSelect(["categories.id", "category.title"])
      .where(where, { category, search })
      .orderBy("blog.id", "DESC")
      .skip(skip)
      .take(limit)
      .getManyAndCount()


    return {
      pagination: paginationGenerator(count, page, limit),
      blogs
    };
  }
  async checkExistBlogById(id: number) {
    const blog = await this.blogRepository.findOneBy({ id })
    if (!blog) throw new BadRequestException("موجود نیست!!")
    return blog
  }
  async delete(id: number) {
    await this.checkExistBlogById(id);
    await this.blogRepository.delete({ id })
    return { message: "Success Dleelted!" }
  }
  async update(id: number, blogDto: UpdateBlogDto) {
    const user = this.request.user;
    let { title, slug, description, contetnt, image, time_for_read, categories, } = blogDto;
    const blog = await this.checkExistBlogById(id)
    if (!isArray(categories) && typeof categories === "string") {
      categories = categories.split(",")

    } else if (!isArray(categories)) {
      throw new BadRequestException("what is this?")
    }
    let slugData = null;
    if (title) {
      slugData = title, blog.title = title
    }
    if (slug) slugData = slug
    if (slugData) {
      slug = createSlug(slugData);
      const isExist = await this.checkBlogBySlog(slug);
      if (isExist && isExist.id !== id) {
        slug += `-${randomId()}`
      }
      blog.slug = slug
    }
    if (description) blog.description = description
    if (contetnt) blog.contetnt = contetnt
    if (image) blog.image = image
    if (time_for_read) blog.time_for_read = time_for_read
    if (description) blog.description = description;
    await this.blogRepository.save(blog);
    if (categories && isArray(categories) && categories.length > 0) {
      await this
        .blogCategoryRepository.delete({ blogId: blog.id })
    }
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
    return { message: 'با موفقیت بروز شد گووات' };
  }

  async likeToggle(blogId: number) {
    const { id: userId } = this.request.user;
    const blog = await this.checkExistBlogById(blogId);
    const isLiked = await this.blogLikeRepository.findOneBy({ userId: blogId })
    let meesage = "Liked!";
    if (isLiked) {
      await this.blogLikeRepository.delete({ id: isLiked.id });
      meesage = "NotLieke"
    } else {
      await this.blogLikeRepository.insert({ blogId, userId })
    }

  }

}


// const [blogs, count] = await this.blogRepository.findAndCount({
//       category: true
//     }
//   },
//   where,
//   select: {
//     categories: {
//       id: true,
//        category: {
//         title: true,

//       }
//     }
//   },
//   order: { id: 'DESC' },
//   skip,
//   take: limit,
// });