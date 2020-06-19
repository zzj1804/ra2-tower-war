class Target {
  constructor(addTo, translate, rotate) {
    let target = this
    target.status = 'standby'
    target.hp = 1000
    target.centerPoint = new Zdog.Vector(translate)
    target.model = new Zdog.Shape({
      addTo: addTo,
      translate: translate,
      rotate: rotate,
      stroke: 30,
      color: 'red'
    })
    target.aObj = {
      color: 'red'
    }
    target.tl = gsap.timeline({ yoyo: true, repeat: -1, onUpdate: () => { target.render() } })
      .to(target.aObj, { duration: 2, color: 'blue' })
      .to(target.aObj, { duration: 2, color: 'red' })
  }

  render() {
    let target = this
    target.changeAnimeValue(target.model, target.aObj)
  }

  changeCenterPoint(translate) {
    let target = this
    target.centerPoint = new Zdog.Vector(translate)
    target.model.translate = target.centerPoint
  }

  getCenterPoint() {
    let target = this
    return target.centerPoint
  }

  getDamage(damage) {
    let target = this
    let hp = target.hp - damage
    target.hp = hp
  }

  isEnd() {
    return this.status === 'end'
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
    let target = this
    if (target.isEnd) {
      return
    }
    target.isEnd = true
    target.status = 'end'
    target.hp = 0
    target.model.remove()
    target.model = null
    target.aObj = null
    target.centerPoint = null
    target.tl.kill()
    target.tl = null
  }
}