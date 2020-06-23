window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60)
        }
})()

const MAP_GRID_NUM = 10
const MAP_GRID_LENGTH = 100
const DEFAULT_ILLO_ZOOM = 0.1

const ENV = {
    time: 0,
    timeScale: 1
}

let isPlaying = true

const stats = new Stats()

let map
let video = document.createElement('video')
video.muted = true

let illoOption = {
    isDragRotate: false,
    maxZoom: 15,
    minZoom: 0.001,
    stats: false
}

let illo = new Zdog.Illustration({
    element: '.zdog-canvas',
    zoom: DEFAULT_ILLO_ZOOM,
    resize: true
})

let illoAnchor = new Zdog.Anchor({
    addTo: illo
})

// event start
// drag event
let dragStartX, dragStartY
new Zdog.Dragger({
    startElement: illo.element,
    onDragStart: function (pointer) {
        if (illoOption.isDragRotate) {
            dragStartX = illoAnchor.rotate.x
            dragStartY = illoAnchor.rotate.y
        } else {
            dragStartX = illoAnchor.translate.x
            dragStartY = illoAnchor.translate.y
        }
    },
    onDragMove: function (pointer, moveX, moveY) {
        if (illoOption.isDragRotate) {
            let displaySize = Math.min(illo.width, illo.height)
            let moveRY = moveX / displaySize * Zdog.TAU
            let moveRX = moveY / displaySize * Zdog.TAU
            illoAnchor.rotate.x = dragStartX - moveRX
            illoAnchor.rotate.y = dragStartY - moveRY
        } else {
            illoAnchor.translate.x = dragStartX + moveX / illo.zoom
            illoAnchor.translate.y = dragStartY + moveY / illo.zoom
        }
    },
    onDragEnd: function () { }
})

// wheel to zoom
illo.element.addEventListener("wheel", e => {
    let rate = illo.zoom / 20
    let zoom = illo.zoom - (e.deltaY > 0 ? 1 : -1) * rate
    if (zoom > illoOption.maxZoom) zoom = illoOption.maxZoom
    if (zoom < illoOption.minZoom) zoom = illoOption.minZoom
    illo.zoom = zoom
}, false)

document.getElementById('center-button').addEventListener('click', () => {
    resetPosition()
}, false)

document.getElementById('play-button').addEventListener('click', (e) => {
    switchPlayAndPause()
    let btn = e.srcElement
    if (isPlaying) {
        btn.innerHTML = 'play'
    } else {
        btn.innerHTML = 'pause'
    }
}, false)

document.getElementById('time-scale-button').addEventListener('click', (e) => {
    let btn = e.srcElement
    switch (ENV.timeScale) {
        case 1:
            setGlobalTimeScale(2)
            break
        case 2:
            setGlobalTimeScale(0.5)
            break
        case 0.5:
            setGlobalTimeScale(1)
            break
    }

    btn.innerHTML = ENV.timeScale + 'X'
}, false)

const BUILD_MODE = {
    PT: 'prism-tower',
    TC: 'tesla-coil',
    SELL: 'sell',
    NONE: 'none'
}
let buildMode = BUILD_MODE.NONE
document.getElementById('build-pt-button').addEventListener('click', () => {
    if (buildMode === BUILD_MODE.NONE || buildMode !== BUILD_MODE.PT) {
        buildMode = BUILD_MODE.PT
    } else {
        buildMode = BUILD_MODE.NONE
    }
    switchBuildMode()
}, false)
document.getElementById('build-tc-button').addEventListener('click', () => {
    if (buildMode === BUILD_MODE.NONE || buildMode !== BUILD_MODE.TC) {
        buildMode = BUILD_MODE.TC
    } else {
        buildMode = BUILD_MODE.NONE
    }
    switchBuildMode()
}, false)
document.getElementById('sell-button').addEventListener('click', () => {
    if (buildMode === BUILD_MODE.NONE || buildMode !== BUILD_MODE.SELL) {
        buildMode = BUILD_MODE.SELL
    } else {
        buildMode = BUILD_MODE.NONE
    }
    switchBuildMode()
}, false)


// event end

function resetPosition() {
    illoAnchor.translate = new Zdog.Vector({})
    illoAnchor.rotate = new Zdog.Vector({})
}

function switchPlayAndPause() {
    isPlaying = !isPlaying
    if (isPlaying) {
        gsap.globalTimeline.play()
    } else {
        gsap.globalTimeline.pause()
    }
}

function switchBuildMode() {
    let ptBtn = document.getElementById('build-pt-button')
    let tcBtn = document.getElementById('build-tc-button')
    let sellBtn = document.getElementById('sell-button')
    switch (buildMode) {
        case BUILD_MODE.PT:
            switchBtnActive(ptBtn, true)
            switchBtnActive(tcBtn, false)
            switchBtnActive(sellBtn, false)
            break
        case BUILD_MODE.TC:
            switchBtnActive(ptBtn, false)
            switchBtnActive(tcBtn, true)
            switchBtnActive(sellBtn, false)
            break
        case BUILD_MODE.SELL:
            switchBtnActive(ptBtn, false)
            switchBtnActive(tcBtn, false)
            switchBtnActive(sellBtn, true)
            break
        case BUILD_MODE.NONE:
            switchBtnActive(ptBtn, false)
            switchBtnActive(tcBtn, false)
            switchBtnActive(sellBtn, false)
            break
    }
}

function setGlobalTimeScale(v) {
    ENV.timeScale = v
    gsap.globalTimeline.timeScale(v)
}

function switchBtnActive(btn, v) {
    if (v) {
        btn.className += ' active'
    } else {
        btn.className = btn.className.replace(' active', '')
    }
}

function createOptionGUI() {
    let gui = new dat.GUI()
    gui.open()
    let illoFolder = gui.addFolder('illo')
    illoFolder.open()
    // zoom
    illoFolder.add(illo, 'zoom', illoOption.minZoom, illoOption.maxZoom).listen().onChange(v => illo.zoom = v)
    // drag
    illoFolder.add(illoOption, 'isDragRotate').listen()
    // stats
    illoFolder.add(illoOption, "stats").listen().onChange(v => changeStats(v))

    return gui
}

function displayLoadingLayer(p) {
    if (p) {
        document.getElementById('loading-layer').style.display = 'flex'
    } else {
        document.getElementById('loading-layer').style.display = 'none'
    }
}

function changeStats(v) {
    illoOption.stats = v
    if (illoOption.stats) {
        document.body.appendChild(stats.dom)
    } else {
        stats.dom.parentNode.removeChild(stats.dom)
    }
}

function setGlobalTimeScale(num) {
    gsap.globalTimeline.timeScale(num)
    ENV.timeScale = num
    return ENV
}

async function switchPip() {
    try {
        if (document.pictureInPictureElement) {
            await document.exitPictureInPicture()
            video.pause()
            video.srcObject = null
        } else {
            video.srcObject = illo.element.captureStream(14)
            await video.play()
            await video.requestPictureInPicture()
        }
    } catch (error) {
        alert('browser not support PictureInPicture')
    }
}

function render() {
    stats.begin()

    illo.updateRenderGraph()
    if (isPlaying) {
        ENV.time += ENV.timeScale
    }

    stats.end()

    requestAnimFrame(render)
}

// init
map = new IsometricMap(illo, illoAnchor, MAP_GRID_NUM, MAP_GRID_LENGTH, 'rgba(240, 200, 255, 0.95)')
createOptionGUI()
render()
displayLoadingLayer(false)