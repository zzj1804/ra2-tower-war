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

    let scale = Math.random() * 2
    let translate = { x: Math.random() * 300, y: Math.random() * 300, z: Math.random() * 300 }
    if (!explosion) {
        explosion = new Explosion(illo, translate, scale)
    }
    if (explosion) {
        explosion.render()
    }
    if (explosion.isEnd) {
        explosion = new Explosion(illo, translate, scale)
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