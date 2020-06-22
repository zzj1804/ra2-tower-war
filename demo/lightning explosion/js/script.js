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

let explosion
function render() {
    stats.begin()

    let scale = 0.5
    let duration = 1
    let feq = duration * 3
    let num = 10
    let translate = { x: Math.random() * 300, y: Math.random() * 300, z: Math.random() * 300 }
    if (!explosion) {
        explosion = new LightningExplosion(illo, translate, scale, duration, feq, num)
    }
    if (explosion.isEnd) {
        explosion = new LightningExplosion(illo, translate, scale, duration, feq, num)
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