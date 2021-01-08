const { ccclass, property } = cc._decorator;

@ccclass
export default class PageViewHelper extends cc.Component {

    @property({
        type: cc.Node,
        visible: function () { return this.getComponent(cc.PageView) }
    })
    btnPrevious: cc.Node = null;
    @property({
        type: cc.Node,
        visible: function () { return this.getComponent(cc.PageView) }
    })
    btnNext: cc.Node = null;
    @property({
        type: cc.Label,
        visible: function () { return this.getComponent(cc.PageView) }
    })
    pageNum: cc.Label = null;

    pageView: cc.PageView = null;

    onLoad() {
        this.pageView = this.getComponent(cc.PageView);
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
        let pageCount = this.pageView.getPages().length;
        let pageIndex = this.pageView.getCurrentPageIndex();
        pageIndex += delta;
        pageIndex = cc.misc.clampf(pageIndex, 0, pageCount - 1);
        this.pageView.scrollToPage(pageIndex, dur);
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
