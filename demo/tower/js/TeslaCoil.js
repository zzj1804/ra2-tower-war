class TeslaCoil {
  constructor(addTo, translate, rotate, scale, teamColor, map, mapIndex) {
    let coil = this
    coil.addTo = addTo
    coil.map = map
    coil.mapIndex = mapIndex
    coil.teamColor = teamColor
    coil.buildingType = TeslaCoil.BUILDING_TYPE
    coil.status = TeslaCoil.STATUS.CREATED
    coil.hp = TeslaCoil.MAX_HP
    coil.scale = scale
    coil.isAutoRepairMode = true
    coil.target = null
    coil.loadTime = 0
    coil.partArr = []
    coil.model = coil.getModel(addTo, translate, rotate, scale)
    coil.anchor = new Zdog.Anchor({ addTo: coil.model })
    coil.centerPoint = null
    coil.tl = gsap.timeline({ repeat: -1 })
      .to(1, { duration: TeslaCoil.RENDER_PERIOD })
      .call(() => { coil.render() })
  }

  render() {
    let coil = this
    if (coil.isEnd()) return
    if (coil.hp <= 0) coil.status = TeslaCoil.STATUS.DESTROYED

    // autoRepairMode
    coil.autoRepairModeAnime()
    coil.autoRepair()

    // lean the tower if damaged
    coil.lean()

    switch (coil.status) {
      case TeslaCoil.STATUS.STANDBY:
        coil.standby()
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
    tl.addLabel('middlePartStart', 'baseStart+=0.5')
      .call(() => { part[3].forEach(ele => { ele.visible = !ele.visible }) }, null, 'middlePartStart')
      .to(middlePartAniObj,
        { translate_y: 0, duration: 1, ease: 'power4.out', onUpdate: () => { coil.changeAnimeValue(part[3][0], middlePartAniObj) } },
        'middlePartStart')
    // 4.bottomPipe
    let bottomPipeAniObj = { translate_y: 40 }
    tl.addLabel('bottomPipeStart', 'baseStart+=0.5')
      .call(() => { part[1].forEach(ele => { ele.visible = !ele.visible }) }, null, 'bottomPipeStart')
      .to(bottomPipeAniObj,
        { translate_y: 0, duration: 1, ease: 'power4.out', onUpdate: () => { coil.changeAnimeValue(part[1][0], bottomPipeAniObj) } },
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
    tl.addLabel('coilStart', 'baseStart+=0.75')
      .call(() => { part[4].forEach(ele => { ele.visible = !ele.visible }) }, null, 'coilStart')
      .to(coilAniObj,
        {
          '1_path_1_y': -400,
          '2_translate_y': -70,
          '3_translate_y': -150,
          '4_translate_y': -250,
          '5_translate_y': -350,
          '6_translate_y': -475,
          ease: 'power4.out',
          duration: 0.75,
          onUpdate: () => {
            coil.changeAnimeValue(part[4], coilAniObj)
            part[4][1].updatePath()
          }
        },
        'coilStart')
  }

  getTopPoint() {
    let coil = this
    if (coil.isLean()) {
      return new Zdog.Vector(coil.model.translate).subtract(new Zdog.Vector({ x: -100 * coil.scale, y: 625 * coil.scale, z: 80 * coil.scale }).rotate(coil.model.rotate))
    } else {
      return new Zdog.Vector(coil.model.translate).subtract(new Zdog.Vector({ y: 675 * coil.scale }).rotate(coil.model.rotate))
    }
  }

  getCenterPoint() {
    return new Zdog.Vector(coil.model.translate).subtract(new Zdog.Vector({ y: 200 * coil.scale }).rotate(coil.model.rotate))
  }

  standby() {
    let coil = this
    if (coil.status !== TeslaCoil.STATUS.STANDBY) return
    coil.loadTime += TeslaCoil.RENDER_PERIOD

    if (!coil.isCD() && coil.findAndSetTarget()) {
      coil.loading()
    } else if (!coil.lightning || coil.lightning.isEnd) {
      let anchor = coil.partArr[4][7]
      let distance = 350
      coil.lightning = new Lightning(anchor, { y: -400 }, { z: Zdog.TAU / 4 },
        10 * coil.scale, distance, 8, 10, 150,
        function (x) { return (25 / Math.sqrt(distance) * (x * x / distance - x)) })
    }
  }

  findAndSetTarget() {
    let coil = this
    // find target on map,bfs
    if (!coil.map || !coil.mapIndex) return false
    let buildingArr = coil.map.isoArr
    let len = coil.map.isoArr.length
    let diers = [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 }]
    let visits = new Array(len)
    let queue = []
    let startPoi = { x: coil.mapIndex.x, y: coil.mapIndex.y }
    queue.push(startPoi)
    for (let i = 0; i < visits.length; i++) {
      visits[i] = new Array(len).fill(false)
    }
    visits[poi.x][poi.y] = true
    while (queue.length > 0) {
      for (let i = 0; i < diers.length; i++) {
        const dier = diers[i]
        let poi = queue.pop()
        let tx = poi.x + dier.x
        let ty = poi.y + dier.y
        if (tx >= 0 && tx < len &&
          ty >= 0 && ty < len &&
          !visits[tx][ty]) {
          visits[tx][ty] = true
          newPoi = { x: tx, y: ty }
          queue.push(newPoi)

          let building = buildingArr[tx][ty]
          if (building && !building.isEnd() && !coil.isSameTeam(building.teamColor) &&
            ZdogUtils.getDistance(coil.getTopPoint(), building.getCenterPoint()) <= TeslaCoil.ATTACK_RANGE) {
            coil.target = building
            return true
          }
        }
      }
    }
    return false
  }

  repair(v) {
    this.getDamage(-v)
  }

  switchAutoRepairMode() {
    let coil = this
    coil.isAutoRepairMode = !coil.isAutoRepairMode
    return coil.isAutoRepairMode
  }

  autoRepair() {
    let coil = this
    if (coil.isAutoRepairMode &&
      !coil.isEnd() &&
      coil.hp < TeslaCoil.MAX_HP) {
      coil.repair(TeslaCoil.AUTO_REPAIR_VAL)
    }
  }

  autoRepairModeAnime() {
    let coil = this
    if (coil.isAutoRepairMode &&
      !coil.isEnd() &&
      coil.hp < TeslaCoil.MAX_HP &&
      (!coil.spanner || coil.spanner.isEnd)) {
      coil.spanner = new Spanner(coil.anchor, { x: 200, y: -400 }, { x: Zdog.TAU / 4 }, 150, 2, 5, 0.9, '#CBCBCB', 3, 2)
    }
  }

  getDamage(damage) {
    let coil = this
    if (coil.hp > TeslaCoil.MAX_HP) {
      coil.hp = TeslaCoil.MAX_HP
    }
    let hp = coil.hp - damage
    if (hp > TeslaCoil.MAX_HP) {
      hp = TeslaCoil.MAX_HP
    } else if (hp < 0) {
      hp = 0
    }
    coil.hp = hp
  }

  isSameTeam(teamColor) {
    let coil = this
    return coil.teamColor === teamColor
  }

  loading() {
    let coil = this
    if (coil.status !== TeslaCoil.STATUS.STANDBY) return
    let sliver = '#EEF'
    let white = 'white'
    let ball = coil.partArr[4][6]
    let topCoil = coil.partArr[4][5]
    let midCoil = coil.partArr[4][4]
    let bottomCoil = coil.partArr[4][3]
    coil.loading_tl = gsap.timeline({
      onStart: () => {
        coil.status = TeslaCoil.STATUS.LOADING
        coil.lightning.remove()
      },
      onUpdate: () => {
        if (!coil.isTargetWithinRange() && coil.status === TeslaCoil.STATUS.LOADING) {
          coil.status = TeslaCoil.STATUS.STANDBY
          ball.color = sliver
          topCoil.color = sliver
          midCoil.color = sliver
          bottomCoil.color = sliver
          coil.loading_tl.kill()
        }
      },
      onComplete: () => {
        if (coil.status === TeslaCoil.STATUS.LOADING) {
          coil.attack()
        }
      }
    })
    let tl = coil.loading_tl

    // loading anime
    let duration = 0.15
    let bottomCoilAniObj = { color: silver }
    let midCoilAniObj = { color: silver }
    let topCoilAniObj = { color: silver }
    let ballAniObj = { color: silver }

    // 1.bottomCoil
    tl.to(bottomCoilAniObj, { color: white, duration: duration, onUpdate: () => { coil.changeAnimeValue(bottomCoil, bottomCoilAniObj) } }, 'midCoilStart')
      .to(bottomCoilAniObj, { color: sliver, duration: duration, onUpdate: () => { coil.changeAnimeValue(bottomCoil, bottomCoilAniObj) } }, 'topCoilStart')
    // 2.midCoil
    tl.to(midCoilAniObj, { color: white, duration: duration, onUpdate: () => { coil.changeAnimeValue(midCoil, midCoilAniObj) } }, 'midCoilStart')
      .to(midCoilAniObj, { color: sliver, duration: duration, onUpdate: () => { coil.changeAnimeValue(midCoil, midCoilAniObj) } })
    // 3.topCoil
    tl.to(topCoilAniObj, { color: white, duration: duration, onUpdate: () => { coil.changeAnimeValue(topCoil, topCoilAniObj) } }, 'topCoilStart')
    tl.addLabel('ballStart')
      .to(topCoilAniObj, { color: sliver, duration: duration, onUpdate: () => { coil.changeAnimeValue(topCoil, topCoilAniObj) } })
    // 4.ball
    tl.to(ballAniObj, { color: white, duration: duration, onUpdate: () => { coil.changeAnimeValue(ball, ballAniObj) } }, 'ballStart')
      .to(ballAniObj, { color: sliver, duration: duration, onUpdate: () => { coil.changeAnimeValue(ball, ballAniObj) } })
  }

  attack() {
    let coil = this
    if (coil.status === TeslaCoil.STATUS.LOADING && coil.isTargetWithinRange()) {
      // attack anime
      coil.status = TeslaCoil.STATUS.ATTACKING
      let topPoint = coil.getTopPoint()
      let targetPoint = coil.target.getCenterPoint()
      let toVec = targetPoint.copy().subtract(topPoint)
      let angelY = Math.atan(toVec.z / toVec.x) + (toVec.x < 0 ? Zdog.TAU / 2 : 0)
      let angelZ = Math.atan(toVec.y / Math.sqrt(toVec.x ** 2 + toVec.z ** 2))
      let rotate = new Zdog.Vector({ y: angelY, z: angelZ })
      let distance = ZdogUtils.getDistance(topPoint, targetPoint)
      let inflectionPointNum = distance / 50
      let duration = 0.8
      new Lightning(coil.addTo, topPoint, rotate, 10 * coil.scale, distance, inflectionPointNum, duration, 12)
      new LightningExplosion(coil.addTo, targetPoint, coil.scale * 2, duration * 1.1, 10, 10)
      coil.target.getDamage(TeslaCoil.AP)
      coil.loadTime = 0
      coil.target = null

      gsap.timeline({}).call(() => {
        if (coil.status === TeslaCoil.STATUS.ATTACKING) {
          coil.status = TeslaCoil.STATUS.STANDBY
        }
      }, null, duration)
    } else {
      coil.status = TeslaCoil.STATUS.STANDBY
    }
  }

  lean() {
    let coil = this
    if (coil.isEnd()) return
    let anchor = coil.partArr[4][7]
    let topCoil = coil.partArr[4][5]
    let midCoil = coil.partArr[4][4]
    let bottomCoil = coil.partArr[4][3]
    if (coil.isLean() && coil.status !== TeslaCoil.STATUS.SELLING) {
      anchor.rotate.z = Zdog.TAU / 36
      anchor.rotate.x = Zdog.TAU / 36
      topCoil.rotate.y = -Zdog.TAU / 20
      midCoil.translate.x = 10
      bottomCoil.rotate.y = Zdog.TAU / 20
    } else {
      anchor.rotate.z = 0
      anchor.rotate.x = 0
      topCoil.rotate.y = 0
      midCoil.translate.x = 0
      bottomCoil.rotate.y = 0
    }
  }

  sell() {
    let coil = this
    if (!(
      coil.status === TeslaCoil.STATUS.STANDBY ||
      coil.status === TeslaCoil.STATUS.LOADING ||
      coil.status === TeslaCoil.STATUS.ATTACKING
    )) return
    let part = coil.partArr
    coil.sell_tl = gsap.timeline({
      onStart: () => {
        coil.status = TeslaCoil.STATUS.SELLING
        if (coil.lightning) {
          coil.lightning.remove()
        }
      },
      onComplete: () => {
        if (coil.status === TeslaCoil.STATUS.SELLING) {
          coil.remove()
        }
      }
    })
    let tl = coil.sell_tl
    // sell anime
    // 1.coil
    let coilAniObj = {
      '1_path_1_y': -400,
      '2_translate_y': -70,
      '3_translate_y': -150,
      '4_translate_y': -250,
      '5_translate_y': -350,
      '6_translate_y': -475,
    }
    tl.addLabel('coilStart', 0)
      .to(coilAniObj,
        {
          '1_path_1_y': -50,
          '2_translate_y': 0,
          '3_translate_y': 0,
          '4_translate_y': 0,
          '5_translate_y': 0,
          '6_translate_y': 0,
          ease: 'power4.in',
          duration: 0.75,
          onUpdate: () => {
            coil.changeAnimeValue(part[4], coilAniObj)
            part[4][1].updatePath()
          }
        },
        'coilStart')
      .call(() => { part[4].forEach(ele => { ele.visible = !ele.visible }) })
    // 2.bottomPipe
    let bottomPipeAniObj = { translate_y: 0 }
    tl.addLabel('bottomPipeStart', 0.5)
      .to(bottomPipeAniObj,
        { translate_y: 40, duration: 1, ease: 'power4.in', onUpdate: () => { coil.changeAnimeValue(part[1][0], bottomPipeAniObj) } },
        'bottomPipeStart')
      .call(() => { part[1].forEach(ele => { ele.visible = !ele.visible }) })
    // 3.middlePart
    let middlePartAniObj = { translate_y: 0 }
    tl.addLabel('middlePartStart', 0.5)
      .to(middlePartAniObj,
        { translate_y: 65, duration: 1, ease: 'power4.in', onUpdate: () => { coil.changeAnimeValue(part[3][0], middlePartAniObj) } },
        'middlePartStart')
      .call(() => { part[3].forEach(ele => { ele.visible = !ele.visible }) })
    // 4.base
    let baseAniObj = { translate_y: -55 }
    tl.addLabel('baseStart', 1)
      .to(baseAniObj,
        { translate_y: 0, duration: 1, onUpdate: () => { coil.changeAnimeValue(part[0][0], baseAniObj) } },
        'baseStart')
      .call(() => { part[0].forEach(ele => { ele.visible = !ele.visible }) })
    // 5.frame
    let frameAniObj = { translate_y: 0 }
    tl.to(frameAniObj,
      { translate_y: 40, duration: 1, onUpdate: () => { coil.changeAnimeValue(part[2][0], frameAniObj) } }, 1.5)
      .call(() => { part[2].forEach(ele => { ele.visible = !ele.visible }) })
  }

  destroyed() {
    let coil = this
    new Explosion(coil.addTo, coil.centerPoint, 4 * coil.scale, 3)
    coil.remove()
  }

  remove() {
    let coil = this
    coil.status = TeslaCoil.STATUS.END
    coil.addTo = null
    coil.scale = null
    coil.map = null
    coil.mapIndex = null
    coil.teamColor = null
    coil.buildingType = null
    coil.isAutoRepairMode = null
    coil.target = null
    coil.centerPoint = null
    coil.loadTime = null
    coil.hp = null
    coil.partArr = null
    if (coil.anchor) {
      coil.anchor.remove()
      coil.anchor = null     
    }
    if (coil.model) {
      coil.model.remove()
      coil.model = null    
    }
    if (coil.tl) {
      coil.tl.kill()
      coil.tl = null    
    }
    if (coil.build_tl) {
      coil.build_tl.kill()
      coil.build_tl = null
    }
    if (coil.sell_tl) {
      coil.sell_tl.kill()
      coil.sell_tl = null
    }
    if (coil.loading_tl) {
      coil.loading_tl.kill()
      coil.loading_tl = null
    }
    if (coil.lightning) {
      coil.lightning.remove()
      coil.lightning = null
    }
    if (coil.spanner) {
      coil.spanner.remove()
      coil.spanner = null
    }
  }

  isEnd() {
    let coil = this
    return coil.status === TeslaCoil.END
  }

  isLean() {
    let coil = this
    return coil.hp < TeslaCoil.MAX_HP * 0.5
  }

  isCD() {
    let coil = this
    return coil.loadTime < TeslaCoil.ATTACK_CD
  }

  isTargetWithinRange() {
    let coil = this
    return coil.target && !coil.target.isEnd() &&
      ZdogUtils.getDistance(coil.getTopPoint(), coil.target.getCenterPoint()) <= TeslaCoil.ATTACK_RANGE
  }

  static BUILDING_TYPE = 1
  static MAX_HP = 800
  static AP = 200
  static ATTACK_CD = 8
  static ATTACK_RANGE = 2500
  static AUTO_REPAIR_VAL = 1
  static RENDER_PERIOD = 0.1

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
    const red = thisCoil.teamColor ? thisCoil.teamColor : '#FF0000'
    const silver = '#EEF'
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
      color: '#DFDFDF',
      visible: isVisible
    })
    // 4.coil:top ball
    let topBall = new Zdog.Shape({
      addTo: coilAnchor,
      translate: { y: -475 },
      stroke: 140 * scale,
      color: silver,
      visible: isVisible
    })
    // 4.coil:bottom little coil
    let littleCoil = new Zdog.Ellipse({
      addTo: coilAnchor,
      diameter: 50,
      translate: { y: -70 },
      rotate: { x: TAU4 },
      stroke: 20 * scale,
      color: silver,
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
      color: silver,
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
      color: silver,
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
      color: silver,
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