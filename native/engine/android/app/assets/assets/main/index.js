System.register("chunks:///_virtual/migrate-canvas.ts",["cc"],(function(){"use strict";var e,t,n,i,o,r;return{setters:[function(c){e=c.cclegacy,t=c.director,n=c.Director,i=c.Canvas,o=c.Camera,r=c.game}],execute:function(){e._RF.push({},"6dbda9PSt9AJ6AIBvP9icrc","migrate-canvas",void 0);const c=1048575;function a(e,t){for(let n=0,i=e.children.length;n<i;n++)e.children[n].layer=t,a(e.children[n],t)}t.on(n.EVENT_AFTER_SCENE_LAUNCH,(()=>{var e,n,l;const s=null===(e=t.getScene())||void 0===e?void 0:e.children;let m=null===(n=t.getScene())||void 0===n?void 0:n.getComponentsInChildren(i);if(m.length<=1)return;m=m.filter((e=>!!e.cameraComponent));let d=null===(l=t.getScene())||void 0===l?void 0:l.getComponentsInChildren(o),p=0;d.forEach((e=>p|=e.visibility&c));const v=[];for(let e=0,t=s.length;e<t;e++){const t=s[e];if(!r.isPersistRootNode(t))continue;const n=t.getComponentsInChildren(i);0!==n.length&&v.push(...n.filter((e=>!!e.cameraComponent)))}v.forEach((e=>{if(m.find((t=>t!==e&&t.cameraComponent.visibility&e.cameraComponent.visibility&c))){const t=~p,n=t&~(t-1);e.cameraComponent.visibility=n|4293918720&e.cameraComponent.visibility,a(e.node,n),p|=t}}))}));let l=cc.Node.prototype.setParent;function s(e){let t=null,n=e.getComponent(i);return n&&n.cameraComponent?(t=n.cameraComponent.visibility&n.node.layer?n.node.layer:n.cameraComponent.visibility&~(n.cameraComponent.visibility-1),t):(e.parent&&(t=s(e.parent)),t)}cc.Node.prototype.setParent=function(e,t){if(l.call(this,e,t),!e)return;let n=s(this);n&&(this.layer=n,a(this,n))},e._RF.pop()}}}));

System.register("chunks:///_virtual/TestVideoPlayer.ts",["cc"],(function(e){"use strict";var i,r,t,l;return{setters:[function(e){i=e.cclegacy,r=e.VideoPlayer,t=e._decorator,l=e.Component}],execute:function(){var a,n,o,c,u;i._RF.push({},"a4558uQUwtJK7mK8YWQE30A","TestVideoPlayer",void 0);const{ccclass:s,property:d}=t;e("TestVideoPlayer",(a=s("TestVideoPlayer"),n=d(r),a((u=function(e,i,r,t,l){var a={};return Object.keys(t).forEach((function(e){a[e]=t[e]})),a.enumerable=!!a.enumerable,a.configurable=!!a.configurable,("value"in a||a.initializer)&&(a.writable=!0),a=r.slice().reverse().reduce((function(r,t){return t(e,i,r)||r}),a),l&&void 0!==a.initializer&&(a.value=a.initializer?a.initializer.call(l):void 0,a.initializer=void 0),void 0===a.initializer&&(Object.defineProperty(e,i,a),a=null),a}((c=class extends l{constructor(...e){super(...e),function(e,i,r,t){r&&Object.defineProperty(e,i,{enumerable:r.enumerable,configurable:r.configurable,writable:r.writable,value:r.initializer?r.initializer.call(t):void 0})}(this,"videoPlayer",u,this)}onClickBtn(){this.videoPlayer.isPlaying?this.videoPlayer.pause():this.videoPlayer.play()}}).prototype,"videoPlayer",[n],{configurable:!0,enumerable:!0,writable:!0,initializer:null}),o=c))||o));i._RF.pop()}}}));

System.register("chunks:///_virtual/main",["./migrate-canvas.ts","./TestVideoPlayer.ts"],(function(){"use strict";return{setters:[function(){},function(){}],execute:function(){}}}));

(function(r) {
  r('virtual:///prerequisite-imports/main', 'chunks:///_virtual/main'); 
})(function(mid, cid) {
    System.register(mid, [cid], function (_export, _context) {
    return {
        setters: [function(_m) {
            var _exportObj = {};

            for (var _key in _m) {
              if (_key !== "default" && _key !== "__esModule") _exportObj[_key] = _m[_key];
            }
      
            _export(_exportObj);
        }],
        execute: function () { }
    };
    });
});