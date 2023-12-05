(()=>{
    // 清除计时器
    clearInterval(localStorage.getItem('refresh-interval-id'))

    let originalTheme = localStorage.getItem('cocos-original-theme')
    if (!originalTheme) {
        return
    }

    // 改变动画编辑器的header和container
    // shadowRoot可能还没有出来，所以延迟执行
    setTimeout(()=>{
        let dockEle = document.querySelector('#dock')
        if (!dockEle) {
            return
        }

        let animatorEle = dockEle.shadowRoot.querySelector('dock-layout panel-frame[name=animator]')
        if (!animatorEle) {
            return
        }

        animatorEle.shadowRoot.querySelector('div.animator div#header').style.backgroundColor = ''
        animatorEle.shadowRoot.querySelector('div.animator div.container').style.backgroundColor = ''
    }, 100)

    // 改变所有窗口样式
    let styleTags = document.head.getElementsByTagName('style')
    if (styleTags.length) {
        for (let i=0; i<styleTags.length; i++) {
            styleTags[i].textContent = originalTheme
        }
    }
})()