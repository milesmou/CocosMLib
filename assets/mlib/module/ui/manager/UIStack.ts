export class UIStack<T> extends Array<T> {
    
    public add(value: T, bottom = false) {
        this.remove(value);
        if (bottom) this.unshift(value);
        else this.push(value);
    }

    public remove(value: T) {
        let index = this.indexOf(value);
        if (index > -1) {
            this.splice(index, 1);
        }
    }


}