class TeslaCoil {
  constructor(addTo, translate, rotate, scale) {
    let coil = this
    coil.addTo = addTo
    coil.status = TeslaCoil.STATUS.CREATED
    coil.hp = TeslaCoil.MAX_HP
    coil.scale = scale
    coil.isAutoRepairMode = false
    coil.target = null
    coil.loadTime = 0
    coil.partArr = []
    coil.aniObjArr = []
    coil.anchor = new Zdog.Anchor({ addTo: addTo, translate: translate, rotate: rotate })
    coil.model = coil.getModel(addTo, translate, rotate, scale)
    coil.centerPoint = coil.model.translate.copy().subtract({ y: 200 * scale })
    coil.topPoint = coil.model.translate.copy().subtract({ y: 400 * scale })
    coil.tl = gsap.timeline({ repeat: -1 })
      .to(1, { duration: 0.1 })
      .call(() => { coil.render() })
  }

  render() {
    let coil = this
    if (coil.isEnd()) return
    if (coil.hp <= 0) coil.status = TeslaCoil.STATUS.DESTROYED

    // TODO repair anime
    if (coil.isAutoRepairMode) {
      coil.repair(TeslaCoil.AUTO_REPAIR_VAL)
    }

    coil.lean()

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
  }

  build() {
    let coil = this
    let part = coil.partArr
    if (coil.status !== TeslaCoil.STATUS.CREATED) return
    coil.build_tl = gsap.timeline({
      onStart: () => { coil.status = TeslaCoil.STATUS.BUILDING },
      onComplete: () => { coil.status = TeslaCoil.STATUS.STANDBY }
    })
    let tl = coil.build_tl
    // build anime
    // 1.frame
    let frameAniObj = { translate_y: 40 }
    tl.call(() => { part[2].forEach(ele => { ele.visible = !ele.visible }) })
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
    let middlePartAniObj = { translate_y: 65 }
    tl.addLabel('middlePartStart', 'baseStart+=1')
      .call(() => { part[3].forEach(ele => { ele.visible = !ele.visible }) }, null, 'middlePartStart')
      .to(middlePartAniObj,
        { translate_y: 0, duration: 1, onUpdate: () => { coil.changeAnimeValue(part[3][0], middlePartAniObj) } },
        'middlePartStart')
    // 4.bottomPipe
    let bottomPipeAniObj = { translate_y: 40 }
    tl.addLabel('bottomPipeStart', 'baseStart+=0.5')
      .call(() => { part[1].forEach(ele => { ele.visible = !ele.visible }) }, null, 'bottomPipeStart')
      .to(bottomPipeAniObj,
        { translate_y: 0, duration: 1, onUpdate: () => { coil.changeAnimeValue(part[1][0], bottomPipeAniObj) } },
        'bottomPipeStart')
    // 5.coil
    let coilAniObj = {
      '1_path_1_y': -50,
      '2_translate_y': 0,
      '3_translate_y': 0,
      '4_translate_y': 0,
      '5_translate_y': 0,
      '6_translate_y': 0,
    }
    tl.addLabel('coilStart', '>')
      .call(() => { part[4].forEach(ele => { ele.visible = !ele.visible }) }, null, 'coilStart')
      .to(coilAniObj,
        {
          '1_path_1_y': -400,
          '2_translate_y': -70,
          '3_translate_y': -150,
          '4_translate_y': -250,
          '5_translate_y': -350,
          '6_translate_y': -475,
          duration: 1,
          onUpdate: () => {
            coil.changeAnimeValue(part[4], coilAniObj)
            part[4][1].updatePath()
          }
        },
        'coilStart')
  }

  standby() {
    let coil = this
    // TODO charge anime

    // TODO find target
  }

  repair(v) {
    this.getDamage(-v)
  }

  switchAutoRepair() {
    let coil = this
    if (coil.hp >= TeslaCoil.MAX_HP || coil.hp <= 0) {
      coil.isAutoRepairMode = false
      return false
    }
    coil.isAutoRepairMode = !coil.isAutoRepairMode
    return coil.isAutoRepairMode
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
    } else {
      coil.status = TeslaCoil.STATUS.STANDBY
    }
  }

  lean() {
    let coil = this
    if (coil.isEnd()) return
    try {
      let anchor = coil.partArr[4][7]
      let topCoil = coil.partArr[4][5]
      let midCoil = coil.partArr[4][4]
      let bottomCoil = coil.partArr[4][3]
      if (coil.isLean()) {
        anchor.rotate.z = Zdog.TAU / 20
        topCoil.rotate.y = -Zdog.TAU / 20
        midCoil.translate.x = 10
        bottomCoil.rotate.y = Zdog.TAU / 20
      } else {
        anchor.rotate.z = 0
        topCoil.rotate.y = 0
        midCoil.translate.x = 0
        bottomCoil.rotate.y = 0
      }
    } catch (e) { }
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
    new Explosion(coil.addTo, coil.centerPoint, 4 * coil.scale, 3)
    coil.remove()
  }

  remove() {
    let coil = this
    if (coil.isEnd()) return
    coil.addTo = null
    coil.status = TeslaCoil.STATUS.END
    coil.isAutoRepairMode = false
    coil.target = null
    coil.centerPoint = null
    coil.topPoint = null
    coil.loadTime = 0
    coil.partArr.length = 0
    coil.aniObjArr.length = 0
    coil.anchor.remove()
    coil.anchor = null
    coil.model.remove()
    coil.model = null
    coil.tl.kill()
    coil.tl = null
    if (coil.build_tl) {
      coil.build_tl.kill()
      coil.build_tl = null
    }
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
  static AUTO_REPAIR_VAL = 1

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

    coilArr.push(pillar)
    coilArr.push(littleCoil)
    coilArr.push(bigCoil)
    coilArr.push(middleCoil)
    coilArr.push(topCoil)
    coilArr.push(topBall)
    coilArr.push(coilAnchor)

    return teslaCoil
  }
}