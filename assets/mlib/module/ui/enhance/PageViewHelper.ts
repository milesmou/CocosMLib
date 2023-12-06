import { Component, Label, Node, PageView, _decorator, misc } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PageViewHelper')
export class PageViewHelper extends Component {
    @property({
        type: Node,
        visible: function () { return this.getComponent(PageView) }
    })
    btnPrevious: Node = null;
    @property({
        type: Node,
        visible: function () { return this.getComponent(PageView) }
    })
    btnNext: Node = null;
    @property({
        type: Label,
        visible: function () { return this.getComponent(PageView) }
    })
    pageNum: Label = null;
    pageView: PageView = null;

    onLoad() {
        this.pageView = this.getComponent(PageView);
        if (this.btnPrevious) {
            this.btnPrevious.on("click", this.onClickPrevious, this);
        }
        if (this.btnNext) {
            this.btnNext.on("click", this.onClickNext, this);
        }
    }

    onClickPrevious() {
        this.turnPage(-1);
    }

    onClickNext() {
        this.turnPage(1);
    }

    turnPage(delta: number) {
        let dur = 0.3;
        let pageCount = this.pageView!.getPages().length;
        let pageIndex = this.pageView!.getCurrentPageIndex();
        pageIndex += delta;
        pageIndex = misc.clampf(pageIndex, 0, pageCount - 1);
        this.pageView!.scrollToPage(pageIndex, dur);
    }

    update() {
        if (!this.pageView) return;
        let pageCount = this.pageView.getPages().length;
        let currentPage = this.pageView.getCurrentPageIndex();
        if (this.btnPrevious) {
            this.btnPrevious.active = !(currentPage == 0);
        }
        if (this.btnNext) {
            this.btnNext.active = !(currentPage == pageCount - 1);
        }
        if (this.pageNum) {
            this.pageNum.string = currentPage + "/" + pageCount;
        }
    }
}
