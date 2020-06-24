class Spanner {
    constructor(addTo, translate, rotate, length, lwRatio, stroke, scale, color, feq, duration) {
        let spanner = this
        spanner.isEnd = false
        spanner.spannerGroup = new Zdog.Group({
            addTo: addTo,
            translate: translate,
            rotate: rotate,
            scale: scale
        })

        let width = length / lwRatio
        let handleLength = length / 2
        let handleWidth = length / 3 / lwRatio
        let clampLength = (length - handleLength) / 2

        spanner.spanner = new Zdog.Shape({
            addTo: spanner.spannerGroup,
            stroke: stroke * scale,
            close: true,
            fill: true,
            translate: { x: handleLength },
            path: [
                { x: -handleLength / 2, y: -handleWidth / 2 },
                { x: handleLength / 2, y: -handleWidth / 2 },
                {
                    arc: [
                        { x: handleLength / 2 + clampLength / 2, y: -width / 2 },
                        { x: length / 2, y: -handleWidth / 2 },
                    ]
                },
                { x: length / 2 - clampLength / 2, y: -handleWidth / 2 },
                { x: length / 2 - clampLength / 2, y: handleWidth / 2 },
                { x: length / 2, y: handleWidth / 2 },
                {
                    arc: [
                        { x: handleLength / 2 + clampLength / 2, y: width / 2 },
                        { x: handleLength / 2, y: handleWidth / 2 },
                    ]
                },
                { x: -handleLength / 2, y: handleWidth / 2 },
                {
                    arc: [
                        { x: -(handleLength / 2 + clampLength / 2), y: width / 2 },
                        { x: -length / 2, y: handleWidth / 2 },
                    ]
                },
                { x: -(length / 2 - clampLength / 2), y: handleWidth / 2 },
                { x: -(length / 2 - clampLength / 2), y: -handleWidth / 2 },
                { x: -length / 2, y: -handleWidth / 2 },
                {
                    arc: [
                        { x: -(handleLength / 2 + clampLength / 2), y: -width / 2 },
                        { x: -handleLength / 2, y: -handleWidth / 2 },
                    ]
                }
            ],
            color: color
        })

        spanner.aObj = {
            rotate_z: -Zdog.TAU / 8
        }

        spanner.tl = new gsap.timeline({ yoyo: true, repeat: feq, onUpdate: () => { spanner.render() }, onComplete: () => { spanner.remove() } })

        spanner.tl.to(spanner.aObj, {
            duration: duration / 2 / feq,
            rotate_z: Zdog.TAU / 8,
            ease: 'none'
        })
    }

    render() {
        let spanner = this
        if (!spanner.isEnd) {
            spanner.changeAnimeValue(spanner.spannerGroup, spanner.aObj)
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

    remove() {
        let spanner = this
        if (spanner.isEnd) return
        spanner.isEnd = true
        spanner.spanner.remove()
        spanner.spanner = null
        spanner.aObj = null
        spanner.spannerGroup.remove()
        spanner.spannerGroup = null
        spanner.tl.kill()
        spanner.tl = null
    }
}