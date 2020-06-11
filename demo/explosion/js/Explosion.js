class Explosion {
  constructor(addTo, translate, scale) {
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
      stroke: 1
    }

    expl.explosion1 = new Zdog.Shape({
      addTo: expl.explosionGroup
    })

    expl.explosion2 = new Zdog.Shape({
      addTo: expl.explosionGroup
    })

    expl.tl = new TimelineMax({ repeat: 1, onUpdate: render, delay: 0 })
    expl.tl.to(expl.aObj1, 3, {
      color: 'rgba(255,255,255,0.01)',
      stroke: 300 * scale,
      ease: "expo.out"
    }).to(expl.aObj2, 3, {
      color: 'rgba(255,255,255,0.01)',
      stroke: 185 * scale,
      ease: "expo.out"
    }, "-=3").call(() => { expl.remove() })
  }

  render() {
    let expl = this
    if (!expl.isEnd) {
      expl.changeAnimeValue(expl.explosion1, expl.aObj1)
      expl.changeAnimeValue(expl.explosion2, expl.aObj2)
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