import { Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogEntity } from './entities/blog.entity';
import { Repository } from 'typeorm';
import { CreateBlogDto } from './dto/blog.dto';
import { createSlug, randomId } from 'src/common/utils/function.util';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { BlogStatus } from './enum/enum.status';

@Injectable({ scope: Scope.REQUEST })
export class BlogService {
  constructor(
    @InjectRepository(BlogEntity)
    private blogRepository: Repository<BlogEntity>,
    @Inject(REQUEST) private request: Request
  ) {}
  async create(blogDto: CreateBlogDto) {
    const user = this.request.user;
    let { title, slug, description, contetnt, image, time_for_read } = blogDto;
    let slugData = slug ?? title;
    slug = createSlug(slugData);
    const isExist = await this.checkBlogBySlog(slug);
    if (isExist) {
      slug += `-${randomId()}`;
    }
    const blog = this.blogRepository.create({
      title,
      slug,
      description,
      contetnt,
      status: BlogStatus.Draft,
      image,
      time_for_read,
      authorId: user.id,
    });
    await this.blogRepository.save(blog);
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
}
