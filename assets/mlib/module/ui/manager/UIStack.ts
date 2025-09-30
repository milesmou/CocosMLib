/** 为UI管理服务的UI栈 (主站的元素可以有一个对应的子栈,主栈和子栈的所有元素不重复) */
export class UIStack<T> {
    /** 主栈元素 */
    private _arr: T[] = [];
    /** 主栈元素:子栈数组 */
    private _childMap: Map<T, T[]> = new Map();
    /**  将主栈和子栈展开的一个数组，子栈所有元素会放在主栈元素前面 */
    private _flatArr: T[] = [];
    /**  将主栈和子栈展开的一个数组，子栈所有元素会放在主栈元素前面 */
    public get flatArr() { return this._flatArr.concat(); }

    /** 将主栈和子栈展开 */
    private flat() {
        this._flatArr.length = 0;
        for (const v of this._arr) {
            let childs = this._childMap.get(v);
            if (childs) {
                this._flatArr.push(...childs);
            }
            this._flatArr.push(v);
        }
    }

    /** 主栈或子栈是否有指定元素 */
    public has(value: T) {
        return this._flatArr.includes(value);
    }

    /** 
     * 添加一个元素
     * @param [bottom=false] 是否放在栈底
     * @param parent 传入父元素，则表明是添加一个元素到父元素的子栈
     */
    public add(value: T, bottom = false, parent?: T) {
        let arr = this._arr;
        if (parent) {
            if (!this._childMap.has(parent)) {
                arr = [];
                this._childMap.set(parent, arr);
            } else {
                arr = this._childMap.get(parent);
            }
        }
        arr.delete(value);
        if (bottom) arr.unshift(value);
        else arr.push(value);
        this.flat();
    }

    /** 移除一个元素 */
    public remove(value: T) {
        let index = this._arr.indexOf(value);
        if (index > -1) {
            this._arr.splice(index, 1);
            this._childMap.delete(value);
        } else {
            for (const [key, childs] of this._childMap) {
                index = childs.indexOf(value);
                if (index > -1) {
                    childs.splice(index, 1);
                    if (childs.length == 0) this._childMap.delete(key);
                    return;
                }
            }
        }
        this.flat();
    }

    /** 获取子栈元素的父元素 */
    public getParent(value: T) {
        for (const [k, v] of this._childMap) {
            if (v.includes(value)) {
                return k;
            }
        }
        return undefined;
    }

    /** 是否栈顶元素 (如果是主栈元素，则只要在主栈栈顶就算；如果是子栈元素，则父元素也需要在主栈栈顶) */
    public isTop(value: T) {
        if (this._arr.length == 0) return false;
        let index = this._arr.indexOf(value);
        if (index > -1) {
            return index == this._arr.length - 1;
        } else {
            let parent = this.getParent(value);
            if (parent == this._arr.last) {
                let sub = this._childMap.get(parent);
                if (sub && value == sub.last) return true;
            }
        }
        return false;
    }

    /** 是否是主栈元素 */
    public isMainItem(value: T) {
        return this._arr.includes(value);
    }

    /** 是否是子栈元素 */
    public isSubItem(value: T) {
        if (!this._arr.includes(value)) {
            return this._flatArr.includes(value);
        }
        return false;
    }

    [Symbol.iterator]() {
        let index = 0;
        let data = this._flatArr;
        return {
            next() {
                if (index < data.length) {
                    return { value: data[index++], done: false };
                } else {
                    return { done: true };
                }
            }
        }
    }

}