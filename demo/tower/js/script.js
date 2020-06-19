window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60)
        }
})()

const ENV = {
    time: 0,
    timeScale: 1
}

let illo3 = new Zdog.Illustration({
    element: '#illo3',
    zoom: 1,
    resize: true,
    dragRotate: true,
    rotate: { x: -Zdog.TAU / 6, y: 0, y: Zdog.TAU / 8 }
})

let illo4 = new Zdog.Illustration({
    element: '#illo4',
    zoom: 1,
    resize: true,
    dragRotate: true,
    rotate: { x: -Zdog.TAU / 6, y: 0, y: Zdog.TAU / 8 }
})

scale1 = 0.4
scale2 = 0.4
new Zdog.Polygon({
    addTo: illo3,
    radius: 200,
    sides: 5,
    stroke: 10,
    color: 'rgba(0,200,100,0.9)',
    fill: true,
    rotate: { x: -Zdog.TAU / 4 },
    translate: { y: 320 * scale1 }
})
new Zdog.Polygon({
    addTo: illo4,
    radius: 200,
    sides: 5,
    stroke: 10,
    color: 'rgba(0,100,100,0.9)',
    fill: true,
    rotate: { x: -Zdog.TAU / 4 },
    translate: { y: 320 * scale2 }
})

function render() {
    illo3.updateRenderGraph()
    illo4.updateRenderGraph()
    ENV.time += ENV.timeScale
    requestAnimFrame(render)
}

function setGlobalTimeScale(num) {
    gsap.globalTimeline.timeScale(num)
    ENV.timeScale = num
    return ENV
}

function displayLoadingLayer(p) {
    if (p) {
        document.getElementById('loading-layer').style.display = 'flex'
    } else {
        document.getElementById('loading-layer').style.display = 'none'
    }
}


setGlobalTimeScale(1)

let c = new TeslaCoil(illo3, { y: 300 * scale1 }, {}, scale1, 'red')
c.build()
let t3 = new Target(illo3, { x: 220 }, {})
let t4 = new Target(illo4, {}, {})

render()
displayLoadingLayer(false)