class Smoke {
    constructor(addTo, translate, scale, smokeNum, raiseSpeed, duration) {
        let smoke = this
        smoke.isEnd = false
        smoke.smokeGroup = new Zdog.Group({
            addTo: addTo,
            translate: translate
        })

        smoke.modelArr = []
        for (let i = 0; i < smokeNum; i++) {
            smoke.modelArr[i] = new Zdog.Shape({
                addTo: smoke.smokeGroup,
                translate: {
                    x: (Math.random() - 0.5) * scale * Math.log(i),
                    y: (Math.random() - 0.5) * scale * Math.log(i),
                    z: (Math.random() - 0.5) * scale * Math.log(i)
                }
            })
        }
        smoke.aObj = {
            color: 'rgba(93,93,84,0)',
            add_translate_y: -raiseSpeed,
            stroke: scale * 0.3
        }

        smoke.tl = new gsap.timeline({ onUpdate: () => { smoke.render() }, onComplete: () => { smoke.remove() } })
        smoke.tl.to(smoke.aObj, {
            color: 'rgba(93,93,84,0.8)',
            stroke: scale,
            ease: "power4.out",
            duration: duration / 2
        }).to(smoke.aObj, {
            color: 'rgba(93,93,84,0)',
            stroke: scale * 0.3,
            ease: "none",
            duration: duration / 2
        })
    }

    render() {
        let smoke = this
        if (!smoke.isEnd) {
            for (let i = 0; i < smoke.modelArr.length; i++) {
                smoke.changeAnimeValue(smoke.modelArr[i], smoke.aObj)
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
        let smoke = this
        if (smoke.isEnd) return
        smoke.isEnd = true
        for (let i = 0; i < smoke.modelArr.length; i++) {
            smoke.modelArr[i].remove()
        }
        smoke.modelArr.length = 0
        smoke.aObjArr = null
        smoke.smokeGroup.remove()
        smoke.smokeGroup = null
        smoke.tl.kill()
        smoke.tl = null
    }
}