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

export class PlayerTask{
    
}