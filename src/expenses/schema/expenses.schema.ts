import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema()
export class expense {
  @Prop({ type: String })
  category: string;

  @Prop({ type: Number })
  amount: Number;

  @Prop({ type: Number })
  price: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'user' })
  user: mongoose.Schema.Types.ObjectId;
}

export const expenseSchema = SchemaFactory.createForClass(expense);
