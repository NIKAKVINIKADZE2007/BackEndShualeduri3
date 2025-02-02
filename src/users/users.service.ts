import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
  Query,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { User } from './schema/user.schema';
import { expense } from 'src/expenses/schema/expenses.schema';
import { faker } from '@faker-js/faker';
import { QueryParamsDto } from './dto/query-params.dto';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectModel('user') private userModel: Model<User>,
    @InjectModel('expense') private expenseModel: Model<expense>,
  ) {}

  async onModuleInit() {
    const count = await this.userModel.find().countDocuments();
    const users = [];
    if (count === 0) {
      for (let i = 0; i < 30_000; i++) {
        const user = {
          name: faker.person.firstName(),
          lastName: faker.person.lastName(),
          email: faker.internet.email(),
          age: faker.number.int({ min: 18, max: 65 }),
          expenses: [],
        };
        users.push(user);
      }

      this.userModel.insertMany(users);
    }
  }

  async create(createUserDto: CreateUserDto) {
    const existUser = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (existUser) throw new BadRequestException(`User Already exists`);
    const user = await this.userModel.create(createUserDto);
    return user;
  }

  findAll({ page, take }: QueryParamsDto) {
    const limit = Math.min(take, 30);
    return this.userModel
      .find()
      .skip((page - 1) * limit)
      .limit(limit);
  }

  async findOne(id: string) {
    console.log(id);
    if (!isValidObjectId(id)) throw new BadRequestException('Invalid Id');
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException(`user not found`);
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    if (!isValidObjectId(id)) throw new BadRequestException('Invalid Id');
    const updateUser = await this.userModel.findByIdAndUpdate(
      id,
      updateUserDto,
      { new: true },
    );
    return updateUser;
  }

  async remove(id: string) {
    console.log(id);
    if (!isValidObjectId(id)) throw new BadRequestException('Invalid Id');
    const deletedUser = await this.userModel.findByIdAndDelete(id);

    await this.expenseModel.deleteMany({ _id: { $in: deletedUser.expenses } });
    console.log(deletedUser);
    return deletedUser;
  }

  async addPost(userId, postId) {
    const updateUser = await this.userModel.findByIdAndUpdate(userId, {
      $push: { posts: postId },
    });

    return updateUser;
  }

  async getUsersAmount() {
    return this.userModel.countDocuments();
  }

  async getUsersByAge({ age, ageFrom, ageTo, take, page }: QueryParamsDto) {
    if (!age && !ageFrom && !ageTo) {
      throw new BadRequestException('need to provide age, ageFrom or AgeTo');
    }

    if (age && (ageFrom || ageTo)) {
      throw new BadRequestException('cant do both at the same time');
    }

    const limit = Math.min(take, 30);

    if (age) {
      return this.userModel
        .find({ age: { $eq: age } })
        .skip((page - 1) * limit)
        .limit(limit);
    }

    if (ageFrom && !ageTo) {
      return this.userModel
        .find({ age: { $gte: ageFrom } })
        .skip((page - 1) * limit)
        .limit(limit);
    }

    if (!ageFrom && ageTo) {
      return this.userModel
        .find({ age: { $lte: ageTo } })
        .skip((page - 1) * limit)
        .limit(limit);
    }

    if (ageFrom && ageTo) {
      return this.userModel
        .find({ age: { $gte: ageFrom, $lte: ageTo } })
        .skip((page - 1) * limit)
        .limit(limit);
    }

    return '';
  }
}
