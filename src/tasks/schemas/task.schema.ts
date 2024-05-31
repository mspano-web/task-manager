import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TaskDocument = Task & Document;

@Schema({ collection: 'task-scheduling' })
export class Task {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  cronTime: string;

  @Prop({ required: true })
  methodName: string;

  @Prop({ type: Object })
  params: Record<string, any>;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
