export abstract class TimerObject<T = any> {
    protected _target: T;
    protected selfTimeScale = 1;
    protected groupTimeScale = 1;

    public get target() { return this._target; }
    public abstract isValid();

    public setSelfTimeScale(value: number, arg?: any) {
        this.selfTimeScale = value;
        this.updateTimeScale();
    }

    public setGroupTimeScale(value: number) {
        this.groupTimeScale = value;
        this.updateTimeScale();
    }

    protected abstract updateTimeScale(): void;
}