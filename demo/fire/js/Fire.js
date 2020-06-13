class Fire {
  constructor(addTo, translate, height, hwRatio, feq, duration) {
    let fire = this
    fire.isEnd = false
    fire.fireGroup = new Zdog.Group({
      addTo: addTo,
      translate: translate
    })

    let height1 = height
    let width1 = height / hwRatio
    let toWidth1 = width1 * 0.7
    let toHeight1 = height * 3
    let f1ColorFrom = 'rgba(255, 0, 0, 0.9)'
    let f1ColorTo = 'rgba(253, 205, 63, 0.9)'

    let height2 = height * 0.8
    let width2 = height / hwRatio * 0.5
    let toWidth2 = width2 * 0.7
    let toHeight2 = height * 1.4
    let f2ColorFrom = 'rgba(248, 242, 123, 0.95)'
    let f2ColorTo = 'rgba(253, 117, 6, 0.95)'

    fire.fire1 = new Zdog.Shape({
      addTo: fire.fireGroup,
      stroke: width1,
      path: [
        {},
        { y: -height1 }
      ],
      color: f1ColorFrom
    })
    fire.fire2 = new Zdog.Shape({
      addTo: fire.fireGroup,
      stroke: width2,
      path: [
        {},
        { y: -height2 }
      ],
      color: f2ColorTo
    })

    fire.aObj1 = {
      stroke: width1,
      color: f1ColorFrom,
      path_1_y: -height1
    }

    fire.aObj2 = {
      stroke: width2,
      color: f2ColorTo,
      path_1_y: -height2
    }

    fire.tl = new TimelineMax({ repeat: feq, onUpdate: () => { fire.render() }, delay: 0, onComplete: () => { fire.remove() } })

    fire.tl.to(fire.aObj1, {
      duration: duration / 2 / feq,
      stroke: toWidth1,
      color: f1ColorTo,
      path_1_y: -toHeight1
    }).addLabel('middle').to(fire.aObj1, {
      duration: duration / 2 / feq,
      stroke: width1,
      color: f1ColorFrom,
      path_1_y: -height2
    })

    fire.tl.to(fire.aObj2, {
      duration: duration / 2 / feq,
      stroke: toWidth2,
      color: f2ColorFrom,
      path_1_y: -toHeight2
    }, 0).to(fire.aObj2, {
      duration: duration / 2 / feq,
      stroke: width2,
      color: f2ColorTo,
      path_1_y: -height2
    }, 'middle')
  }

  render() {
    let fire = this
    if (!fire.isEnd) {
      fire.changeAnimeValue(fire.fire1, fire.aObj1)
      fire.fire1.updatePath()

      fire.changeAnimeValue(fire.fire2, fire.aObj2)
      fire.fire2.updatePath()
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
    let fire = this
    if (fire.isEnd) return
    fire.isEnd = true
    fire.fire1.remove()
    fire.fire2.remove()
    fire.fire1 = null
    fire.fire2 = null
    fire.aObj1 = null
    fire.aObj2 = null
    fire.fireGroup.remove()
    fire.fireGroup = null
    fire.tl.kill()
    fire.tl = null
  }
}