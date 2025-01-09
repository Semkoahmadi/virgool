import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from './entities/category.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination..dto';
import {
  paginationGenerator,
  paginationSolver,
} from 'src/common/utils/pagination.util';
import { Pagination } from 'src/common/decorators/pagination.decorators';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private categoryRepository: Repository<CategoryEntity>
  ) {}
  async create(createCategoryDto: CreateCategoryDto) {
    let { title, priority } = createCategoryDto;
    title = await this.checkExistAndResolve(title);
    const category = this.categoryRepository.create({
      title,
      priority,
    });
    await this.categoryRepository.save(category);
    return { message: 'Success Created!.' };
  }

  async checkExistAndResolve(title: string) {
    title = title?.trim()?.toLowerCase();
    const category = await this.categoryRepository.findOneBy({ title });
    if (category) throw new BadRequestException('Conflict');
    return title;
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, page, skip } = paginationSolver(paginationDto);
    const [categries, count] = await this.categoryRepository.findAndCount({
      where: {},
      skip,
      take: limit,
    });
    return { Pagination: paginationGenerator(count, page, limit), categries };
  }

  async findOne(id: number) {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) throw new BadRequestException('Sorry Not Found!..');
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findOne(id);
    const { title, priority } = updateCategoryDto;
    if (title) category.title = title;
    if (priority) category.priority = priority;
    await this.categoryRepository.save(category);
    return { messsage: 'Updated OK!' };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.categoryRepository.delete({ id });
    return {
      message: 'Deleted!...',
    };
  }
}
