import { GameData } from "./GameData";

/** 任务状态 */
export enum TaskState {
    None,

    /** 可以领取任务 */
    CanGet,

    /** 进行中 */
    Started,

    /** 已完成 */
    Complete,

    /** 已领取奖励 */
    Finished
}

/** 任务的基本信息 */
export class TaskItemSO {

    /** 任务id */
    public id: number;

    /** 任务目标类型 */
    public targetType: number;

    /** 是否处于追踪状态 */
    public isTracking: boolean;

    /** 任务进度参数 */
    public progress: number[] = [];

    /** 任务状态 */
    public state: TaskState = TaskState.None;
}

/** 任务目标类型 */
export enum TaskTargetType {

}

export class GameTask {


    public initTask() {

    }

    public takeTask(taskId: number) {
        var taskItemSo = GameData.Inst.task.find(v => v.id == taskId);
        if (taskItemSo == null) {
            var genTaskItemSo = this.genTaskItemSO(taskId);
            if (genTaskItemSo != null) {
                GameData.Inst.task.push(genTaskItemSo);
                this.saveTaskInfo();
            }
        }
    }

    private genTaskItemSO(taskId: number) {
        var itemSo = new TaskItemSO();
        itemSo.id = taskId;
        itemSo.targetType = 1;
        itemSo.state = TaskState.Started;
        itemSo.progress.push(0);
        return itemSo;
    }

    public giveUpTask(taskId: number) {
        var index = GameData.Inst.task.findIndex(v => v.id == taskId);
        if (index > -1) {
            GameData.Inst.task.splice(index, 1);
            this.saveTaskInfo();
        }
    }

    public finishTask(taskItemSo: TaskItemSO) {
        if (taskItemSo != null && taskItemSo.state == TaskState.Complete) {
            taskItemSo.state = TaskState.Finished;
            this.saveTaskInfo();
        }
    }

    public updateTaskProgress(taskTargetType: TaskTargetType, param1 = 1, param2 = 1) {
        var tasks = GameData.Inst.task.filter(v => {
            if (v.state == TaskState.Complete || v.state == TaskState.Finished) return false;
            // var dailyTask = DataManager.Data.TbDailyTask.GetOrDefault(v.id);
            // if (dailyTask.DayTarget != v.targetType)
            // {
            //     //任务目标 有变更 清除当前任务进度
            //     v.progress.Clear();
            //     v.targetType = dailyTask.DayTarget;
            // }
            return v.targetType == taskTargetType;
        });

        if (tasks.length == 0) return;

        switch (taskTargetType) {
        }

        this.saveTaskInfo();
    }

    public isTaskComplete(taskItemSo: TaskItemSO) {
        return taskItemSo.state == TaskState.Complete;
    }

    public isTaskFinished(taskItemSo: TaskItemSO) {
        return taskItemSo.state == TaskState.Finished;
    }

    private saveTaskInfo() {
        GameData.Inst.delaySave();
        app.event.emit(mEventKey.OnTaskChange);
    }
}