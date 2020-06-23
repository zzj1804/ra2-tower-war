class LightningExplosion {
    constructor(addTo, translate, scale, duration, frequency, perFreqNum) {
        let expl = this
        expl.isEnd = false
        expl.explosionGroup = new Zdog.Group({
            addTo: addTo,
            translate: translate
        })

        expl.modelArr = []
        expl.aniObjArr = []

        expl.tl = new TimelineMax({ onUpdate: () => { expl.render() }, onComplete: () => { expl.remove() } })
        for (let i = 1; i <= frequency; i++) {
            let label = 'start_' + i
            expl.tl.addLabel(label)
            for (let j = 1; j <= perFreqNum; j++) {
                let anchor = new Zdog.Anchor({ addTo: expl.explosionGroup, rotate: expl.getRandomRotate() })

                let model = new Zdog.Shape({
                    addTo: anchor,
                    color: expl.getRandomColor(),
                    closed: false,
                    stroke: 5 * scale,
                    visible: false,
                    path: [
                        {},
                        { x: 20, y: -5 },
                        { x: 10, y: 5 },
                        { x: 30 }
                    ]
                })
                let aniObj = {
                    translate_x: 0
                }
                expl.modelArr.push(model)
                expl.aniObjArr.push(aniObj)

                expl.tl.to(aniObj, {
                    translate_x: 80 * scale,
                    ease: 'none',
                    duration: duration / perFreqNum,
                    onStart: () => { model.visible = true },
                    onComplete: () => { model.visible = false }
                }, label)
            }
        }
    }

    render() {
        let expl = this
        if (!expl.isEnd) {
            for (let i = 0; i < expl.modelArr.length; i++) {
                const model = expl.modelArr[i]
                const aniObj = expl.aniObjArr[i]
                expl.changeAnimeValue(model, aniObj)
            }
        }
    }

    changeAnimeValue(model, animeObject) {
        for (const key in animeObject) {
            if (animeObject.hasOwnProperty(key)) {
                const aObjVal = animeObject[key]
                const keyArr = key.split('_')
                const isAdd = keyArr[0] === 'add'
                const start = isAdd ? 1 : 0
                let element = model
                for (let i = start; i < keyArr.length; i++) {
                    let k = keyArr[i]
                    if (element && element.hasOwnProperty(k)) {
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

    remove() {
        let expl = this
        if (expl.isEnd) return
        expl.isEnd = true
        expl.modelArr.length = 0
        expl.aniObjArr.length = 0
        expl.explosionGroup.remove()
        expl.explosionGroup = null
        expl.tl.kill()
        expl.tl = null
    }

    getRandomRotate() {
        return new Zdog.Vector({
            x: Math.random() * Zdog.TAU,
            y: Math.random() * Zdog.TAU,
            z: Math.random() * Zdog.TAU
        })
    }

    getRandomColor() {
        return Math.random() > 0.5 ? 'white' : 'yellow'
    }
}