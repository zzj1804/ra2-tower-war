class TeslaCoil {
  constructor(addTo, translate, rotate, scale) {
    let coil = this
    coil.status = TeslaCoil.STATUS.CREATED
    coil.hp = TeslaCoil.MAX_HP
    coil.partArr = []
    coil.aniObjArr = []
    coil.model = coil.getModel(addTo, translate, rotate, scale)

    coil.tl = new TimelineMax({ onUpdate: () => { coil.render() } })
  }

  render() {
    let coil = this
    if (coil.isEnd()) return
    if (coil.hp <= 0) coil.status = TeslaCoil.STATUS.DESTROYED

    switch (coil.status) {
      case TeslaCoil.STATUS.BUILDING:
        break
      case TeslaCoil.STATUS.DESTROYED:
        // TODO explosion
        coil.status = TeslaCoil.STATUS.END
        break
      case TeslaCoil.STATUS.STANDBY:
        coil.standby()
        break
      case TeslaCoil.STATUS.LOADING:
        if (!coil.target || coil.target.isEnd()) {
          coil.status = TeslaCoil.STATUS.STANDBY
        }
        break
      case TeslaCoil.STATUS.ATTACKING:
        break
      case TeslaCoil.STATUS.SELLING:
        coil.status = TeslaCoil.STATUS.END
        break
      case TeslaCoil.STATUS.END:
        coil.remove()
        break
    }

    // TODO repair anime
    if (coil.isRepairing) {

    } else {

    }
  }

  build() {
    let coil = this
    if (coil.status !== TeslaCoil.STATUS.CREATED) return
    // TODO build anime
    coil.status = TeslaCoil.STATUS.BUILDING
  }

  standby() {
    let coil = this
    if (coil.isLean()) {
      // TODO lean the tower
    }
    // TODO charge anime
  }

  repair() {
    let coil = this
    if (coil.hp >= TeslaCoil.MAX_HP) return
    coil.isRepairing = true
  }

  cancelRepair() {
    let coil = this
    coil.isRepairing = false
  }

  getDamage(damage) {
    let coil = this
    coil.hp -= damage
  }

  toAttack(target) {
    let coil = this
    if (target && !target.isEnd()) {
      coil.target = target
      // TODO loading anime
      coil.status = TeslaCoil.STATUS.LOADING
    }
  }

  attack() {
    let coil = this
    if (coil.target) {
      // TODO attack anime
      coil.status = TeslaCoil.STATUS.ATTACKING
      coil.target.getDamage(coil.DAMAGE)
    }
  }

  sell() {
    let coil = this
    if (!(
      coil.status === TeslaCoil.STATUS.STANDBY ||
      coil.status === TeslaCoil.STATUS.LOADING ||
      coil.status === TeslaCoil.STATUS.ATTACKING
    )) return
    // TODO selling anime
    coil.status = TeslaCoil.STATUS.SELLING
  }

  remove() {
    let coil = this
    if (coil.isEnd()) return
    // TODO remove
    coil.status = TeslaCoil.STATUS.END
  }

  isEnd() {
    let coil = this
    return coil.status === TeslaCoil.END
  }

  isLean() {
    let coil = this
    return coil.hp < TeslaCoil.MAX_HP * 0.5
  }

  isRepairing = false

  target = null
  idx = null
  MAX_HP = 800
  DAMAGE = 200
  ATTACK_CD = 8


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

  getModel(addTo, translate, rotate, scale) {
    // colors
    const red = '#FF0000'
    const silver = '#DFDFDF'
    const gold = '#FA6'

    const TAU = Zdog.TAU
    const TAU4 = TAU / 4
    const TAU8 = TAU / 8

    let teslaCoil = new Zdog.Shape({
      addTo: addTo,
      translate: translate,
      rotate: rotate,
      scale: scale
    })

    let base = new Zdog.Shape({
      addTo: teslaCoil
    })

    new Zdog.Cylinder({
      addTo: base,
      diameter: 150,
      translate: { y: -55 },
      rotate: { x: TAU4 },
      length: 100,
      color: '#ADADAF',
      fill: true,
      stroke: 20 * scale,
    })

    // fans
    let fanNum = 4;
    let fanRadius = 80;
    for (let i = 0; i < fanNum; i++) {
      let anchor = new Zdog.Anchor({
        addTo: base,
        rotate: { y: TAU * i / fanNum },
      });
      let fan = new Zdog.Shape({
        addTo: anchor,
      })

      let fan1 = new Zdog.Shape({
        addTo: anchor,
        path: [
          { x: fanRadius + 0, y: 0, z: 30 },
          { x: fanRadius + 86, y: 0, z: 30 },
          { x: fanRadius + 20, y: -100, z: 30 },
          { x: fanRadius + 0, y: -100, z: 30 },
        ],
        color: red,
        stroke: 10 * scale,
        fill: true,
      })

      let fan2 = new Zdog.Shape({
        addTo: anchor,
        path: [
          { x: fanRadius + 0, y: 0, z: -30 },
          { x: fanRadius + 86, y: 0, z: -30 },
          { x: fanRadius + 20, y: -100, z: -30 },
          { x: fanRadius + 0, y: -100, z: -30 },
        ],
        color: red,
        stroke: 10 * scale,
        fill: true,
      })

      let fan3 = new Zdog.Shape({
        addTo: anchor,
        path: [
          { x: fanRadius + 0, y: -5, z: -15 },
          { x: fanRadius + 76, y: -5, z: -15 },
          { x: fanRadius + 15, y: -90, z: -15 },
          { x: fanRadius + 0, y: -90, z: -15 },
        ],
        color: gold,
        stroke: 20 * scale,
        fill: true,
      })

      let fan4 = new Zdog.Shape({
        addTo: anchor,
        path: [
          { x: fanRadius + 0, y: -5, z: 15 },
          { x: fanRadius + 76, y: -5, z: 15 },
          { x: fanRadius + 15, y: -90, z: 15 },
          { x: fanRadius + 0, y: -90, z: 15 },
        ],
        color: gold,
        stroke: 20 * scale,
        fill: true,
      })

      let fan5 = new Zdog.Shape({
        addTo: anchor,
        path: [
          { x: fanRadius + 0, y: -5, z: 0 },
          { x: fanRadius + 76, y: -5, z: 0 },
          { x: fanRadius + 15, y: -90, z: 0 },
          { x: fanRadius + 0, y: -90, z: 0 },
        ],
        color: gold,
        stroke: 20 * scale,
        fill: true,
      })

      let anchor2 = new Zdog.Anchor({
        addTo: base,
        rotate: { y: TAU * i / fanNum + TAU8 },
      })

      let pipe1 = new Zdog.Shape({
        addTo: anchor2,
        path: [
          { x: fanRadius + 50, y: -40 },
          {
            arc: [
              { x: fanRadius + 45, y: -75 },
              { x: fanRadius, y: -90 },
            ]
          },
        ],
        color: '#BBBBBB',
        stroke: 35 * scale,
        closed: false,
      })

      let pipe2 = new Zdog.Cylinder({
        addTo: anchor2,
        diameter: 50,
        translate: { x: fanRadius + 50, y: -15 },
        rotate: { x: TAU4 },
        length: 30,
        color: '#AAAAAA',
        fill: true,
        stroke: 10 * scale,
      })

      let pipe3 = new Zdog.Shape({
        addTo: anchor,
        path: [
          { x: fanRadius + 10, y: -110 },
          { x: fanRadius + 10, y: -160 },
          {
            arc: [
              { x: fanRadius + 5, y: -205 },
              { x: fanRadius - 20, y: -210 },
            ]
          },
        ],
        color: '#CCCCCC',
        stroke: 35 * scale,
        closed: false,
      })


      new Zdog.Ellipse({
        addTo: base,
        diameter: 80,
        translate: { y: -210 },
        rotate: { x: TAU4 },
        stroke: 35 * scale,
        color: '#CCCCCC',
        fill: true,
      })

      new Zdog.Shape({
        addTo: base,
        translate: { y: -150 },
        stroke: 100 * scale,
        color: silver
      })

      let coil = new Zdog.Anchor({
        addTo: teslaCoil,
        // rotate: { x: TAU4 / 16 },
        translate: { y: -200 }
      })

      new Zdog.Shape({
        addTo: coil,
        translate: { y: 0 },
        path: [
          { y: -40 },
          { y: -400 },
        ],
        stroke: 35 * scale,
        color: silver
      })

      new Zdog.Shape({
        addTo: coil,
        translate: { y: -475 },
        stroke: 140 * scale,
        color: '#EEE'
      })

      new Zdog.Ellipse({
        addTo: coil,
        diameter: 50,
        translate: { y: -70 },
        rotate: { x: TAU4 },
        stroke: 20 * scale,
        color: '#EEE',
        fill: false
      })

      new Zdog.Ellipse({
        addTo: coil,
        diameter: 200,
        translate: { y: -150 },
        rotate: { x: TAU4 },
        stroke: 20 * scale,
        color: '#EEF',
        fill: false
      })

      new Zdog.Ellipse({
        addTo: coil,
        diameter: 150,
        translate: { y: -250 },
        rotate: { x: TAU4 },
        stroke: 20 * scale,
        color: '#EFE',
        fill: false
      })

      new Zdog.Ellipse({
        addTo: coil,
        diameter: 100,
        translate: { y: -350 },
        rotate: { x: TAU4 },
        stroke: 20 * scale,
        color: '#FEE',
        fill: false
      })

    }
    return teslaCoil
  }
}