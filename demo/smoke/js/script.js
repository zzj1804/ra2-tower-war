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

let smoke
function render() {
    stats.begin()

    let scale = Math.random() * 2
    let translate = { x: Math.random() * 300, y: Math.random() * 300, z: Math.random() * 300 }
    if (!smoke) {
        smoke = new Smoke(illo, translate, scale)
    }
    if (smoke) {
        smoke.render()
    }
    if (smoke.isEnd) {
        smoke = new Smoke(illo, translate, scale)
    }

    illo.updateRenderGraph()
    ENV.time += ENV.timeScale

    stats.end()
}

function setGlobalTimeScale(num) {
    gsap.globalTimeline.timeScale(num)
    ENV.timeScale = num
    return ENV
}

let renderer = requestAnimationFrame(() => render())