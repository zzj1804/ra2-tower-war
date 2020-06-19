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

let laser
function render() {
    stats.begin()

    let scale = 100 * Math.random()
    let distance = 800 * Math.random()
    let translate = {}
    let duration = 3

    if (laser === undefined) {
        laser = new Laser(illo, translate, {}, scale, distance, duration)
    }
    if (laser.isEnd) {
        let rotate = {
            x: Zdog.TAU * (0.5 - Math.random()),
            y: Zdog.TAU * (0.5 - Math.random()),
            z: Zdog.TAU * (0.5 - Math.random())
        }
        laser = new Laser(illo, translate, rotate, scale, distance, duration)
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