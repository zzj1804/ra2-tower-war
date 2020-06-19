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
    resize: true
})

let lightning
function render() {
    stats.begin()

    let scale = 4 * Math.random()
    let distance = 800 * Math.random()
    let inflectionPoint = distance / 30
    let duration = 1
    let fequency = 15
    let curveFunc = function (x) {
        let e = 1 / Math.sqrt(distance)
        return 10 * e * (x * x / distance - x)
    }
    let translate = {}
    if (!lightning) {
        lightning = new Lightning(illo, translate, {}, scale, distance, inflectionPoint, duration, fequency)
    }
    if (lightning.isEnd) {
        let rotate = {
            x: Zdog.TAU * (0.5 - Math.random()),
            y: Zdog.TAU * (0.5 - Math.random()),
            z: Zdog.TAU * (0.5 - Math.random())
        }
        lightning = new Lightning(illo, translate, rotate, scale, distance, inflectionPoint, duration, fequency)
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
setGlobalTimeScale(1)
render()