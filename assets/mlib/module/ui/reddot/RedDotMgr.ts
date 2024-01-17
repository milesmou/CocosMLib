import { MLogger } from "../../logger/MLogger";

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
        if (this.child.length > 0) {
            MLogger.error("只能修改叶子节点的值", this.name);
            return;
        }
        this.nodeValue = val;
        this.onValueChange && this.onValueChange();
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

        for (let i = 1; i < redDots.length; i++) {
            const strPath = redDots[i];
            if (strPath.indexOf(".") > -1) {
                var strings = strPath.split('.');
                var nodeName = strings[strings.length - 1];
                var parentName = strings[strings.length - 2];
                this.addRedDot(nodeName, parentName);
            }
            else {
                MLogger.error(`节点路径错误 ${strPath}`);
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
                MLogger.error(`节点已存在 ${name}`);
            }
        }
        else {
            MLogger.error(`父节点不存在 ${name}`);
        }
    }

    /** 监听节点值的变化 */
    public static setRedDotListener(name: string, onValueChange: () => void) {
        if (this.nodes[name]) {
            let node = this.nodes[name];
            node.onValueChange = onValueChange;
        }
        else {
            MLogger.error(`节点不存在 ${name}`);
        }
    }

    /** 修改叶子节点的值 */
    public static setRedDotValue(name: string, value: number) {
        if (this.nodes[name]) {
            let node = this.nodes[name];
            if (node.child.length == 0) {
                node.value = value;
            }
            else {
                MLogger.error(`只能修改叶子节点的值 ${name}`);
            }
        }
        else {
            MLogger.error(`节点不存在 ${name}`);
        }
    }

    /** 获取任意节点的值 */
    public static getRedDotValue(name: string) {
        if (this.nodes[name]) {
            let node = this.nodes[name];
            return node.value;
        }
        else {
            MLogger.error(`节点不存在 ${name}`);
            return 0;
        }
    }

    /** 打印所有红点的值 用于调试 */
    public static printAllRedDotValue() {
        for (const name in this.nodes) {
            let node = this.nodes[name];
            MLogger.debug(`name=${name} value=${node.value} isLeaf=${node.child.length == 0}`)
        }
    }
}