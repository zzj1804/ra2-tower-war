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

})

let model = new Zdog.Cylinder({
    addTo: illo,
    diameter: 150,
    translate: { y: -55 },
    rotate: { x: Zdog.TAU / 8 },
    length: 100,
    color: 'red',
    backface: '#E62',
    stroke: 0
})

let aniArr = []

let animeObj1 = {
    length: 100,
    diameter: 150,
    color: 'red',
    stroke: 0,
}

let animeObj2 = {
    translate_y: 0,
    add_rotate_y: 0.03,
    backface: '#E62'
}

aniArr.push(animeObj1)
aniArr.push(animeObj2)

let tl = gsap.timeline({
    repeat: -1, yoyo: true, onUpdate: () => {
        model = recreateWithAnimeValue(model, aniArr[0])
        changeAnimeValue(model, aniArr[1])
    }
})
tl.addLabel('start')
tl.to(animeObj1, { duration: 10, length: 10, diameter: 300, stroke: 20, color: '#000' }, 'start')
tl.to(animeObj2, { duration: 10, translate_y: 200, backface: 'white' }, 'start')

function render() {
    stats.begin()

    illo.updateRenderGraph()
    ENV.time += ENV.timeScale

    stats.end()
    requestAnimFrame(render)
}

function changeAnimeValue(model, animeObject) {
    for (const key in animeObject) {
        if (animeObject.hasOwnProperty(key)) {
            const aObjVal = animeObject[key]
            const keyArr = key.split('_')
            const isAdd = keyArr[0] === 'add'
            const start = isAdd ? 1 : 0
            let element = model
            for (let i = start; i < keyArr.length; i++) {
                let k = keyArr[i]
                if (element.hasOwnProperty(k)) {
                    if (i === keyArr.length - 1) {
                        if (isAdd) {
                            element[k] += aObjVal
                        } else {
                            element[k] = aObjVal
                        }
                    } else {
                        element = element[k]
                    }
                } else {
                    break
                }
            }
        }
    }
}

function recreateWithAnimeValue(model, animeObject) {
    let newModel = model.copy(animeObject)
    model.remove()
    return newModel
}

function setGlobalTimeScale(num) {
    gsap.globalTimeline.timeScale(num)
    ENV.timeScale = num
    return ENV
}
setGlobalTimeScale(1)
render()