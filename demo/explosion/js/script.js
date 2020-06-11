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

class Explosion {
    constructor(addTo, translate) {
        let expl = this
        expl.isEnd = false
        expl.explosionGroup = new Zdog.Group({
            addTo: addTo,
            translate: translate
        })

        expl.aObj1 = {
            color: 'orange',
            stroke: 1
        }

        expl.aObj2 = {
            color: 'red',
            stroke: 1,
            pathY: 10
        }

        expl.explosion1 = new Zdog.Shape({
            addTo: expl.explosionGroup
        })

        expl.explosion2 = new Zdog.Shape({
            addTo: expl.explosionGroup
        })

        expl.tl = new TimelineMax({ repeat: 1, onUpdate: render, delay: 0 })
        expl.tl.to(expl.aObj1, 2, {
            color: 'rgba(255,255,255,0.01)',
            stroke: 300,
            ease: "power4.out"
        }).to(expl.aObj2, 2, {
            color: 'rgba(255,255,255,0.01)',
            stroke: 200,
            ease: "power4.out"
        }, "-=2").call(() => {
            expl.kill()
        })
    }

    render() {
        let expl = this
        if (!expl.isEnd) {
            changeAnimeValue(expl.explosion1, expl.aObj1)
            changeAnimeValue(expl.explosion2, expl.aObj2)
        }
    }

    kill(){
        let expl = this
        expl.isEnd = true
        expl.explosion1.remove()
        expl.explosion1 = null
        expl.explosion2.remove()
        expl.explosion2 = null
        expl.explosionGroup.remove()
        expl.explosionGroup = null
        expl.tl.kill()
        expl.tl = null
        expl.aObj1 = null
        expl.aObj2 = null
    }
}
let explosion
function render() {
    stats.begin()

    let translate = { x: Math.random() * 500, y: Math.random() * 500, z: Math.random() * 500 }
    if (!explosion) {
        explosion = new Explosion(illo, translate)
    }
    if (explosion) {
        explosion.render()
    }
    if (explosion.isEnd) {
        explosion = new Explosion(illo, translate)
    }

    illo.updateRenderGraph()
    ++time

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