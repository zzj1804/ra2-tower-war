const stats = new Stats()
stats.showPanel(0)
document.body.appendChild(stats.dom)

let time = 0

let illo = new Zdog.Illustration({
    element: '#illo',
    zoom: 1,
    dragRotate: true,
    resize: true
})

let animeObject = {
    color: 'orange',
    stroke: 1
}

let explosion = new Zdog.Shape({
    addTo: illo
})

let tl = new TimelineMax({ repeat: -1, onUpdate: render, delay: 0 })
tl.to(animeObject, 2, {
    color: 'rgba(255,255,255,0.3)',
    stroke: 300
})

function render() {
    stats.begin()
    
    changeAnimeValue(explosion, animeObject)
    illo.updateRenderGraph()
    ++time
    // console.log(time)

    stats.end()
}

function changeAnimeValue(model, animeObject) {
    for (const key in animeObject) {
        if (animeObject.hasOwnProperty(key) && model.hasOwnProperty(key)) {
            model[key] = animeObject[key]
        }
    }
}

let renderer = requestAnimationFrame(() => render())