'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ready = exports.update = exports.$ = exports.template = void 0;
exports.template = `
<!-- 帮忙提交数据的元素 -->
<ui-prop type="dump" class="test"></ui-prop>
<!-- 实际渲染的元素 -->
<ui-label class="label"></ui-label>
<ui-input class="test-input"></ui-input>
`;
exports.$ = {
    label: '.label',
    test: '.test',
    testInput: '.test-input',
};
function update(dump) {
    // 缓存 dump 数据，请挂在 this 上，否则多开的时候可能出现问题
    this.dump = dump;
    // 将 dump 数据传递给帮忙提交数据的 prop 元素
    this.$.test.dump = dump.value.label;
    // 更新负责输入和显示的 input 元素上的数据
    this.$.testInput.value = dump.value.label.value;
    this.$.label.value = dump.value.label.name;
}
exports.update = update;
function ready() {
    // 监听 input 上的提交事件，当 input 提交数据的时候，更新 dump 数据，并使用 prop 发送 change-dump 事件
    this.$.testInput.addEventListener('confirm', () => {
        this.dump.value.label.value = this.$.testInput.value;
        this.$.test.dispatch('change-dump');
    });
}
exports.ready = ready;
