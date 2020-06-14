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
    rotate: { x: -Zdog.TAU / 12 }
})

let illo4 = new Zdog.Illustration({
    element: '#illo4',
    zoom: 1,
    resize: true,
    dragRotate: true,
    rotate: { x: -Zdog.TAU / 12 }
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
setGlobalTimeScale(1)
scale1 = 0.4
let c = new TeslaCoil(illo3, {y: 300 * scale1}, {}, scale1)
render()