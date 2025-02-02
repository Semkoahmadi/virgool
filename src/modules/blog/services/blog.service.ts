import {BadRequestException,Inject,Injectable,NotFoundException,Scope} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogEntity } from '../entities/blog.entity';
import {DataSource, Repository } from 'typeorm';
import { CreateBlogDto, FilterBlogDto, UpdateBlogDto } from '../dto/blog.dto';
import { createSlug, randomId } from 'src/common/utils/function.util';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { BlogStatus } from '../enum/enum.status';
import { PaginationDto } from 'src/common/dtos/pagination..dto';
import {
  paginationGenerator,
  paginationSolver,
} from 'src/common/utils/pagination.util';
import { CategoryService } from '../../category/category.service';
import { isArray } from 'class-validator';
import { BlogCategoryEntity } from '../entities/blog-category.entity';
import { EntityName } from 'src/common/enums/entity.enum';
import { BlogLikesEntity } from '../entities/like.entity';
import { BlogBookmarkEntity } from '../entities/bookmark.entity';
import { NotFoundMessage, PublicMessage } from 'src/common/enums/message.enum';
import { BlogCommentService } from './comment.service';

@Injectable({ scope: Scope.REQUEST })
export class BlogService {
  constructor(
    @InjectRepository(BlogEntity)
    private blogRepository: Repository<BlogEntity>,
    @InjectRepository(BlogCategoryEntity)
    private blogCategoryRepository: Repository<BlogCategoryEntity>,
    @InjectRepository(BlogLikesEntity)
    private blogLikeRepository: Repository<BlogLikesEntity>,
    @InjectRepository(BlogBookmarkEntity)
    private blogBookmarkRepository: Repository<BlogBookmarkEntity>,
    @Inject(REQUEST) private request: Request,
    private categoryService: CategoryService,
    private blogCommentService: BlogCommentService,
    private dataSource: DataSource
  ) {}
  async create(blogDto: CreateBlogDto) {
    const user = this.request.user;
    let {title,slug,description,contetnt,image,time_for_read,categories} = blogDto;
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
      if (where.length > 0) where += ' AND ';
      where += 'category.title = LOWER(:category)';
    }
    if (search) {
      if (where.length > 0) where += ' AND ';
      search = `%${search}%`;
      where +=
        'CONCAT(blog.title,blog.description,blog.contetnt,contetnt) ILIKE :search';
    }
    const [blogs, count] = await this.blogRepository
      .createQueryBuilder(EntityName.Blog)
      .leftJoin('blog.categories', 'categories')
      .leftJoin('categories.category', 'category')
      .leftJoin('blog.author', 'author')
      .leftJoin('author.profile', 'profile')
      .addSelect([
        'categories.id',
        'category.title',
        'author.username',
        'author.id',
        'profile.nick_name',
      ])
      .where(where, { category, search })
      .loadRelationCountAndMap('blog.likes', 'blog.likes')
      .loadRelationCountAndMap('blog.bookmarks', 'blog.bookmarks')
      .loadRelationCountAndMap(
        'blog.comments',
        'blog.comments',
        'comments',
        (qb) => qb.where('comments.accepted =:accepted', { accepted: true })
      )
      .orderBy('blog.id', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      pagination: paginationGenerator(count, page, limit),
      blogs,
    };
  }
  async checkExistBlogById(id: number) {
    const blog = await this.blogRepository.findOneBy({ id });
    if (!blog) throw new BadRequestException(NotFoundMessage.NotFoundPost);
    return blog;
  }
  async delete(id: number) {
    await this.checkExistBlogById(id);
    await this.blogRepository.delete({ id });
    return { message: PublicMessage.Deleted };
  }
  async update(id: number, blogDto: UpdateBlogDto) {
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
    const blog = await this.checkExistBlogById(id);
    if (!isArray(categories) && typeof categories === 'string') {
      categories = categories.split(',');
    } else if (!isArray(categories)) {
      throw new BadRequestException('what is this?');
    }
    let slugData = null;
    if (title) {
      (slugData = title), (blog.title = title);
    }
    if (slug) slugData = slug;
    if (slugData) {
      slug = createSlug(slugData);
      const isExist = await this.checkBlogBySlog(slug);
      if (isExist && isExist.id !== id) {
        slug += `-${randomId()}`;
      }
      blog.slug = slug;
    }
    if (description) blog.description = description;
    if (contetnt) blog.contetnt = contetnt;
    if (image) blog.image = image;
    if (time_for_read) blog.time_for_read = time_for_read;
    if (description) blog.description = description;
    await this.blogRepository.save(blog);
    if (categories && isArray(categories) && categories.length > 0) {
      await this.blogCategoryRepository.delete({ blogId: blog.id });
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
    return { message: PublicMessage.Updated };
  }

  async likeToggle(blogId: number) {
    const { id: userId } = this.request.user;
    const blog = await this.checkExistBlogById(blogId);
    const isLiked = await this.blogLikeRepository.findOneBy({ userId, blogId });
    let message = PublicMessage.Like;
    if (isLiked) {
      await this.blogLikeRepository.delete({ id: isLiked.id });
      message = PublicMessage.DisLike;
    } else {
      await this.blogLikeRepository.insert({ blogId, userId });
    }
    return { message };
  }
    async bookmarkToggle(blogId: number) {
    const { id: userId } = this.request.user;
    const blog = await this.checkExistBlogById(blogId);
    const isBookmark = await this.blogBookmarkRepository.findOneBy({
      userId,
      blogId,
    });
    let meesage = PublicMessage.Bookmark;
    if (isBookmark) {
      await this.blogBookmarkRepository.delete({ id: isBookmark.id });
      meesage = PublicMessage.UnBookmark;
    } else {
      await this.blogBookmarkRepository.insert({ blogId, userId });
    }
    return { meesage };
  }
  async findOnebySlug(slug: string, paginationDto: PaginationDto) {
    const userId = this.request?.user?.id;
    const blog = await this.blogRepository.createQueryBuilder(EntityName.Blog)
      .leftJoin('blog.categories', 'categories')
      .leftJoin('categories.category', 'category')
      .leftJoin('blog.author', 'author')
      .leftJoin('author.profile', 'profile')
      .addSelect([
        'categories.id',
        'category.title',
        'author.username',
        'author.id',
        'profile.nick_name',
      ])
      .where({ slug })
      .loadRelationCountAndMap('blog.likes', 'blog.likes')
      .loadRelationCountAndMap('blog.bookmarks', 'blog.bookmarks')
      .getOne();
    if (!blog) throw new NotFoundException(NotFoundMessage.NotFoundPost);
    const commentDate = await this.blogCommentService.findCommentOfBlogs(blog.id,paginationDto);
    let isLiked = false;
    let isBookmark = false;
    if(userId && !isNaN(userId) && userId > 0){
      isLiked = !!(await this.blogLikeRepository.findOneBy({userId,blogId: blog.id,}));
      isBookmark = !!(await this.blogBookmarkRepository.findOneBy({userId,blogId: blog.id,}));
    }
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    const suggestBlogs = await queryRunner.query(`
       WITH suggested_blogs AS (
                SELECT 
                    blog.id,
                    blog.slug,
                    blog.title,
                    blog.description,
                    blog.time_for_read,
                    blog.image,
                    json_build_object(
                        'username', u.username,
                        'author_name', p.nick_name,
                        'image', p.profile_image
                    ) AS author,
                    array_agg(DISTINCT cat.title) AS categories,
                    (
                        SELECT COUNT(*) FROM blog_likes
                        WHERE blog_likes."blogId" = blog.id
                    ) AS likes,
                    (
                        SELECT COUNT(*) FROM blog_bookmarks
                        WHERE blog_bookmarks."blogId" = blog.id
                    ) AS bookmarks,
                    (
                        SELECT COUNT(*) FROM blog_comments
                        WHERE blog_comments."blogId" = blog.id
                    ) AS comments
                FROM blog
                LEFT JOIN public.user u ON blog."authorId" = u.id
                LEFT JOIN profile p ON p."userId" = u.id
                LEFT JOIN category cat ON bc."categoryId" = cat.id
                GROUP BY blog.id, u.username, p.nick_name, p.profile_image
                ORDER BY RANDOM()
                LIMIT 3

            )
            SELECT * FROM suggested_blogs
      `)
    return { blog,isLiked,isBookmark,commentDate,suggestBlogs};
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
