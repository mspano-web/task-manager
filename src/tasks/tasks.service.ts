import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as schedule from 'node-schedule';

import { Task, TaskDocument } from './schemas/task.schema';

type TaskFunction = () => void;

@Injectable()
export class TasksService implements OnModuleInit {
  // Defines a map with IDs and associated functions
  private methodMap: { [key: string]: TaskFunction } = {
    CLEAN_LOGS: this.cleanLogs.bind(this),
    REPROCESS_TRANSACTIONS: this.reprocessTransactions.bind(this),
    BACKUP_FILES: this.backupFiles.bind(this),
  };

  constructor(@InjectModel(Task.name) private taskModel: Model<TaskDocument>) {}

  // ---------------------------------------

  async onModuleInit() {
    await this.loadScheduledTasks();
  }

  // ---------------------------------------

  async loadScheduledTasks() {
    const tasks = await this.taskModel.find().exec();
    console.log('loadScheduledTasks - tasks: ', tasks);
    tasks.forEach((task) => {
      this.scheduleTask(task);
    });
  }

  // ---------------------------------------

  async executeTask(taskId: string) {
    // Locate the function associated with the received ID
    const method = this.methodMap[taskId];
    if (method) {
      console.log(
        `Starting execution of task ${taskId} at ${this.getCurrentTimestamp()}`,
      );
      method();
      console.log(
        `Finished execution of task ${taskId} at ${this.getCurrentTimestamp()}`,
      );
    } else {
      console.error(`No method found for task ID: ${taskId}`);
    }
  }

  // ---------------------------------------

  async scheduleTask(task: TaskDocument) {
    //  scheduleJob() allows us to schedule a task
    // It is passed a callback that is executed when the time specified by task.cronTime arrives.
    schedule.scheduleJob(task.id, task.cronTime, () => {
      this.executeTask(task.id);
    });
    console.log(`Scheduled task with ID ${task.id} at ${task.cronTime}`);
  }

  // ---------------------------------------

  private cleanLogs() {
    setTimeout(() => {}, 1000);
  }

  // ---------------------------------------

  private reprocessTransactions() {
    setTimeout(() => {}, 1000);
  }

  // ---------------------------------------

  private backupFiles() {
    setTimeout(() => {}, 1000);
  }

  // ---------------------------------------

  async getConfiguredTasks() {
    const tasks = await this.taskModel.find().exec();
    return tasks;
  }

  // ---------------------------------------

  async getNextScheduledTasks() {
    // This accesses an object that contains all currently scheduled tasks.
    // The `node-schedule` library keeps track of all the tasks that have been scheduled,
    //    and `scheduledJobs` is where these tasks are stored.
    const scheduledJobs = schedule.scheduledJobs;

    // An array is obtained with all the keys (task IDs) of the scheduledJobs object,
    //    which contains all the currently scheduled tasks, and iterates over it
    const runningTasks = Object.keys(scheduledJobs).map((taskId) => {
      const job = scheduledJobs[taskId];
      return {
        id: taskId,
        // Obtained if there is a new invocation scheduled for this task
        nextInvocation: job.nextInvocation()?.toLocaleString() ?? 'N/A',
      };
    });
    return runningTasks;
  }

  private getCurrentTimestamp(): string {
    return new Date().toLocaleString();
  }
}
