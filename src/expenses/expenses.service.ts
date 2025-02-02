import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { expense } from './schema/expenses.schema';
import { User } from 'src/users/schema/user.schema';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel('expense') private expenseModel: Model<expense>,
    @InjectModel('user') private userModel: Model<User>,
  ) {}

  async create(userId: string, createExpenseDto: CreateExpenseDto) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('user not found');
    const newExpense = await this.expenseModel.create({
      ...createExpenseDto,
      user: userId,
    });

    await this.userModel.findOneAndUpdate(user._id, {
      $push: { expenses: newExpense._id },
    });

    return newExpense;
  }

  findAll() {
    return this.expenseModel.find();
  }

  async findOne(id: string) {
    if (!isValidObjectId(id)) throw new BadRequestException('Invalid Id');

    const expense = await this.expenseModel.findById(id);

    return expense;
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto) {
    if (!isValidObjectId(id)) throw new BadRequestException('Invalid Id');

    const newExpense = await this.expenseModel.findByIdAndUpdate(
      id,
      updateExpenseDto,
      { new: true },
    );

    return newExpense;
  }

  async remove(userId: string, id: string) {
    if (!isValidObjectId(id)) throw new BadRequestException('Invalid Id');
    const user = await this.userModel.findById(userId);

    if (!user) throw new NotFoundException('user not found');

    const expense = await this.expenseModel.findById(id);

    console.log(userId, 'userid');
    console.log(expense.user.toString(), 'user');
    if (expense.user.toString() !== userId) {
      throw new UnauthorizedException('this is not your expense');
    }

    const deletedExpense = await this.expenseModel.findByIdAndDelete(id);

    await this.userModel.findOneAndUpdate(user._id, {
      $push: { expenses: deletedExpense._id },
    });

    return '';
  }
}
