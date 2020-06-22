class LaserExplosion {
  constructor(addTo, translate, scale, duration, frequency) {
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
      stroke: 1
    }

    expl.explosion2 = new Zdog.Shape({
      addTo: expl.explosionGroup
    })

    expl.modelArr = []
    expl.aniObjArr = []

    expl.tl = new TimelineMax({ onUpdate: () => { expl.render() }, onComplete: () => { expl.remove() } })
    for (let i = 0; i < frequency; i++) {
      let model = new Zdog.Shape({ addTo: expl.explosionGroup })
      let aniObj = {
        color: 'rgba(255,255,255,0)',
        stroke: 10 * scale
      }
      expl.modelArr.push(model)
      expl.aniObjArr.push(aniObj)
      expl.tl.to(aniObj, {
        color: 'rgba(255,255,255,0.5)',
        stroke: 150 * scale,
        ease: 'none',
        duration: duration / frequency / 2
      }, duration / frequency / 2 * i)
        .to(aniObj, {
          color: 'rgba(255,255,255,0)',
          stroke: 300 * scale,
          ease: 'none',
          duration: duration / frequency / 2
        })
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
      if (animeObject.hasOwnProperty(key) && model.hasOwnProperty(key)) {
        model[key] = animeObject[key]
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
}