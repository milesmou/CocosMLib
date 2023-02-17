
import { resources, Sprite, tween, _decorator } from 'cc';
import { app } from '../../mlib/App';
import { AssetMgr } from '../../mlib/manager/AssetMgr';
import { UIBase } from '../../mlib/ui/UIBase';
const { ccclass, property } = _decorator;

@ccclass('UIHUD')
export class UIHUD extends UIBase {
    @property(Sprite)
    bg1!: Sprite;

    onLoad() {
        // Utils.loadSprite(this.bg1, "texture/bg1");
        // Utils.loadSprite(this.bg1,"https://yourdomain.com/1.jpg");
        AssetMgr.loadSpriteFrame("texture/bg1/spriteFrame").then(s => {
            console.log("加载成功");
            console.log(s);
            console.log(resources);
            AssetMgr.loadSpriteFrame("texture/bg1/spriteFrame");

        }).catch(e => {
            console.log("加载失败");
            console.log(e);
        });

        let a={a:1};
        tween(a).to(3, { a: 100 },{onComplete(target?) {
            console.log(a.a);
            
        },}).start();

        // AssetMgr.loadAsset("texture/bg1/texture", null).then(s => {
        //     console.log("加载成功1");
        //     console.log(s);

        // }).catch(e => {
        //     console.log("加载失败1");
        //     console.log(e);
        // });


        // AssetMgr.loadRemoteAsset("https://fanthen-cn.oss-cn-hangzhou.aliyuncs.com/GangsterLover/Channel/FanQSIOSA3/1.0.1/GameConfig.txt")
        //     .then(v => {
        //         console.log(v);

        //     }).catch(e => {
        //         console.log(e);
        //     });
        AssetMgr.loadRemoteSpriteFrame("https://fanthen-cn.oss-cn-hangzhou.aliyuncs.com/GangsterLover/Resources/Pic/Wallpaper/100102.png")
            .then(v => {

                console.log(v);

            }).catch(e => {
                console.log(e);
            });

    }

    onClickAudioMgr() {
        app.ui.show(app.uiKey.UIAudioMgr);
    }

    onClickUIMgr() {
        app.ui.show(app.uiKey.UIUIMgr);
    }

    onClickGuide() {
        app.ui.show(app.uiKey.UIGuideTest1);
    }
}


