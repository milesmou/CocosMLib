/****************************************************************************
 Copyright (c) 2017-2020 SuperSuRaccoon
 
 Site: http://www.supersuraccoon-cocos2d.com
 Mail: supersuraccoon@gmail.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/
 
var ssr = ssr || {};

ssr.PostProcessingFX = ssr.PostProcessingFX || {};

/**
 * FBO 更新模式枚举变量
 * @enum ssr.PostProcessingFX.Component._updateMode
 * @static
 * @private
 * @namespace ssr.PostProcessingFX.Component
 */
ssr.PostProcessingFX.UpdateMode = cc.Enum({
	/**
     * 仅更新一次
     * @property {Number} ONCE
     * @static
     */
    ONCE 		: 0,
    /**
     * 同步更新
     * @property {Number} ONCE
     * @static
     */
    ALWAYS		: 1,
    /**
     * 每N个DT更新一次
     * @property {Number} ONCE
     * @static
     */
    INTERVAL    : 2,
    /**
     * 使用者按需手动更新
     * @property {Number} ONCE
     * @static
     */
    MANUAL      : 3
});

module.exports = ssr.PostProcessingFX.UpdateMode;

/**
 * ssr.PostProcessingFX.Component 组件基类，用于
 * @class ssr.PostProcessingFX.Component
 * @extends Component
 */
ssr.PostProcessingFX.Component = cc.Class({
    extends: cc.Component,
    editor: CC_EDITOR && {
        menu: 'ssr/PostProcessingFX/Component',
        executeInEditMode: false,
    },
    properties: {
    	/**
	     * 在编辑器模式下开启实时刷新预览
	     * @property {Boolean} preview
	     * @default true
	     */
    	preview: {
	        default: true,
	        editorOnly: true,
	        notify: CC_EDITOR && function () {
	            if (this.preview) {
	            	this.updateFBO();
	            }
	        },
	        tooltip: "是否在在编辑器中预览"
	    },
		_updateMode: ssr.PostProcessingFX.UpdateMode.ALWAYS,
		/**
	     * FBO 对象默认的更新模式
	     * @property {UpdateMode} updateMode
	     * @default UpdateMode.ALWAYS
	     */
		updateMode: {
		    type: ssr.PostProcessingFX.UpdateMode,
		    get () {
		        return this._updateMode;
		    },
		    set (val) {
		        this._updateMode = val;
                this._dtCounter = 0;
		    },
		    tooltip: "更新模式，默认实时更新"
		},
        _updateInterval: 5,
        updateInterval: {
            type: cc.Integer,
            get () {
                return this._updateInterval;
            },
            set (val) {
                this._updateInterval = val;
                this._dtCounter = 0;
            },
            tooltip: "更新间隔 dt"
        },
        /**
         * FBO 对象默认所属节点的分组。同 cc.Node 的 group 属性
         * @property {String} group
         * @default fbo
         */
        group: {
            default: "post-fx",
            tooltip: "FBO 节点专用的分组名称"
        },
        /**
         * FBO 进行纹理抓取时，会设置的分组中的节点进行排除，比如 UI 界面的元素
         * @property {Array<String>} groupFilters
         * @default fbo
         */
        groupFilters: {
            type: [cc.String],
            default: [],
            tooltip: "FBO 排除节点的分组"
        },
    },
    /**
     * 初始化内部数据
     * @method _initData
     * @private
     */
    _initData () {
    	this._isPaused = false;
    },
    /**
     * 初始化 RenderTexture 对象
     * @method _initFBORenderTexture
     * @private
     */
	_initFBORenderTexture () {
		if (!this._renderTexture) {
			this._renderTexture = new cc.RenderTexture();
            this._renderTexture.initWithSize(cc.Canvas.instance.node.width, cc.Canvas.instance.node.height, cc.gfx.RB_FMT_S8);
		}
	},
	/**
     * 初始化 FBO 最终渲染目标对象 cc.Sprite
     * @method _initFBOSprite
     * @private
     */
	_initFBOSprite () {
		this._fboSprite = this.node.getComponent(cc.Sprite);
		if (!this._fboSprite) {
			this._fboSprite = this.node.addComponent(cc.Sprite);
		}
		if (!this._fboSprite.spriteFrame) {
			var fboSpriteFrame = new cc.SpriteFrame();
		    this._fboSprite.spriteFrame = fboSpriteFrame;
            this._fboSprite.spriteFrame.setFlipY(true);
		}
	},
	/**
     * 初始化 FBO 专用 cc.Camera
     * @method _initFBOCamera
     * @private
     */
	_initFBOCamera () {
		this._fboCamera = this.node.getComponent(cc.Camera);
		if (!this._fboCamera) {
			this._fboCamera = this.node.addComponent(cc.Camera);
		}
		this._fboCamera.depth = 0;
		this._fboCamera.clearFlags = cc.Camera.ClearFlags.COLOR;
		this._fboCamera.targetTexture = this._renderTexture;
		this._fboCamera.enabled = false;
        //
        this._fboCamera.cullingMask = 0xffffffff;
        this._fboCamera.cullingMask &= ~(1 << this.node.groupIndex);
        for (var i = 0; i < this.groupFilters.length; i++) {
            let groupIndex = cc.game.groupList.indexOf(this.groupFilters[i]);
            if (groupIndex != -1) {
                this._fboCamera.cullingMask &= ~(1 << groupIndex);
            }
            else {
                cc.warn("GroupFilters >>> 分组: " + this.groupFilters[i] + " 并不存在!");
            }
        }
	},
    /**
     * onLoad 生命周期函数，将本 cc.Node 的 group 切换为用户指定的分组
     * @method onLoad
     */
	onLoad () {
		this.node.group = this.group;
        this.node.width = cc.Canvas.instance.node.width;
        this.node.height = cc.Canvas.instance.node.height;
	},
	/**
     * start 生命周期函数，初始化一些内部用对象，调用一次更新 FBO 函数 (UpdateMode.ONCE 模式仅此一次调用)
     * @method start
     */
    start () {
    	this._initData();
     	this._initFBORenderTexture();
     	this._initFBOSprite();
     	this._initFBOCamera();
        //
        this._dtCounter = 0;
     	this.updateFBO();
    },
    /**
     * 更新 RenderTexture 大小
     * @method _updateRenderTextureSize
     * @private
     */
    _updateRenderTextureSize(width, height) {
    	if (!this._renderTexture) {
			return;
    	}
    	if (window.jsb) {
    		// https://forum.cocos.org/t/cc-rendertexture-updatesize/99634
    		// this._renderTexture.destroy();
    		// this._renderTexture = new cc.RenderTexture();
    		// this._renderTexture.initWithSize(width, height, cc.gfx.RB_FMT_S8);	
            this._renderTexture.updateSize(width, height);
    	}
    	else {
    		this._renderTexture.updateSize(width, height);
    	}
    },
    /**
     * update 生命周期函数，每帧调用，更新 FBO (UpdateMode.ALWAYS 模式每帧调用)
     * @method update
     */
    update () {
    	if (CC_EDITOR && !this.preview) {
            return;
        }
        if (this._isPaused) {
        	return;
        }
    	if (this.updateMode == ssr.PostProcessingFX.UpdateMode.ALWAYS) {
    		this.updateFBO();
    	}
        else if (this.updateMode == ssr.PostProcessingFX.UpdateMode.INTERVAL) {
            this._dtCounter += 1;
            if (this._dtCounter == this.updateInterval) {
                this.updateFBO();
                this._dtCounter = 0;
            }
        }
    },
    /**
     * 刷新一次 FBO 并将其渲染到 cc.Sprite 对象中
     * @method updateFBO
     */
	updateFBO () {
		if (CC_EDITOR && !this.preview) {
            return;
        }
        if(!this._fboCamera) return;
		this._fboCamera.enabled = true;
		this._fboCamera.render(this.target);
		this._fboSprite.spriteFrame.setTexture(this._renderTexture);
		this._fboCamera.enabled = false;
	},
	/**
     * 暂停刷新
     * @method pause
     */
    pause () {
    	this._isPaused = true;
    },
    /**
     * 继续刷新
     * @method resume
     */
    resume () {
    	this._isPaused = false;
    }
});

