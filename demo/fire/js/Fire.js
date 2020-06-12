class Fire {
  constructor(addTo, translate, height, hwRatio, feq, duration) {
    let fire = this
    fire.isEnd = false
    fire.fireGroup = new Zdog.Group({
      addTo: addTo,
      translate: translate
    })

    fire.fire1 = new Zdog.Shape({
      addTo: fire.fireGroup,
      stroke: height / hwRatio,
      path: [
        {},
        { y: -height }
      ],
      color: 'red'
    })
    fire.fire2 = new Zdog.Shape({
      addTo: fire.fireGroup
    })
    fire.fire3 = new Zdog.Shape({
      addTo: fire.fireGroup
    })

    fire.aObj1 = {
      stroke: height / hwRatio,
      color: 'red',
      path_1_y: -height
    }

    fire.tl = new TimelineMax({ repeat: feq, onUpdate: () => { fire.render() }, delay: 0, onComplete: () => { fire.remove() } })
    fire.tl.to(fire.aObj1, {
      duration: duration / 2 / feq,
      stroke: height / hwRatio * 0.8,
      color: 'yellow',
      path_1_y: -1.2 * height
    }).to(fire.aObj1, {
      duration: duration / 2 / feq,
      stroke: height / hwRatio,
      color: 'red',
      path_1_y: -height
    })
  }

  render() {
    let fire = this
    if (!fire.isEnd) {
      fire.changeAnimeValue(fire.fire1, fire.aObj1)
      fire.fire1.updatePath()
    }
  }

  changeAnimeValue(model, animeObject) {
    for (const key in animeObject) {
      if (animeObject.hasOwnProperty(key)) {
        let aObjVal = animeObject[key]
        const keyArr = key.split('_')
        let isAdd = keyArr[0] === 'add'
        let start = isAdd ? 1 : 0
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
    let fire = this
    if (fire.isEnd) return
    fire.isEnd = true
    fire.fire1.remove()
    fire.fire2.remove()
    fire.fire3.remove()
    fire.fire1 = null
    fire.fire2 = null
    fire.fire3 = null
    fire.aObj1 = null
    fire.fireGroup.remove()
    fire.fireGroup = null
    fire.tl.kill()
    fire.tl = null
  }
}