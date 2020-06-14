class TeslaCoil {
  constructor(addTo, translate, rotate, scale) {
    let coil = this
    coil.isEnd = false
    coil.model = new Zdog.Group({
      addTo: addTo,
      translate: translate,
      rotate: rotate,
      scale: scale
    })

    coil.tl = new TimelineMax({ onUpdate: () => { coil.render() } })
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

  render() {
    let coil = this
    if (!coil.isEnd) {
    }
  }

  remove() {
    let coil = this
    coil.isEnd = true
  }

  isRepairing = false
  isDemaged = false

  static STATUS = {
    CREATED: 'created',
    BUILDING: 'building',
    DESTROYED: 'destroyed',
    STANDBY: 'standby',
    LOADING: 'loading',
    ATTACKING: 'attacking',
    SELLING: 'selling',
    END: 'end'
  }

  static EVENT = {
    BUILD: 'build',
    TO_ATTACK: 'to_attack',
    ATTACKED: 'attacked',
    SELL: 'sell',
    REPAIR: 'repair'
  }
}