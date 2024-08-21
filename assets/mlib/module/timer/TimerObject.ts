export abstract class TimerObject {
    protected valid: boolean = true;
    protected selfTimeScale = 1;
    protected groupTimeScale = 1;

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