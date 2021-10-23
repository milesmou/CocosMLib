/** 自定义的二维栈 (API使用可以理解为将子栈在自己所处位置展开的一维栈)*/
export class BiStack<T>{
    private arr: T[][] = [];
    /** 栈内元素的总数 */
    get length() {
        let len = 0;
        this.arr.forEach(v => {
            if (v) {
                len += v.length
            }
        });
        return len;
    }
    /** 栈顶元素 */
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
    /** 清空栈 */
    clear() {
        this.arr.length = 0;
    }
    /** 
     * 向指定的子栈中添加一个元素 
     * @param priority 子栈的索引,从0开始
     */
    push(priority: number, item: T) {
        if (!this.arr[priority]) {
            this.arr[priority] = [];
        }
        this.arr[priority].push(item);
    }
    /** 返回并删除栈顶元素 */
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
    /** 栈中是否包含指定元素 */
    includes(item: T) {
        return this.indexOf(item) > -1;
    }
    /** 获取元素在栈中的索引 */
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
    /** 遍历栈 */
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