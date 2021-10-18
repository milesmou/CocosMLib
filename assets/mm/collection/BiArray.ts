/** 特殊的二维数组(可当作将子数组展开的一维数组使用) */
export class BiArray<T>{
    private arr: T[][] = [];
    /** 所有元素的总数 */
    get length() {
        let len = 0;
        this.arr.forEach(v => len += v.length);
        return len;
    }
    /** 所有元素中的最后一个元素 */
    get top() {
        if (this.arr.length > 0) {
            for (let i = this.arr.length - 1; i >= 0; i--) {
                let v = this.arr[i];
                if (v) {
                    return v[v.length - 1];
                }
            }
        }
        return null;
    }
    /** 清空数组 */
    clear() {
        this.arr.length = 0;
    }
    /** 向指定的子数组末尾添加一个元素 */
    push(subArrayIndex: number, item: T) {
        if (!this.arr[subArrayIndex]) {
            this.arr[subArrayIndex] = [];
        }
        this.arr[subArrayIndex].push(item);
    }
    /** 返回并删除最后一个元素 */
    pop(): T {
        if (this.arr.length > 0) {
            for (let i = this.arr.length - 1; i >= 0; i--) {
                let element = this.arr[i];
                if (element) {
                    let v = element[element.length - 1];
                    element.splice(element.length - 1, 1);
                    if (element.length == 0) {
                        if (i == this.arr.length - 1) {
                            this.arr.pop();
                        } else {
                            this.arr[i] = null;
                        }
                    }
                    return v;
                }
            }
        }
        return null;
    }
    /** 数组中是否包含指定元素 */
    includes(item: T) {
        return this.indexOf(item) > -1;
    }
    /** 获取元素在数组中的索引 */
    indexOf(item: T) {
        let preIndex = 0;
        for (let i = 0; i < this.arr.length; i++) {
            const element = this.arr[i];
            if (element) {
                let index = element.indexOf(item);
                if (index > -1) return preIndex + index;
                preIndex += element.length;
            }
        }
        return -1;
    }
    /** 删除指定元素  */
    delItem(item: T) {
        for (let i = 0; i < this.arr.length; i++) {
            const element = this.arr[i];
            if (element) {
                let index = element.indexOf(item);
                if (index > -1) {
                    element.splice(index, 1);
                    if (element.length == 0) {
                        if (i == this.arr.length - 1) {
                            this.arr.pop();
                        } else {
                            this.arr[i] = null;
                        }
                    }
                    break;
                }
            }
        }
    }
    /** 遍历数组 */
    forEach(callbackfn: (item: T, index: number) => void) {
        let preIndex = 0;
        for (let i = 0; i < this.arr.length; i++) {
            const element = this.arr[i];
            if (element) {
                for (let j = 0; j < element.length; j++) {
                    const v = element[j];
                    callbackfn(v, preIndex + j);
                }
                preIndex += element.length;
            }
        }
    }
}