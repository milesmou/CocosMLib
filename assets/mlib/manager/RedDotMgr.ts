
class RedDotNode {

    constructor(name: string) {
        this.name = name;
    }

    private nodeValue = 0;
    public name: string;
    public parent: RedDotNode;
    public child: RedDotNode[] = [];
    public onValueChange: () => void;

    public get value() {
        if (this.child.length == 0) return this.nodeValue;
        let v = 0;
        for (const c of this.child) {
            v += c.value;
        }
        return v;
    }

    public set value(val) {
        this.nodeValue = val;
        this.onValueChange && this.onValueChange();
        if (this.child.length == 0) return;
        let p = this.parent;
        while (p != null) {
            p.onValueChange && p.onValueChange();
            p = p.parent;
        }
    }
}

/** 红点树管理类 */
export class RedDotMgr {

    private static nodes: { [key: string]: RedDotNode };
    private static rootNode: RedDotNode;

    /**
     * 初始化红点树 传入所有红点的路径(用.分隔,末尾为红点名字,红点名字不能重复) 第一个为根节点 
     * @param redDots 例:["Main","Main.Email","Main.Task","Main.Task.DailyTask","Main.Task.MainTask"]
     */
    public static initRedDotTree(redDots: string[]) {
        if (!redDots || redDots.length < 2) return;

        this.nodes = {};
        this.rootNode = new RedDotNode(redDots[0]);
        this.nodes[this.rootNode.name] = this.rootNode;

        for (let i = 0; i < redDots.length; i++) {
            const strPath = redDots[i];
            if (strPath.indexOf(".") > -1) {
                var strings = strPath.split('.');
                var nodeName = strings[strings.length - 1];
                var parentName = strings[strings.length - 2];
                this.addRedDot(nodeName, parentName);
            }
            else {
                console.error(`节点路径错误 ${strPath}`);
            }
        }
    }

    private static addRedDot(name: string, parentName: string) {
        if (this.nodes[parentName]) {
            if (!this.nodes[name]) {
                let parent = this.nodes[parentName];
                let node = new RedDotNode(name);
                parent.child.push(node);
                node.parent = parent;
                this.nodes[name] = node;
            }
            else {
                console.error(`节点已存在 ${name}`);
            }
        }
        else {
            console.error(`父节点不存在 ${name}`);
        }
    }

    private static removeRedDot(name: string) {
        if (this.nodes[name]) {
            delete this.nodes[name];
        }
        else {
            console.error(`节点不存在 ${name}`);
        }
    }


    public static setRedDotListener(name: string, onValueChange: () => void) {
        if (this.nodes[name]) {
            let node = this.nodes[name];
            node.onValueChange = onValueChange;
        }
        else {
            console.error(`节点不存在 ${name}`);
        }
    }

    public static setRedDotValue(name: string, value: number) {
        if (this.nodes[name]) {
            let node = this.nodes[name];
            if (node.child.length == 0) {
                if (node.value != value)
                    node.value = value;
            }
            else {
                console.error(`只能修改叶子节点的值 ${name}`);
            }
        }
        else {
            console.error(`节点不存在 ${name}`);
        }
    }

    public static getRedDotValue(name: string) {
        if (this.nodes[name]) {
            let node = this.nodes[name];
            return node.value;
        }
        else {
            console.error(`节点不存在 ${name}`);
            return 0;
        }
    }
}