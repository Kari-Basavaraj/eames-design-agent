// Updated: 2026-01-12 02:20:00
// Eames Design Agent - Background Task Manager
// Claude Code-like background task execution

import { EventEmitter } from 'events';

/**
 * Task status
 */
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

/**
 * Background task definition
 */
export interface BackgroundTask {
  id: string;
  name: string;
  description: string;
  status: TaskStatus;
  progress: number; // 0-100
  startTime?: number;
  endTime?: number;
  result?: unknown;
  error?: string;
  logs: string[];
}

/**
 * Task runner function type
 */
export type TaskRunner = (
  task: BackgroundTask,
  updateProgress: (progress: number, log?: string) => void
) => Promise<unknown>;

/**
 * Background Task Manager
 */
class BackgroundTaskManager extends EventEmitter {
  private tasks: Map<string, BackgroundTask> = new Map();
  private runners: Map<string, TaskRunner> = new Map();
  private runningTasks: Set<string> = new Set();
  private maxConcurrent: number = 3;
  private taskIdCounter: number = 0;

  constructor() {
    super();
  }

  /**
   * Generate a unique task ID
   */
  private generateId(): string {
    return `task-${++this.taskIdCounter}-${Date.now()}`;
  }

  /**
   * Create a new background task
   */
  createTask(name: string, description: string, runner: TaskRunner): string {
    const id = this.generateId();
    const task: BackgroundTask = {
      id,
      name,
      description,
      status: 'pending',
      progress: 0,
      logs: [],
    };

    this.tasks.set(id, task);
    this.runners.set(id, runner);
    this.emit('task:created', task);

    // Try to start immediately if slots available
    this.processQueue();

    return id;
  }

  /**
   * Process the task queue
   */
  private async processQueue(): Promise<void> {
    if (this.runningTasks.size >= this.maxConcurrent) {
      return;
    }

    // Find pending tasks
    const pendingTasks = Array.from(this.tasks.values())
      .filter(t => t.status === 'pending');

    for (const task of pendingTasks) {
      if (this.runningTasks.size >= this.maxConcurrent) {
        break;
      }

      await this.runTask(task.id);
    }
  }

  /**
   * Run a specific task
   */
  private async runTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    const runner = this.runners.get(taskId);

    if (!task || !runner) {
      return;
    }

    if (task.status !== 'pending') {
      return;
    }

    // Update status
    task.status = 'running';
    task.startTime = Date.now();
    this.runningTasks.add(taskId);
    this.emit('task:started', task);

    // Progress update function
    const updateProgress = (progress: number, log?: string) => {
      task.progress = Math.min(100, Math.max(0, progress));
      if (log) {
        task.logs.push(`[${new Date().toISOString()}] ${log}`);
      }
      this.emit('task:progress', task);
    };

    try {
      const result = await runner(task, updateProgress);
      task.status = 'completed';
      task.progress = 100;
      task.result = result;
      task.endTime = Date.now();
      this.emit('task:completed', task);
    } catch (error) {
      task.status = 'failed';
      task.error = error instanceof Error ? error.message : String(error);
      task.endTime = Date.now();
      this.emit('task:failed', task);
    } finally {
      this.runningTasks.delete(taskId);
      this.runners.delete(taskId);

      // Process next task in queue
      this.processQueue();
    }
  }

  /**
   * Cancel a task
   */
  cancelTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) {
      return false;
    }

    if (task.status === 'pending') {
      task.status = 'cancelled';
      task.endTime = Date.now();
      this.runners.delete(taskId);
      this.emit('task:cancelled', task);
      return true;
    }

    // Can't cancel running tasks (would need AbortController)
    return false;
  }

  /**
   * Get a task by ID
   */
  getTask(taskId: string): BackgroundTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Get all tasks
   */
  getAllTasks(): BackgroundTask[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Get tasks by status
   */
  getTasksByStatus(status: TaskStatus): BackgroundTask[] {
    return Array.from(this.tasks.values()).filter(t => t.status === status);
  }

  /**
   * Get running tasks
   */
  getRunningTasks(): BackgroundTask[] {
    return this.getTasksByStatus('running');
  }

  /**
   * Get pending tasks
   */
  getPendingTasks(): BackgroundTask[] {
    return this.getTasksByStatus('pending');
  }

  /**
   * Clear completed tasks
   */
  clearCompletedTasks(): void {
    for (const [id, task] of this.tasks) {
      if (task.status === 'completed' || task.status === 'failed' || task.status === 'cancelled') {
        this.tasks.delete(id);
      }
    }
    this.emit('tasks:cleared');
  }

  /**
   * Set max concurrent tasks
   */
  setMaxConcurrent(max: number): void {
    this.maxConcurrent = Math.max(1, max);
    this.processQueue();
  }

  /**
   * Get task summary
   */
  getSummary(): { pending: number; running: number; completed: number; failed: number } {
    const tasks = Array.from(this.tasks.values());
    return {
      pending: tasks.filter(t => t.status === 'pending').length,
      running: tasks.filter(t => t.status === 'running').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      failed: tasks.filter(t => t.status === 'failed').length,
    };
  }

  /**
   * Wait for a task to complete
   */
  waitForTask(taskId: string): Promise<BackgroundTask> {
    return new Promise((resolve, reject) => {
      const task = this.tasks.get(taskId);
      if (!task) {
        reject(new Error(`Task ${taskId} not found`));
        return;
      }

      if (task.status === 'completed' || task.status === 'failed' || task.status === 'cancelled') {
        resolve(task);
        return;
      }

      const onComplete = (completedTask: BackgroundTask) => {
        if (completedTask.id === taskId) {
          this.off('task:completed', onComplete);
          this.off('task:failed', onFail);
          this.off('task:cancelled', onCancel);
          resolve(completedTask);
        }
      };

      const onFail = (failedTask: BackgroundTask) => {
        if (failedTask.id === taskId) {
          this.off('task:completed', onComplete);
          this.off('task:failed', onFail);
          this.off('task:cancelled', onCancel);
          resolve(failedTask);
        }
      };

      const onCancel = (cancelledTask: BackgroundTask) => {
        if (cancelledTask.id === taskId) {
          this.off('task:completed', onComplete);
          this.off('task:failed', onFail);
          this.off('task:cancelled', onCancel);
          resolve(cancelledTask);
        }
      };

      this.on('task:completed', onComplete);
      this.on('task:failed', onFail);
      this.on('task:cancelled', onCancel);
    });
  }

  /**
   * Wait for all tasks to complete
   */
  async waitForAll(): Promise<void> {
    const runningAndPending = Array.from(this.tasks.values())
      .filter(t => t.status === 'pending' || t.status === 'running');

    await Promise.all(runningAndPending.map(t => this.waitForTask(t.id)));
  }
}

// Singleton instance
export const taskManager = new BackgroundTaskManager();

/**
 * Helper to create a simple background task
 */
export function runInBackground(
  name: string,
  description: string,
  fn: () => Promise<unknown>
): string {
  return taskManager.createTask(name, description, async (task, updateProgress) => {
    updateProgress(0, 'Starting...');
    const result = await fn();
    updateProgress(100, 'Complete');
    return result;
  });
}

/**
 * Helper to create a progress-aware background task
 */
export function runInBackgroundWithProgress(
  name: string,
  description: string,
  fn: (updateProgress: (progress: number, log?: string) => void) => Promise<unknown>
): string {
  return taskManager.createTask(name, description, async (task, updateProgress) => {
    return fn(updateProgress);
  });
}
