window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60)
        }
})()

const stats = new Stats()
stats.showPanel(0)
document.body.appendChild(stats.dom)

const ENV = {
    time: 0,
    timeScale: 1
}

let illo = new Zdog.Illustration({
    element: '#illo',
    zoom: 1,
    dragRotate: true,
    resize: true,
    // rotate: { x: -Zdog.TAU / 8 }
})

function render() {
    stats.begin()

    let length = 150
    let lwRatio = 2
    let feq = 15
    let duration = 10
    let stroke = 10
    let scale = 0.5
    let color = '#CBCBCB'
    let translate = { x: Math.random() * 300, y: Math.random() * 300, z: Math.random() * 300 }

    if (ENV.time % 77 === 0) {
        new Spanner(illo, translate, {}, length, lwRatio, stroke, scale, color, feq, duration)
    }

    illo.updateRenderGraph()
    ENV.time += ENV.timeScale

    stats.end()
    requestAnimFrame(render)
}

function setGlobalTimeScale(num) {
    gsap.globalTimeline.timeScale(num)
    ENV.timeScale = num
    return ENV
}

render()