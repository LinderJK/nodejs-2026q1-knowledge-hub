import { BadRequestException, PipeTransform } from "@nestjs/common";
import { CreateCategoryDto } from "../dto/create-category.dto";


export class CreateCategoryPipe implements PipeTransform {
    transform(value: CreateCategoryDto) {
        const { name, description } = value;
        if (name.trim() === '') {
            throw new BadRequestException('Name is required and cannot be empty');
        }
        if (description.trim() === '') {
            throw new BadRequestException('Description is required and cannot be empty');
        }
        return value;
    }
}