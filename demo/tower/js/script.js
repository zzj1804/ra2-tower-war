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

scale1 = 0.4
scale2 = 0.6
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

function getAxis(addTo, scale) {
    let axis = new Zdog.Group({
        addTo: addTo,
        scale: scale
    })

    new Zdog.Shape({
        addTo: axis,
        path: [
            { x: -40, y: 0 },
            { x: 40, y: 0 },
            { y: -5, x: 40 },
            { y: 0, x: 45 },
            { y: 5, x: 40 },
            { y: 0, x: 40 }
        ],
        closed: false,
        stroke: 3,
        color: 'red',
    })

    new Zdog.Shape({
        addTo: axis,
        path: [
            { x: 0, y: -40 },
            { x: 0, y: 40 },
            { x: -5, y: 40 },
            { x: 0, y: 45 },
            { x: 5, y: 40 },
            { x: 0, y: 40 }
        ],
        closed: false,
        stroke: 3,
        color: 'yellow',
    })

    new Zdog.Shape({
        addTo: axis,
        path: [
            {},
            { z: 40 },
            { x: -5, z: 40 },
            { x: 0, z: 45 },
            { x: 5, z: 40 },
            { x: 0, z: 40 }
        ],
        closed: false,
        stroke: 3,
        color: 'blue',
    })

    return axis
}

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

let c = new TeslaCoil(illo3, {}, {}, scale1, 'red')
c.build()
let r = new PrismTower(illo4, {}, {}, scale2, 'blue')
r.build()
let t3 = new Target(illo3, { x: -10, y: -100, z: 200 }, {})
let t4 = new Target(illo4, {}, {})

let axis1 = getAxis(c.model, 10)
let axis2 = getAxis(r.model, 10)

render()
displayLoadingLayer(false)
timedRandomTarget()

function timedRandomTarget() {
    t3.changeCenterPoint({ x: (Math.random()-0.5) * 300, y: (Math.random()-0.8) * 300, z: (Math.random()-0.5) * 300 })
    t4.changeCenterPoint({ x: (Math.random()-0.5) * 300, y: (Math.random()-0.8) * 300, z: (Math.random()-0.5) * 300 })
    c.target = t3
    c.loading()
    r.target = t4
    r.loading()
    setTimeout("timedRandomTarget()", 5000 / ENV.timeScale)
}