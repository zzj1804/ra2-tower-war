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

function render() {
    stats.begin()

    let scale = 30
    let num = 30
    let speed = 0.5
    let duration = 20
    let translate = { x: Math.random() * 300, y: Math.random() * 300, z: Math.random() * 300 }

    if(ENV.time % 20 === 0) {
        new Smoke(illo, translate, scale, num, speed, duration)
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