import { applyDecorators } from "@nestjs/common";
import { ApiQuery } from "@nestjs/swagger";

export function FilterBlog() {
    return applyDecorators(
        ApiQuery({ name: 'catagory', example: 1, required: false }),
        ApiQuery({ name: 'search', example: 1, required: false }),
    );
}