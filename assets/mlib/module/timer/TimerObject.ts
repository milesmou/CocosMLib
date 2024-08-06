export abstract class TimerObject {
    protected selfTimeScale: number;
    protected groupTimeScale: number;

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