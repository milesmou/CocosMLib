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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcC1sYWJlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NvdXJjZS9pbnNwZWN0b3IvY29tcC1sYWJlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUlBLFFBQUEsUUFBUSxHQUFHOzs7Ozs7Q0FNdkIsQ0FBQztBQUVXLFFBQUEsQ0FBQyxHQUFHO0lBQ2IsS0FBSyxFQUFDLFFBQVE7SUFDZCxJQUFJLEVBQUUsT0FBTztJQUNiLFNBQVMsRUFBRSxhQUFhO0NBQzNCLENBQUM7QUFJRixTQUFnQixNQUFNLENBQWtCLElBQVM7SUFDN0Msc0NBQXNDO0lBQ3RDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ2pCLDhCQUE4QjtJQUM5QixJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7SUFDcEMsMEJBQTBCO0lBQzFCLElBQUksQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7SUFDaEQsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztBQUMvQyxDQUFDO0FBUkQsd0JBUUM7QUFDRCxTQUFnQixLQUFLO0lBQ2pCLHdFQUF3RTtJQUN4RSxJQUFJLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsR0FBRyxFQUFFO1FBQzlDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDO1FBQ3JELElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUN4QyxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFORCxzQkFNQyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcclxuXHJcbnR5cGUgU2VsZWN0b3I8JD4gPSB7ICQ6IFJlY29yZDxrZXlvZiAkLCBhbnkgfCBudWxsPiB9XHJcblxyXG5leHBvcnQgY29uc3QgdGVtcGxhdGUgPSBgXHJcbjwhLS0g5biu5b+Z5o+Q5Lqk5pWw5o2u55qE5YWD57SgIC0tPlxyXG48dWktcHJvcCB0eXBlPVwiZHVtcFwiIGNsYXNzPVwidGVzdFwiPjwvdWktcHJvcD5cclxuPCEtLSDlrp7pmYXmuLLmn5PnmoTlhYPntKAgLS0+XHJcbjx1aS1sYWJlbCBjbGFzcz1cImxhYmVsXCI+PC91aS1sYWJlbD5cclxuPHVpLWlucHV0IGNsYXNzPVwidGVzdC1pbnB1dFwiPjwvdWktaW5wdXQ+XHJcbmA7XHJcblxyXG5leHBvcnQgY29uc3QgJCA9IHtcclxuICAgIGxhYmVsOicubGFiZWwnLFxyXG4gICAgdGVzdDogJy50ZXN0JyxcclxuICAgIHRlc3RJbnB1dDogJy50ZXN0LWlucHV0JyxcclxufTtcclxuXHJcbnR5cGUgUGFuZWxUaGlzID0gU2VsZWN0b3I8dHlwZW9mICQ+ICYgeyBkdW1wOiBhbnkgfTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGUodGhpczogUGFuZWxUaGlzLCBkdW1wOiBhbnkpIHtcclxuICAgIC8vIOe8k+WtmCBkdW1wIOaVsOaNru+8jOivt+aMguWcqCB0aGlzIOS4iu+8jOWQpuWImeWkmuW8gOeahOaXtuWAmeWPr+iDveWHuueOsOmXrumimFxyXG4gICAgdGhpcy5kdW1wID0gZHVtcDtcclxuICAgIC8vIOWwhiBkdW1wIOaVsOaNruS8oOmAkue7meW4ruW/meaPkOS6pOaVsOaNrueahCBwcm9wIOWFg+e0oFxyXG4gICAgdGhpcy4kLnRlc3QuZHVtcCA9IGR1bXAudmFsdWUubGFiZWw7XHJcbiAgICAvLyDmm7TmlrDotJ/otKPovpPlhaXlkozmmL7npLrnmoQgaW5wdXQg5YWD57Sg5LiK55qE5pWw5o2uXHJcbiAgICB0aGlzLiQudGVzdElucHV0LnZhbHVlID0gZHVtcC52YWx1ZS5sYWJlbC52YWx1ZTtcclxuICAgIHRoaXMuJC5sYWJlbC52YWx1ZSA9IGR1bXAudmFsdWUubGFiZWwubmFtZTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gcmVhZHkodGhpczogUGFuZWxUaGlzKSB7XHJcbiAgICAvLyDnm5HlkKwgaW5wdXQg5LiK55qE5o+Q5Lqk5LqL5Lu277yM5b2TIGlucHV0IOaPkOS6pOaVsOaNrueahOaXtuWAme+8jOabtOaWsCBkdW1wIOaVsOaNru+8jOW5tuS9v+eUqCBwcm9wIOWPkemAgSBjaGFuZ2UtZHVtcCDkuovku7ZcclxuICAgIHRoaXMuJC50ZXN0SW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignY29uZmlybScsICgpID0+IHtcclxuICAgICAgICB0aGlzLmR1bXAudmFsdWUubGFiZWwudmFsdWUgPSB0aGlzLiQudGVzdElucHV0LnZhbHVlO1xyXG4gICAgICAgIHRoaXMuJC50ZXN0LmRpc3BhdGNoKCdjaGFuZ2UtZHVtcCcpO1xyXG4gICAgfSk7XHJcbn0iXX0=