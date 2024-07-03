export abstract class TimerObject {
    protected selfTimeScale: number;
    protected groupTimeScale: number;

    protected valid = true;

    public isValid() {
        return this.valid;
    }

    public setInvalid() {
        this.valid = false;
    }

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