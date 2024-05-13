import { RedDotMgr } from '../../mlib/module/ui/reddot/RedDotMgr';

/**
 * 红点管理类
 */
export class GameRedDot {
    public static get Inst() { return app.getSingleInst(GameRedDot); }

    init() {
        //这里只初始化所有固定红点(动态加载列表中Item数量不固定,则手动处理Item中的红点,)
        RedDotMgr.initRedDotTree([
            "Main",
            "Main.Leaflet",
            "Main.Staff",
            "Main.Staff.StaffType1",
            "Main.Staff.StaffType2",
            "Main.Staff.StaffType3",
            "Main.Build",
            "Main.Build.BuildType1",
            "Main.Build.BuildType2",
            "Main.Build.BuildType3",
            "Main.Build.BuildType4",
        ]);
        this.initEvent();
        this.updateRedDotValue();
    }

    ///注册事件去刷新红点的数值

    private initEvent() {

    }


    ///刷新叶子红点的数值

    /** 刷新所有叶子红点的数值 */
    private updateRedDotValue() {
        this.updateLeafletRedDotValue();
    }



    /** 主界面.传单 */
    public updateLeafletRedDotValue() {
        // RedDotMgr.setRedDotValue("Leaflet", GameData.Inst.leafletState.remain);
    }




    ///获得红点的数值


    /** 建筑类型红点数值 */
    // public getBuildTypeRedDotValue(buildType: number) {
    //     let buildUIPlans = GameTable.Inst.getBuildingUiPlans(buildType);
    //     for (const build of buildUIPlans) {
    //         let value = this.getBuildItemRedDotValue(build.ID);
    //         if (value > 0) return value;
    //     }
    //     return 0;
    // }



}