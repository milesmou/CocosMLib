import { LocalStorage } from "./LocalStorage";

/** 一个自动缓存到本地的Map */
export class StroageMap<V> {

    private _readySave = false;
    private _delaySave = false;

    private _stroageKey = mGameSetting.gameName + "_ReportEvent";

    private _defaultValue: V;

    private _cache: { [key: string]: V };

    public constructor(stroageKey: string, defaultValue: V, delaySave = false) {
        this._stroageKey = stroageKey;
        this._defaultValue = defaultValue;
        this._delaySave = delaySave;
        this._cache = LocalStorage.getValue(this._stroageKey, {});
    }


    public get(key: string) {
        let v = this._cache[key] ??= this._defaultValue;
        return v;
    }

    public set(key: string, value: V) {
        this._cache[key] = value;
        if (this._delaySave) {
            this.delaySave();
        } else {
            this.save();
        }
    }

    private save() {
        LocalStorage.setValue(this._stroageKey, this._cache);
    }

    private delaySave() {
        if (!this._readySave) {
            this._readySave = true;
            setTimeout(() => {
                this._readySave = false;
                this.save();
            }, 20);
        }
    }
}