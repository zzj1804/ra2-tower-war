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

    let scale = 4
    let distance = 400
    let translate = {}
    if (!lightning) {
        lightning = new Lightning(illo, translate, scale, distance)
    }
    if (lightning) {
        lightning.render()
    }
    if (lightning.isEnd) {
        lightning = new Lightning(illo, translate, scale, distance)
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
setGlobalTimeScale(1)
let renderer = requestAnimationFrame(() => render())