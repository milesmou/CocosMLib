//枚举定义类

/** 事件枚举 */
export enum EventKey {

    //#region 基础事件,不可更改
    Builtin = -1000000,
    ShowUI,
    HideUI,
    OnUIInitBegin,
    OnUIShowBegin,
    OnUIHideBegin,
    OnUIShow,
    OnUIHide,
    OnInventoryChange,
    OnTaskChange,
    ShowGuide,
    OnGuideStart,
    ManualGuideStep,
    OnGuideEnd,
    //#endregion

    //其它事件
    CameraPositionChange,//摄像机位置移动
    PlayerLevelUp,//主角升级
    LeafletCntChange,//传单次数变化
    ShowStaffWin,//打开员工界面
    //战斗
    BattleBossComing,//打boss
    BattleStateChange,//战斗状态变化
    SoldierDead,
    MonsterDead,
    //建筑、角色的事件
    UnlockBuilding,
    UpgradeBuilding,
    UnlockStaff,
    UpgradeStaff,
    UnlockStaffSkin,
    ChangeStaffSkin,

    BuildingPreperWork,
    BuildingStartWork,
    /** 救援队出现 */
    RescuerStart,
    /** 医疗站小鸡出现 */
    MedicalSoliderStart,
    /** 鸡舍小鸡出现 */
    HenhouseStart,

    OnCustomerEnterShop,//顾客进入商店
    SaleGoodsAmountChange,//货架商品数量变化
    UnlockSaleGoods,//解锁加工厂的商品
    CustomerOrder,//顾客预定商品
    CustomerBuy,//顾客购买商品
    SpecimenGoldChange,//标本的金币数量变化
    VipDataChanged,//VIP数据变化，买了VIP或者领取了奖励，红点有用

    //特殊角色事件
    SpecialCharacterEnter,//特殊角色进入商店
    SpecialCharacterLeave,//特殊角色离开商店

    //KIN界面杂项功能
    ListAddFinish,//LIST加载完成，用于optimumList脚本减少LIST中的DC
    FinishSign,//签到成功
    ClickEquItemShell,//点击了一个装备图标
    EquDataChanged,//换装、强化数据变化了，图标自己刷新下状态
    EquBoxDataChanged,//装备宝箱的经验或者等级发生了变化
    FinishChou,//抽完一次装备了
    ZhuanDataChanged,//转盘玩法数据变化
    TarotDataChanged,//塔罗牌玩法数据变化
    UnlockHeroSkin,//解锁了英雄皮肤
    GiftBagDataChanged,//礼包数据发生了变化
    StaffSkinBagBuy,//买了员工皮肤礼包
    DayOrWeekGiftBagBuy,//每日、每周、装备礼包
    giftBagBuy,//成功购买礼包
    ChongQianLa,//玩家充值（真金）成功

    //kin任务模块所需要的事件，我为每一个任务类型都新建了一个任务专属的事件，方便监听
    TaskDataChanged,//界面刷新用，任务数据处理完了

    TaskBuidUpLevel,//建筑升级
    TaskPlayerUpLevel,//玩家升级
    TaskStaffUpLevel,//员工升级
    TaskPassBattleLevel,//通关

    TaskKillBoss,//击杀BOSS
    TaskKillMonster,//击杀小怪

    TaskLookAd,//看广告
    TaskLoginGame,//登录

    CallEqus,//召唤装备，件

    TaskKillXiaoTou,//击杀小偷
    TaskKillZuiHan,//击杀醉汉
    TaskKillFuHao,//击杀富豪

    TaskSendChuanDan,//发传单（成功发了一个）

    ShowBubble,//显示气泡，需要发送气泡类型ID，气泡显示给谁（气泡放在哪个父节点NODE）
    ShowBubbleFreeType,//自由显示气泡，发送内容，气泡显示给谁

    //用来触发引导过程的事件
    LoadSwordWeaponSucc,

    /**GM按钮显示的状态发生了变化 */
    gmBtnSatgeChaned,

    /**有一个建筑有排队异常（需要手动点击也算） */
    buildWarningSatrt,
    /**解锁一个建筑的排队异常（需要手动点击也算） */
    buildWarningOver,
}

/** 气泡事件参数 */
export enum BubbleType {
    /**英雄进去战场，是指从调度区开门以后（而非到了战斗点） */
    BubbleHeroEnterBattle = 1,
    /**英雄被击了 */
    BubbleHeroBehit = 2,
    /**英雄死亡 */
    BubbleHeroDead = 3,
    /**英雄发动攻击 */
    BubbleHeroAtk = 4,
    /*/英雄从治疗站走出来 */
    BubbleHeroOutZhiLiaoZhan = 5,
    /**英雄从训练站走出来 */
    BubbleHeroOutXunLianZhan = 6,
    /**英雄在被装配武器，和职业无关，只要是装配武器点正在装配就发 */
    BubbleHeroEquWeapon = 7,
    /**英雄在被装配帽子 */
    BubbleHeroEquHead = 8,
    /**英雄在被装配衣服 */
    BubbleHeroEquBody = 9,
    /**英雄进入调度站开始排队就发 */
    BubbleHeroLineOnDiaoDuZhan = 10,

    /**怪物出现就发 */
    BubbleMonsterEnterBattle = 101,
    /**怪物被击 */
    BubbleMonsterBehit = 102,
    /**怪物发动攻击 */
    BubbleMonsterAtk = 103,

    /**顾客/游客进入了大厅 */
    BubbleCustomerEnterDaTing = 201,
    /**顾客在窗口买完了东西 */
    BubbleCustomerBuyFinish = 202,
    /**顾客排队不耐烦离开时 */
    BubbleCustomerLineAnger = 203,
    /**顾客排队CD到一半时 */
    BubbleCustomerLineHalfTime = 204,
    /**顾客进入大厅找不到排队的地方离开时，因为所有窗口都排满了人 */
    BubbleCustomerCanNotFindLinePoint = 205,
    /** 因为酒鬼离开 */
    BubbleCustomerLeaveByDrunkard = 206,

    /**建筑开始工作时，发的NODE是相关工作人员 */
    BubbleStaffWork = 301,
    /**建筑数量+1，但是建筑满了时，发送相关工作人员的NODE，目前只有屠宰厂、3大加工厂有这个事件 */
    BubbleStaffBuildFull = 302,
}

/** 道具 */
export enum ItemId {
    Gold = 1,
    Diamond = 2,
    Key = 4,
}

/** 获取奖励的参数 */
export enum GetRewardTag {
    /** 获取的金币与玩家等级有关,需要乘金币系数 */
    GoldFactor = "GoldFactor",
}

/**
 * 引导枚举
 */
export enum EGuideType {
    None = 0,
    ///
    /** 开场战斗 */
    WelcomeBattle = 102,
    /** AVG1 */
    WelcomeBattle_2 = 103,
    /** 解锁兵线 */
    WelcomeBattle_3 = 104,
    /** 装配武器 */
    WelcomeBattle_4 = 105,
    /** 调度区 准备进战场 */
    WelcomeBattle_4_1 = 106,
    ///
    /** 救援 */
    Rescue = 107,
    /** 解锁康复区 */
    Rescue_2 = 108,
    /** 康复区AVG */
    Rescue_3 = 109,
    /** 医疗站治疗 */
    Rescue_4 = 110,
    ///
    /** 训练站解锁员工 */
    Training = 111,
    /** 解锁员工AVG */
    Training_1 = 112,
    ///
    /** 挑战boss引导 */
    KillBoss = 113,
    /** boss死亡avg */
    KillBoss_1 = 114,
    /** 解锁鸡舍 */
    KillBoss_2 = 115,
    /** 解锁鸡舍后AVG */
    KillBoss_3 = 116,
    ///
    /** 解锁枪鸡兵线 */
    UnlockGunLane = 117,

    ///
    /** 抽取武器 */
    BuyEquip = 118,

    /** 解锁生产区 AVG */
    UnlockProduce = 119,

    ///
    /** 解锁法鸡兵线 */
    UnlockMageLane = 120,

    /** 小偷第一次到来 */
    ThiefFirstCome = 130,
    /** 富豪第一次到来 */
    RichmanFirstCome = 131,
    /** 酒鬼第一次到来 */
    DrunkardFirstCome = 132,


    /** 引导点击boss */
    ClickAttackBoss = 133,


    /** 引导点击传单 */
    ClickLeaflet = 134,
}

/** 引导中的场景解锁按钮 */
export enum EGuideUnlockBtn {
    None = -1,
    /** 剑鸡兵线 */
    Sword,
    /** 康复区 */
    Rescue,
    /** 鸡舍 */
    Henhouse,
    /** 枪鸡兵线 */
    Gun,
    /** 生产区 */
    Produce,
    /** 法鸡兵线 */
    Mage,
}

/** 游戏中的加成属性枚举 */
export enum GameBuffType {
    /** 攻击力 固定值 */
    Atk = 10100,
    /** 攻击加成 百分比 */
    AtkPre = 10101,
    /** 生命值 固定值 */
    Hp = 10200,
    /** 生命加成 百分比 */
    HpPre = 10201,
    /** 闪避率 百分比 */
    Dodge = 10300,
    /** 暴击率 百分比 */
    Crit = 10400,
    /** 移动速度值 固定值 */
    HeroMoveSpeed = 10500,
    /** 移动加速 百分比 */
    HeroMoveSpeedPre = 10501,
    /** 救援队移动加速 百分比 */
    RescueTeamMoveSpeedPre = 20600,
    /** 建筑处理速度 固定值 */
    WorkTime = 30100,
    /** 建筑处理加速 百分比 */
    WorkSpeedPre = 30101,
    /** 建筑容量上限 固定值 */
    BuildMaxNum = 30200,
    /** 销售加成 百分比 */
    SellPricePre = 30300,
    /** 员工工作时间 固定值 */
    ProductionTime = 40100,
    /** 员工休息时间 固定值 */
    RestingTime = 40101,
    /** 客流量 百分比 */
    PassengerFlow = 50100,
}

/** 建筑枚举 */
export enum BuildingType {
    //战斗区
    /** 救援队 */
    RescueTeam = 101,
    /** 医疗站 */
    MedicalStation = 102,
    /** 训练室 */
    TrainingRoom = 103,
    /** 战斗调度区 */
    CombatReady = 104,
    /** 鸡舍 */
    Henhouse = 105,
    /** 剑士武器装配 */
    Sword_Weapon_EqStation = 1001,
    /** 剑士头盔装配 */
    Sword_Head_EqStation = 1002,
    /** 剑士胸甲装配 */
    Sword_Body_EqStation = 1003,
    /** 枪手武器装配 */
    Gun_Weapon_EqStation = 2001,
    /** 枪手头盔装配 */
    Gun_Head_EqStation = 2002,
    /** 枪手胸甲装配 */
    Gun_Body_EqStation = 2003,
    /** 法师武器装配 */
    Mage_Weapon_EqStation = 3001,
    /** 法师头盔装配 */
    Mage_Head_EqStation = 3002,
    /** 法师胸甲装配 */
    Mage_Body_EqStation = 3003,
    //生产区
    /** 屠宰厂 */
    Slaughterhouse = 201,
    /** 肉加工厂 */
    Meat_ProcessingPlant = 202,
    /** 皮加工厂 */
    Skin_ProcessingPlant = 203,
    /** 骨加工厂 */
    Bone_ProcessingPlant = 204,
    /** 售货窗口1 */
    SaleWindow1 = 301,
    /** 售货窗口2 */
    SaleWindow2 = 302,
    /** 售货窗口3 */
    SaleWindow3 = 303,
    /** 售货窗口4 */
    SaleWindow4 = 304,
    /** 售货窗口5 */
    SaleWindow5 = 305,
    /** 售货窗口6 */
    SaleWindow6 = 306,
    /** 肉货架 */
    Meat_CargoContainer = 401,
    /** 皮货架 */
    Skin_CargoContainer = 402,
    /** 骨货架 */
    Bone_CargoContainer = 403,
    /** 标本1 */
    Specimen1 = 908,
    /** 标本1 */
    Specimen2 = 909,
    /** 标本1 */
    Specimen3 = 910,
}

/** 顾客的特殊标记 */
export enum CustomerSpecialTagType {
    /** 传单加的顾客 */
    Leaflet,
}

/** 员工枚举 */
export enum StaffType {
    /** 迎宾小姐 */
    Greeter = 901,
    /** 保安 */
    Bouncer = 902,
}

/** 建筑当前状态 */
export enum BuildingState {
    /** 未初始化 */
    NotInit,
    /** 闲置 */
    Idle,
    /** 准备开始工作 */
    PreperWork,
    /** 工作中 未触发工作帧 */
    Work,
    /** 工作中 已触发工作帧 */
    WorkPoint,
}

export enum CharacterDirection {
    Up,
    Down,
    Left,
    Right
}

export enum CharacterAnim {
    None,
    Attack,
    Idle,
    Move,
    Dead,
}


export enum CharacterType {
    Staff = 100,
    Customer = 200,
    Soldier = 300,
    Soldier_Sword,
    Soldier_Gun,
    Soldier_Mage,
    Monster = 500,
}

export enum SpecialCharacterType {
    None,
    /** 富豪 */
    RichMan = 1,
    /** 小偷 */
    Thief = 2,
    /** 酒鬼 */
    Drunkard = 3,
}

/** 加工厂商品类型 */
export enum GoodsType {
    Meat = 1,
    Skin = 2,
    Bone = 3
}

/** 鸡的类型 */
export enum SoldierType {
    None,
    Sword = 1,
    Gun,
    Mage
}

/** 装备部位类型 */
export enum EquipType {
    Weapon = 1,
    Head,
    Body
}

/**加BUFF的时候标记的TAG ID，属性ID可以重复，但是TAG ID不可以，不同的TAGID同属性ID的BUFF会叠加 */
export enum buffTagId {
    adBuffSellAdd = 1,
    adBuffAtkAdd = 2,
    adBuffCustomerPreAdd = 3,
}

/**广告玩法的TAG ID，目前用在广告玩法的上限上，要和AdMaxNumDay表对应上 */
export enum adFunId {
    adBuffGold = 1,
    adBuffAtk = 2,
    adBuffKeliu = 3,
    adBand = 4,
    adUfo = 5,
    adTarot = 6,
    adChuanDan = 7,
}

/**打点事件 */
export enum ReportEventKey {
    /**打开APP */
    init_game_boot,
    /** 第三方SDK登陆成功*/
    init_sdk_login_success,
    /**准备加载远程配置，进度条加载 */
    init_loading_start,
    /** 远程配置加载成功*/
    init_get_config_success,
    /**远程配置加载失败 */
    init_get_config_fail,
    /**配置解析完成准备进入主界面 */
    init_loading_complete,
    /**进入了主界面 */
    init_hud_enter,
    /**发起充值，参数：商品类型（1商城商品2礼包商品）、商品ID */
    iap_start,
    /**充值成功，参数：商品类型（1商城商品2礼包商品）、商品ID */
    iap_success,
    /**取消充值，参数：商品类型（1商城商品2礼包商品）、商品ID */
    iap_list_cancel,
    /**充值失败，参数：商品类型（1商城商品2礼包商品）、商品ID */
    iap_fail,
    /**总充值额度 */
    iap_allSales,
    /**今日付费人数（去重） */
    iap_user,
    /**今日新增玩家的付费人数（去重） */
    iap_newUser,
    /**付费总次数 */
    iap_times,
    /**广告点击次数，参数：广告ID（目前用的界面名称） */
    ad_clcik,
    /**广告播放的视频次数，参数：广告ID（目前用的界面名称） */
    ad_play,
    /**广告视频完播次数，参数：广告ID（目前用的界面名称） */
    ad_finish,
    /**广告点击总次数 */
    ad_all_clcik,
    /**广告视频播放总次数 */
    ad_all_play,
    /**广告视频完播总次数 */
    ad_all_finish,
    /**进入界面，参数是界面名称 */
    wnd_enter,
    /**离开界面，参数是界面名称 */
    wnd_leave,
    /**新手引导步骤停留情况，参数是引导ID */
    guide_stay,
    /**战斗关卡的停留情况，参数是关卡ID */
    level_stay_battle,
    /**玩家等级停留情况，参数是玩家等级 */
    level_stay_player,
    /**主线任务的停留情况，参数是主线任务ID */
    task_stay_main,
    /**每日任务的完成情况，参数是每日任务的ID */
    task_finish_daily,
    /**签到发生次数 */
    sign_finish,
    /**转盘转动次数 */
    turntable_finish,
    /**乐队BUFF激活次数 */
    band_active,
    /**祝福BUFF激活次数，参数是祝福表的ID */
    adBuff_active,
    /**钻石兑换金币的次数，参数是【今日兑换次数】 */
    exchangeGold,
    /**UFO出现的次数，参数是UFO数据表ID */
    ufo_show,
    /**UF被激活的次数，参数是UFO数据表ID  */
    ufo_active,
    /**塔罗牌进入的次数，需要进入到塔罗牌玩法本身的界面 */
    tarot_enter,
    /**塔罗牌抽到黑洞的次数，参数是本次是第几波 */
    tarot_dead,
    /**塔罗牌复活的次数，参数是本次是第几波 */
    tarot_revive,
    /**塔罗牌胜利的次数，参数是本次是第几波 */
    tarot_win,
    /**传单被点击的次数 */
    leaflet_click,
    /**英雄皮肤解锁情况，参数是英雄的皮肤ID */
    heroSkin_get,
    /**商品的升级次数，参数是商品ID */
    goods_upLevel,
    /**默认员工升级/解锁的次数，参数是默认员工的ID */
    staff_default_upLevel,
    /**员工皮肤购买的次数情况，参数是员工皮肤ID */
    staff_skin_buy,
    /**三类抽装备的发生次数，参数是类型ID（1钻石大抽、2钥匙小抽、3广告抽） */
    equ_chou_times,
    /**装备获取途径清单，参数是发生时的界面名称，需要的可以追加参数 */
    equ_get_list,
    /**道具获得的途径清单，参数是发生时的界面名称，需要的可以追加参数 */
    item_get_list,
    /**道具消耗的途径清单，参数是发生时的界面名称，需要的可以追加参数 */
    item_use_list,

}
