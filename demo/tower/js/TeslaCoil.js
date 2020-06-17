class TeslaCoil {
  constructor(addTo, translate, rotate, scale) {
    let coil = this
    coil.status = TeslaCoil.STATUS.CREATED
    coil.hp = TeslaCoil.MAX_HP
    coil.scale = scale
    coil.isRepairing = false
    coil.target = null
    coil.centerPoint = null
    coil.topPoint = null
    coil.loadTime = 0
    coil.partArr = []
    coil.aniObjArr = []
    coil.model = coil.getModel(addTo, translate, rotate, scale)
    coil.tl = gsap.timeline({ onUpdate: () => { coil.render() } })
  }

  render() {
    let coil = this
    if (coil.isEnd()) return
    if (coil.hp <= 0) coil.status = TeslaCoil.STATUS.DESTROYED

    switch (coil.status) {
      case TeslaCoil.STATUS.BUILDING:
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
        coil.sell()
        break
      case TeslaCoil.STATUS.DESTROYED:
        coil.destroyed()
        break
    }

    // TODO repair anime
    if (coil.isRepairing) {

    }
    // TODO lean the tower
    if (coil.isLean()) {
    }
  }

  build() {
    let coil = this
    let scale = coil.scale
    let part = coil.partArr
    if (coil.status !== TeslaCoil.STATUS.CREATED) return
    let tl = gsap.timeline({ onComplete: () => { tl.kill() } })

    // TODO build anime
    // 1.frame
    let frameAniObj = { translate_y: 100 * scale }
    tl
      .call(() => { part[2].forEach(ele => { ele.visible = !ele.visible }) })
      .to(frameAniObj,
        { translate_y: 0, duration: 1, onUpdate: () => { coil.changeAnimeValue(part[2][0], frameAniObj) } })
    // 2.base
    let baseAniObj = { translate_y: 0 }
    tl.addLabel('baseStart', '<0.5')
      .call(() => { part[0].forEach(ele => { ele.visible = !ele.visible }) }, null, 'baseStart')
      .to(baseAniObj,
        { translate_y: -55, duration: 1, onUpdate: () => { coil.changeAnimeValue(part[0][0], baseAniObj) } },
        'baseStart')
    // 3.middlePart
    let middlePartAniObj = { translate_y: 160 * scale }
    tl.addLabel('middlePartStart', 'baseStart+=1')
      .call(() => { part[3].forEach(ele => { ele.visible = !ele.visible }) }, null, 'middlePartStart')
      .to(middlePartAniObj,
        { translate_y: 0, duration: 1, onUpdate: () => { coil.changeAnimeValue(part[3][0], middlePartAniObj) } },
        'middlePartStart')
    // 4.coil

    coil.status = TeslaCoil.STATUS.BUILDING
  }

  standby() {
    let coil = this
    // TODO charge anime

    // TODO find target
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
    let hp = coil.hp - damage
    if (hp > TeslaCoil.MAX_HP) {
      hp = TeslaCoil.MAX_HP
    } else if (hp < 0) {
      hp = 0
    }
    coil.hp = hp
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
      if (!coil.target.isEnd()) {
        coil.target.getDamage(TeslaCoil.AP)
      }
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

  destroyed() {
    let coil = this
    // TODO explosion
    coil.remove()
  }

  remove() {
    let coil = this
    if (coil.isEnd()) return
    // TODO remove
    coil.status = TeslaCoil.STATUS.END
    coil.isRepairing = false
    coil.target = null
    coil.centerPoint = null
    coil.topPoint = null
    coil.loadTime = 0
    coil.partArr.length = 0
    coil.aniObjArr.length = 0
    coil.model.remove()
    coil.model = null
    coil.tl.kill()
    coil.tl = null
  }

  isEnd() {
    let coil = this
    return coil.status === TeslaCoil.END || coil.status === TeslaCoil.CREATED
  }

  isLean() {
    let coil = this
    return coil.hp < TeslaCoil.MAX_HP * 0.5
  }

  isCD() {
    let coil = this
    return coil.loadTime < TeslaCoil.ATTACK_CD
  }

  static MAX_HP = 800
  static AP = 200
  static ATTACK_CD = 8

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
    let thisCoil = this
    // colors
    const red = '#FF0000'
    const silver = '#DFDFDF'
    const gold = '#FA6'

    const TAU = Zdog.TAU
    const TAU4 = TAU / 4
    const TAU8 = TAU / 8
    const isVisible = false

    let teslaCoil = new Zdog.Shape({
      addTo: addTo,
      translate: translate,
      rotate: rotate,
      scale: scale,
      visible: isVisible
    })

    let base = new Zdog.Cylinder({
      addTo: teslaCoil,
      diameter: 150,
      translate: { y: -55 },
      rotate: { x: TAU4 },
      length: 100,
      color: '#ADADAF',
      fill: true,
      stroke: 20 * scale,
      visible: isVisible
    })

    // parts
    // use Shape because of perspective bug
    let frame = new Zdog.Shape({ addTo: teslaCoil })
    let bottomPipe = new Zdog.Shape({ addTo: teslaCoil })
    let middlePart = new Zdog.Shape({ addTo: teslaCoil })
    let coil = new Zdog.Shape({ addTo: teslaCoil })
    let baseArr = []
    let frameArr = []
    let middlePartArr = []
    let bottomPipeArr = []
    let coilArr = []
    baseArr.push(base)
    frameArr.push(frame)
    bottomPipeArr.push(bottomPipe)
    middlePartArr.push(middlePart)
    coilArr.push(coil)

    // [0]
    thisCoil.partArr.push(baseArr)
    // [1]
    thisCoil.partArr.push(bottomPipeArr)
    // [2]
    thisCoil.partArr.push(frameArr)
    // [3]
    thisCoil.partArr.push(middlePartArr)
    // [4]
    thisCoil.partArr.push(coilArr)

    let frameNum = 4
    let frameRadius = 80
    for (let i = 0; i < frameNum; i++) {
      // 1.frame:
      let frameAnchor = new Zdog.Anchor({
        addTo: frame,
        rotate: { y: TAU * i / frameNum }
      })
      // 1.frame:frame1
      let frame1 = new Zdog.Shape({
        addTo: frameAnchor,
        path: [
          { x: frameRadius + 0, y: 0, z: 30 },
          { x: frameRadius + 86, y: 0, z: 30 },
          { x: frameRadius + 20, y: -100, z: 30 },
          { x: frameRadius + 0, y: -100, z: 30 },
        ],
        color: red,
        stroke: 10 * scale,
        fill: true,
        visible: isVisible
      })
      // 1.frame:frame2
      let frame2 = new Zdog.Shape({
        addTo: frameAnchor,
        path: [
          { x: frameRadius + 0, y: 0, z: -30 },
          { x: frameRadius + 86, y: 0, z: -30 },
          { x: frameRadius + 20, y: -100, z: -30 },
          { x: frameRadius + 0, y: -100, z: -30 },
        ],
        color: red,
        stroke: 10 * scale,
        fill: true,
        visible: isVisible
      })
      // 1.frame:frame3
      let frame3 = new Zdog.Shape({
        addTo: frameAnchor,
        path: [
          { x: frameRadius + 0, y: -5, z: -15 },
          { x: frameRadius + 76, y: -5, z: -15 },
          { x: frameRadius + 15, y: -90, z: -15 },
          { x: frameRadius + 0, y: -90, z: -15 },
        ],
        color: gold,
        stroke: 20 * scale,
        fill: true,
        visible: isVisible
      })
      // 1.frame:frame4
      let frame4 = new Zdog.Shape({
        addTo: frameAnchor,
        path: [
          { x: frameRadius + 0, y: -5, z: 15 },
          { x: frameRadius + 76, y: -5, z: 15 },
          { x: frameRadius + 15, y: -90, z: 15 },
          { x: frameRadius + 0, y: -90, z: 15 },
        ],
        color: gold,
        stroke: 20 * scale,
        fill: true,
        visible: isVisible
      })
      // 1.frame:frame5
      let frame5 = new Zdog.Shape({
        addTo: frameAnchor,
        path: [
          { x: frameRadius + 0, y: -5, z: 0 },
          { x: frameRadius + 76, y: -5, z: 0 },
          { x: frameRadius + 15, y: -90, z: 0 },
          { x: frameRadius + 0, y: -90, z: 0 },
        ],
        color: gold,
        stroke: 20 * scale,
        fill: true,
        visible: isVisible
      })
      frameArr.push(frame1)
      frameArr.push(frame2)
      frameArr.push(frame3)
      frameArr.push(frame4)
      frameArr.push(frame5)

      // 2.bottomPipes:
      let anchor2 = new Zdog.Anchor({
        addTo: bottomPipe,
        rotate: { y: TAU * i / frameNum + TAU8 },
      })
      // 2.bottomPipes:pipe connector
      let bottomPipeConnector = new Zdog.Shape({
        addTo: anchor2,
        path: [
          { x: frameRadius + 50, y: -40 },
          {
            arc: [
              { x: frameRadius + 45, y: -75 },
              { x: frameRadius, y: -90 },
            ]
          },
        ],
        color: '#BBBBBB',
        stroke: 35 * scale,
        closed: false,
        visible: isVisible
      })
      // 2.bottomPipes:pipe
      let bottomPipePipe = new Zdog.Cylinder({
        addTo: anchor2,
        diameter: 50,
        translate: { x: frameRadius + 50, y: -15 },
        rotate: { x: TAU4 },
        length: 30,
        color: '#AAAAAA',
        fill: true,
        stroke: 10 * scale,
        visible: isVisible
      })
      bottomPipeArr.push(bottomPipeConnector)
      bottomPipeArr.push(bottomPipePipe)

      // 3.middlePart:pipe
      let middlePartAnchor = new Zdog.Anchor({
        addTo: middlePart,
        rotate: { y: TAU * i / frameNum }
      })
      let middlePartPipe = new Zdog.Shape({
        addTo: middlePartAnchor,
        path: [
          { x: frameRadius + 10, y: -110 },
          { x: frameRadius + 10, y: -160 },
          {
            arc: [
              { x: frameRadius + 5, y: -205 },
              { x: frameRadius - 20, y: -210 },
            ]
          },
        ],
        color: '#CCCCCC',
        stroke: 35 * scale,
        closed: false,
        visible: isVisible
      })
      middlePartArr.push(middlePartPipe)
    }

    // 3.middlePart:pan
    let middlePartPan = new Zdog.Ellipse({
      addTo: middlePart,
      diameter: 80,
      translate: { y: -210 },
      rotate: { x: TAU4 },
      stroke: 35 * scale,
      color: '#CCCCCC',
      fill: true,
      visible: isVisible
    })
    // 3.middlePart:ball
    let middlePartBall = new Zdog.Shape({
      addTo: middlePart,
      translate: { y: -150 },
      stroke: 100 * scale,
      color: silver,
      visible: isVisible
    })
    middlePartArr.push(middlePartPan)
    middlePartArr.push(middlePartBall)

    // 4.coil:anchor
    let coilAnchor = new Zdog.Anchor({
      addTo: coil,
      translate: { y: -200 }
    })
    // 4.coil:pillar
    let pillar = new Zdog.Shape({
      addTo: coilAnchor,
      translate: { y: 0 },
      path: [
        { y: -40 },
        { y: -400 },
      ],
      stroke: 35 * scale,
      color: silver,
      visible: isVisible
    })
    // 4.coil:top ball
    let topBall = new Zdog.Shape({
      addTo: coilAnchor,
      translate: { y: -475 },
      stroke: 140 * scale,
      color: '#EEE',
      visible: isVisible
    })
    // 4.coil:bottom little coil
    let littleCoil = new Zdog.Ellipse({
      addTo: coilAnchor,
      diameter: 50,
      translate: { y: -70 },
      rotate: { x: TAU4 },
      stroke: 20 * scale,
      color: '#EEE',
      fill: false,
      visible: isVisible
    })
    // 4.coil:big coil
    let bigCoil = new Zdog.Ellipse({
      addTo: coilAnchor,
      diameter: 200,
      translate: { y: -150 },
      rotate: { x: TAU4 },
      stroke: 20 * scale,
      color: '#EEF',
      fill: false,
      visible: isVisible
    })
    // 4.coil:middle coil
    let middleCoil = new Zdog.Ellipse({
      addTo: coilAnchor,
      diameter: 150,
      translate: { y: -250 },
      rotate: { x: TAU4 },
      stroke: 20 * scale,
      color: '#EFE',
      fill: false,
      visible: isVisible
    })
    // 4.coil:top coil
    let topCoil = new Zdog.Ellipse({
      addTo: coilAnchor,
      diameter: 100,
      translate: { y: -350 },
      rotate: { x: TAU4 },
      stroke: 20 * scale,
      color: '#FEE',
      fill: false,
      visible: isVisible
    })

    coilArr.push(coil)
    coilArr.push(pillar)
    coilArr.push(littleCoil)
    coilArr.push(bigCoil)
    coilArr.push(middleCoil)
    coilArr.push(topCoil)
    coilArr.push(topBall)

    return teslaCoil
  }
}