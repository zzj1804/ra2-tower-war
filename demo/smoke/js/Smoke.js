class Smoke {
  constructor(addTo, translate, scale) {
    let smoke = this
    smoke.isEnd = false
    smoke.smokeGroup = new Zdog.Group({
      addTo: addTo,
      translate: translate
    })



    smoke.aObj1 = {
      color: 'orange',
      stroke: 1
    }

    smoke.aObj2 = {
      color: 'red',
      stroke: 1
    }

    smoke.smokeosion1 = new Zdog.Shape({
      addTo: smoke.smokeosionGroup
    })

    smoke.smokeosion2 = new Zdog.Shape({
      addTo: smoke.smokeosionGroup
    })

    smoke.tl = new TimelineMax({ repeat: 1, onUpdate: () => { smoke.render() }, delay: 0, onComplete: () => { smoke.remove() } })
    smoke.tl.to(smoke.aObj1, 3, {
      color: 'rgba(255,255,255,0.01)',
      stroke: 300 * scale,
      ease: "expo.out"
    }).to(smoke.aObj2, 3, {
      color: 'rgba(255,255,255,0.01)',
      stroke: 185 * scale,
      ease: "expo.out"
    }, "-=3").call(() => { smoke.remove() })
  }

  render() {
    let smoke = this
    if (!smoke.isEnd) {
      smoke.changeAnimeValue(smoke.smokeosion1, smoke.aObj1)
      smoke.changeAnimeValue(smoke.smokeosion2, smoke.aObj2)
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
    let smoke = this
    smoke.isEnd = true
    smoke.smokeosion1.remove()
    smoke.smokeosion1 = null
    smoke.smokeosion2.remove()
    smoke.smokeosion2 = null
    smoke.smokeosionGroup.remove()
    smoke.smokeosionGroup = null
    smoke.tl.kill()
    smoke.tl = null
    smoke.aObj1 = null
    smoke.aObj2 = null
  }
}