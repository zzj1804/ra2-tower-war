class Laser {
    constructor(addTo, translate, rotate, scale, distance, duration) {
        let laser = this
        laser.isEnd = false
        laser.scale = scale
        laser.distance = distance
        laser.laserGroup = new Zdog.Group({
            addTo: addTo,
            translate: translate,
            rotate: rotate
        })

        laser.laser1 = new Zdog.Shape({
            addTo: laser.laserGroup,
            path: [{}, { x: distance }],
            closed: false
        })

        laser.laser2 = new Zdog.Shape({
            addTo: laser.laserGroup,
            path: [{}, { x: distance }],
            closed: false
        })

        laser.aObj1 = {
            color: 'rgba(157,240,250,1)',
            stroke: scale
        }

        laser.aObj2 = {
            color: 'rgba(255,255,255,1)',
            stroke: scale * 1.2
        }

        laser.tl = new TimelineMax({ onUpdate: () => { laser.render() }, delay: 0, onComplete: () => { laser.remove() } })
        laser.tl.to(laser.aObj1, {
            color: 'rgba(157,240,250,0.01)',
            stroke: scale * 0.9,
            ease: "expo.out",
            duration: duration
        }, 'begin').to(laser.aObj2, {
            color: 'rgba(255,255,255,0.01)',
            stroke: scale * 1.1,
            ease: "expo.out",
            duration: duration
        }, 'begin')
    }

    changeAnimeValue(model, animeObject) {
        for (const key in animeObject) {
            if (animeObject.hasOwnProperty(key) && model.hasOwnProperty(key)) {
                model[key] = animeObject[key]
            }
        }
    }

    render() {
        let laser = this
        if (!laser.isEnd) {
            laser.changeAnimeValue(laser.laser1, laser.aObj1)
            laser.changeAnimeValue(laser.laser2, laser.aObj2)
        }
    }

    remove() {
        let laser = this
        if (laser.isEnd) return
        laser.isEnd = true
        laser.laser1.remove()
        laser.laser1 = null
        laser.laser2.remove()
        laser.laser2 = null
        laser.laserGroup.remove()
        laser.laserGroup = null
        laser.tl.kill()
        laser.tl = null
        laser.aObj1 = null
        laser.aObj2 = null
    }
}