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
    zoom: 0.5,
    resize: true,
    dragRotate: true,
    rotate: { x: -Zdog.TAU / 6, y: 0, y: Zdog.TAU / 8 }
})

let illo4 = new Zdog.Illustration({
    element: '#illo4',
    zoom: 0.5,
    resize: true,
    dragRotate: true,
    rotate: { x: -Zdog.TAU / 6, y: 0, y: Zdog.TAU / 8 }
})

new Zdog.Polygon({
    addTo: illo3,
    radius: 200,
    sides: 5,
    stroke: 10,
    color: 'rgba(0,200,100,0.9)',
    fill: true,
    rotate: { x: -Zdog.TAU / 4 }
})
new Zdog.Polygon({
    addTo: illo4,
    radius: 200,
    sides: 5,
    stroke: 10,
    color: 'rgba(0,100,100,0.9)',
    fill: true,
    rotate: { x: -Zdog.TAU / 4 },
    translate: { y: 5 }
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

let c = new TeslaCoil(illo3, {}, {}, 0.6, 'red')
c.build()
let r = new PrismTower(illo4, {}, {}, 0.9, 'blue')
r.build()
let t3 = new Target(illo3, {}, {})
let t4 = new Target(illo4, {}, {})

render()
displayLoadingLayer(false)
timedRandomTarget()

function timedRandomTarget() {
    t3.changeCenterPoint({ x: Math.random() * 200, y: -Math.random() * 300, z: Math.random() * 200 })
    t4.changeCenterPoint({ x: Math.random() * 200, y: -Math.random() * 300, z: Math.random() * 200 })
    c.target = t3
    c.loading()
    r.target = t4
    r.loading()
    setTimeout("timedRandomTarget()", 5000 / ENV.timeScale)
}

document.getElementById('attack-tc').addEventListener('click', () => {
    c.target = t3
    c.loading()
})

document.getElementById('attack-pt').addEventListener('click', () => {
    r.target = t4
    r.loading()
})

document.getElementById('sell-tc').addEventListener('click', () => {
    c.sell()
})

document.getElementById('sell-pt').addEventListener('click', () => {
    r.sell()
})

document.getElementById('damage-tc').addEventListener('click', () => {
    c.getDamage(100)
})

document.getElementById('damage-pt').addEventListener('click', () => {
    r.getDamage(100)
})