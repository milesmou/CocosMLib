(()=>{
    let windowType = 'window/placeholder'
    let themeValue = getThemeStored()
    saveOriginalTheme()
    changeAnimatorStyle(themeValue)
    changedAllWindowsStyle(themeValue)
    refreshWindows()

    /* 获取插件使用后存储的主题 */
    function getThemeStored() {
        let themeDataStored = localStorage.getItem('cocos-theme-stored')
        if (!themeDataStored) {
            return null
        }

        themeDataStored = JSON.parse(themeDataStored)
        let themeName = themeDataStored.name
        // 如果主题是Default，则使用原有主题
        if (themeName == 'Default') {
            return null
        }

        let themeValue = themeDataStored.value
        return themeValue
    }

    /* 获取插件原本主题 */
    function saveOriginalTheme() {
        if (windowType.indexOf('windows/main.html') > -1) {
            // 该方法只会在插件加载时执行一次
            let originalCSS = document.head.getElementsByTagName('style')[0].textContent
            localStorage.setItem('cocos-original-theme', originalCSS)
        }
    }

    /* 刷新各个窗口 */
    function refreshWindows() {
        if (windowType.indexOf('windows/main.html') > -1) {
            let refreshIntervalId = setInterval(()=>{
                Editor.Message.broadcast('cocos-theme:refresh-windows', [])
            }, 100)

            localStorage.setItem('refresh-interval-id', refreshIntervalId)
        }
    }

    /* 额外需要执行的操作：改变动画编辑器的主题 */
    function changeAnimatorStyle(themeValue) {
        if (!themeValue) {
            return
        }
        
        setTimeout(()=>{
            let dockEle = document.querySelector('#dock')
            if (!dockEle) {
                return
            }
    
            let animatorEle = dockEle.shadowRoot.querySelector('dock-layout panel-frame[name=animator]')
            if (!animatorEle) {
                return
            }
            
            let bgColor = themeValue.split(';')[0].split(':')[1].trim()
            animatorEle.shadowRoot.querySelector('div.animator div#header').style.backgroundColor = bgColor
            animatorEle.shadowRoot.querySelector('div.animator div.container').style.backgroundColor = bgColor
        }, 100) // shadowRoot可能还没有出来，所以延迟执行
    }

    /* 改变所有窗口样式 */
    function changedAllWindowsStyle(themeValue) {
        if (!themeValue) {
            return
        }

        let styleTags = document.head.getElementsByTagName('style')
        if (styleTags.length) {
            for (let i=0; i<styleTags.length; i++) {
                styleTags[i].textContent = themeValue
            }
        }
    }

    /* 存储当前设置的主题 */
    function saveSelectedTheme(themeName, themeValue) {
        // 缓存当前设置的主题
        localStorage.setItem('cocos-theme-stored', JSON.stringify({'name': themeName, 'value': themeValue}))
    }

    /* 改变主题 */
    function changeTheme(data) {
        if (!data) {
            return
        }
        
        let themeName = data[0]
        let themeValue = null

        if (themeName == 'Default') {
            themeValue = localStorage.getItem('cocos-original-theme')
        }
        else {
            themeValue = data[1]
        }

        saveSelectedTheme(themeName, themeValue)
        changedAllWindowsStyle(themeValue)
        changeAnimatorStyle(themeValue)
    }

    function removeThemeChangedListener() {
        Editor.Message.removeBroadcastListener('cocos-theme:theme-changed', changeTheme)
    }

    try {
        // 开启插件，进行事件监听
        removeThemeChangedListener()
        Editor.Message.addBroadcastListener('cocos-theme:theme-changed', changeTheme)

        // 关停插件，移除事件监听
        Editor.Message.removeBroadcastListener('cocos-theme:remove-listener', removeThemeChangedListener)
        Editor.Message.addBroadcastListener('cocos-theme:remove-listener', removeThemeChangedListener)
    }
    catch(e) {
        
    }
})()