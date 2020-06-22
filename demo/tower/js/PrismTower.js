class PrismTower {
    constructor(addTo, translate, rotate, scale, teamColor, map) {
        let prism = this
        prism.addTo = addTo
        prism.map = map
        prism.teamColor = teamColor
        prism.status = PrismTower.STATUS.CREATED
        prism.hp = PrismTower.MAX_HP
        prism.scale = scale
        prism.isAutoRepairMode = true
        prism.target = null
        prism.loadTime = 0
        prism.partArr = []
        prism.model = prism.getModel(addTo, translate, rotate, scale)
        prism.anchor = new Zdog.Anchor({ addTo: prism.model })
        prism.centerPoint = new Zdog.Vector(translate).subtract({ y: 200 * scale })
        prism.tl = gsap.timeline({ repeat: -1 })
            .to(1, { duration: PrismTower.RENDER_PERIOD })
            .call(() => { prism.render() })
    }

    render() {
        let prism = this
        if (prism.isEnd()) return
        if (prism.hp <= 0) prism.status = PrismTower.STATUS.DESTROYED

        // autoRepairMode
        prism.autoRepairModeAnime()
        prism.autoRepair()

        // lean the tower if damaged
        prism.lean()

        switch (prism.status) {
            case PrismTower.STATUS.STANDBY:
                prism.standby()
                break
            case PrismTower.STATUS.DESTROYED:
                prism.destroyed()
                break
        }
    }

    build() {
        let prism = this
        let part = prism.partArr
        if (prism.status !== PrismTower.STATUS.CREATED) return
        prism.build_tl = gsap.timeline({
            onStart: () => { prism.status = PrismTower.STATUS.BUILDING },
            onComplete: () => { prism.status = PrismTower.STATUS.STANDBY }
        })
        let tl = prism.build_tl
        // build anime
        // 1.base
        tl.call(() => { part[0][1].visible = true })
            .call(() => { part[0].forEach(ele => { ele.visible = true }) }, null, 0.3)
            .to(1, { duration: 0.2 })
        // 2.pillar
        let pillarAniObj = { translate_y: 80 }
        tl.call(() => { part[1].forEach(ele => { ele.visible = true }) })
            .to(pillarAniObj, {
                translate_y: 0,
                duration: 0.5,
                onUpdate: () => { prism.changeAnimeValue(prism.partArr[1][0], pillarAniObj) }
            })
        // 3.prism
        let prismAniObj = { translate_y: 300, translate_z: 10, rotate_x: -Zdog.TAU / 2.5 }
        tl.addLabel('prismStart')
        tl.call(() => { part[3].forEach(ele => { ele.visible = true }) })
            .to(prismAniObj, {
                rotate_x: 0,
                translate_y: 0,
                translate_z: 0,
                duration: 1,
                onUpdate: () => {
                    for (let i = 0; i < 6; i++) {
                        const anchor = prism.partArr[3][i * 8]
                        prism.changeAnimeValue(anchor, prismAniObj)
                    }
                }
            })
        // 4.hinge
        tl.call(() => { part[2].forEach(ele => { ele.visible = true }) }, null, 'prismStart+=0.9')
    }

    getTopPoint() {
        let prism = this
        if (prism.isLean()) {
            return prism.model.translate.copy().subtract({ x: 25 * prism.scale, y: 445 * prism.scale, z: -25 * prism.scale })
        } else {
            return prism.model.translate.copy().subtract({ y: 450 * prism.scale })
        }
    }

    getCenterPoint() {
        return this.centerPoint
    }

    standby() {
        let prism = this
        if (prism.status !== PrismTower.STATUS.STANDBY) return
        prism.loadTime += PrismTower.RENDER_PERIOD

        if (!prism.isCD() && prism.findAndSetTarget()) {
            prism.loading()
        } else {
            let spinAnchor = prism.partArr[2][2]
            spinAnchor.rotate.y -= 2
        }
    }

    findAndSetTarget() {
        let prism = this
        // TODO find target on map
        return false
    }

    repair(v) {
        this.getDamage(-v)
    }

    switchAutoRepairMode() {
        let prism = this
        prism.isAutoRepairMode = !prism.isAutoRepairMode
        return prism.isAutoRepairMode
    }

    autoRepair() {
        let prism = this
        if (prism.isAutoRepairMode &&
            !prism.isEnd() &&
            prism.hp < PrismTower.MAX_HP) {
            prism.repair(PrismTower.AUTO_REPAIR_VAL)
        }
    }

    autoRepairModeAnime() {
        let prism = this
        if (prism.isAutoRepairMode &&
            !prism.isEnd() &&
            prism.hp < PrismTower.MAX_HP &&
            (!prism.spanner || prism.spanner.isEnd)) {
            prism.spanner = new Spanner(prism.anchor, { x: 150, y: -300 }, { x: Zdog.TAU / 4 }, 150, 2, 5, 1, '#CBCBCB', 3, 2)
        }
    }

    getDamage(damage) {
        let prism = this
        let hp = prism.hp - damage
        if (hp > PrismTower.MAX_HP) {
            hp = PrismTower.MAX_HP
        } else if (hp < 0) {
            hp = 0
        }
        prism.hp = hp
    }

    isSameTeam(teamColor) {
        let prism = this
        return prism.teamColor === teamColor
    }

    loading() {
        let prism = this
        if (prism.status !== PrismTower.STATUS.STANDBY) return
        prism.loading_tl = gsap.timeline({
            onStart: () => {
                prism.status = PrismTower.STATUS.LOADING
            },
            onUpdate: () => {
                if (!prism.isTargetWithinRange() && prism.status === PrismTower.STATUS.LOADING) {
                    prism.status = PrismTower.STATUS.STANDBY
                    prism.loading_tl.kill()
                    prism.loading_tl = null
                }
            }
        })

        let tl = prism.loading_tl

        // 1.pillar
        let pillarColor = '#52519C'
        let mirrorColor = '#EEEEEE'
        let pillarAniObj = { color: pillarColor }
        let mirrorAniObj = { color: mirrorColor }
        tl.to(pillarAniObj, {
            color: '#DDE4FF',
            duration: 1,
            onUpdate: () => {
                for (let i = 0; i < 6; i++) {
                    prism.partArr[1][3 + 2 * i] = prism.recreateWithAnimeValue(prism.partArr[1][3 + 2 * i], pillarAniObj)
                }
            }
        }, 'pillarMiddle')
            .to(pillarAniObj, {
                color: pillarColor,
                duration: 1,
                onUpdate: () => {
                    for (let i = 0; i < 6; i++) {
                        prism.partArr[1][3 + 2 * i] = prism.recreateWithAnimeValue(prism.partArr[1][3 + 2 * i], pillarAniObj)
                    }
                }
            })
        // 2.mirror
        tl.to(mirrorAniObj, {
            color: '#FFFFFF',
            duration: 0.6,
            onUpdate: () => {
                for (let i = 0; i < 6; i++) {
                    prism.changeAnimeValue(prism.partArr[3][7 + 8 * i], mirrorAniObj)
                }
            },
            onComplete: () => {
                if (prism.status === PrismTower.STATUS.LOADING) {
                    prism.attack()
                }
            }
        }, 'pillarMiddle+=0.2')
            .to(mirrorAniObj, {
                color: mirrorColor,
                duration: 0.6,
                onUpdate: () => {
                    for (let i = 0; i < 6; i++) {
                        prism.changeAnimeValue(prism.partArr[3][7 + 8 * i], mirrorAniObj)
                    }
                }
            })
    }

    setPillarLaser() {
        let prism = this
        if (prism.pillar_laser) {
            prism.pillar_laser.remove()
        }
        prism.pillar_laser = new Zdog.Group({
            addTo: prism.anchor
        })
        let color = 'white'
        let sidePillarNum = 6
        let sidePillarRadius = 55
        for (let i = 0; i < sidePillarNum; i++) {
            let anchor = new Zdog.Anchor({
                addTo: prism.pillar_laser,
                rotate: { y: TAU * i / sidePillarNum }
            })

            new Zdog.Shape({
                addTo: anchor,
                path: [{}, { y: -20 }],
                stroke: 15 * prism.scale,
                translate: { y: -70, z: sidePillarRadius },
                color: color
            })
        }
    }

    attack() {
        let prism = this
        if (prism.status === PrismTower.STATUS.LOADING && prism.isTargetWithinRange()) {
            // TODO test attack anime
            prism.status = PrismTower.STATUS.ATTACKING
            let topPoint = prism.getTopPoint()
            let targetPoint = prism.target.getCenterPoint()
            let toVec = targetPoint.copy().subtract(topPoint)
            let angelY = Math.atan(toVec.z / toVec.x) + (toVec.x < 0 ? Zdog.TAU / 2 : 0)
            let angelZ = Math.atan(toVec.y / Math.sqrt(toVec.x ** 2 + toVec.z ** 2))
            let rotate = new Zdog.Vector({ y: angelY, z: angelZ })
            let distance = ZdogUtils.getDistance(topPoint, targetPoint)
            let duration = 1
            new Laser(prism.addTo, topPoint, rotate, 40 * prism.scale, distance, duration)
            new LaserExplosion(prism.addTo, targetPoint, prism.scale, 0.5, 3)
            prism.target.getDamage(PrismTower.AP)

            prism.status = PrismTower.STATUS.STANDBY
            prism.loadTime = 0
        } else {
            prism.status = PrismTower.STATUS.STANDBY
        }
    }

    lean() {
        let prism = this
        if (prism.isEnd()) return
        let spinOffesetAnchor = prism.partArr[2][1]
        if (prism.isLean() && prism.status !== PrismTower.STATUS.SELLING) {
            spinOffesetAnchor.rotate.x = -Zdog.TAU / 50
            spinOffesetAnchor.rotate.z = -Zdog.TAU / 50
            spinOffesetAnchor.translate.y = 5
        } else {
            spinOffesetAnchor.rotate.x = 0
            spinOffesetAnchor.rotate.z = 0
            spinOffesetAnchor.translate.y = 0
        }
    }

    sell() {
        let prism = this
        if (!(
            prism.status === PrismTower.STATUS.STANDBY ||
            prism.status === PrismTower.STATUS.LOADING ||
            prism.status === PrismTower.STATUS.ATTACKING
        )) return
        let part = prism.partArr
        prism.sell_tl = gsap.timeline({
            onStart: () => {
                prism.status = PrismTower.STATUS.SELLING
            },
            onComplete: () => {
                if (prism.status === PrismTower.STATUS.SELLING) {
                    prism.remove()
                }
            }
        })
        let tl = prism.sell_tl
        // sell anime
        // 1.hinge
        tl.call(() => { part[2].forEach(ele => { ele.visible = false }) }, null, 0.1)
        // 2.prism
        let prismAniObj = { translate_y: 0, translate_z: 0, rotate_x: 0 }
        tl.to(prismAniObj, {
            rotate_x: -Zdog.TAU / 2.5,
            translate_y: 300,
            translate_z: 10,
            duration: 1,
            onUpdate: () => {
                for (let i = 0; i < 6; i++) {
                    const anchor = prism.partArr[3][i * 8]
                    prism.changeAnimeValue(anchor, prismAniObj)
                }
            }
        })
            .call(() => { part[3].forEach(ele => { ele.visible = false }) })
        // 3.pillar
        let pillarAniObj = { translate_y: 0 }
        tl.to(pillarAniObj, {
            translate_y: 80,
            duration: 0.5,
            onUpdate: () => { prism.changeAnimeValue(prism.partArr[1][0], pillarAniObj) }
        })
            .call(() => { part[1].forEach(ele => { ele.visible = false }) })

        // 4.base
        tl.addLabel('baseStart')
        tl.call(() => {
            for (let i = 2; i < part[0].length; i++) {
                part[0][i].visible = false
            }
        }, null, 'baseStart+=0.2')
            .call(() => { part[0][1].visible = false }, null, 'baseStart+=0.5')
    }

    destroyed() {
        let prism = this
        new Explosion(prism.addTo, prism.centerPoint, 4 * prism.scale, 3)
        prism.remove()
    }

    remove() {
        let prism = this
        if (prism.isEnd()) return
        prism.addTo = null
        prism.map = null
        prism.status = PrismTower.STATUS.END
        prism.isAutoRepairMode = false
        prism.target = null
        prism.centerPoint = null
        prism.loadTime = 0
        prism.hp = 0
        prism.partArr.length = 0
        prism.anchor.remove()
        prism.anchor = null
        prism.model.remove()
        prism.model = null
        prism.tl.kill()
        prism.tl = null
        if (prism.build_tl) {
            prism.build_tl.kill()
            prism.build_tl = null
        }
        if (prism.sell_tl) {
            prism.sell_tl.kill()
            prism.sell_tl = null
        }
        if (prism.loading_tl) {
            prism.loading_tl.kill()
            prism.loading_tl = null
        }
        if (prism.spanner) {
            prism.spanner.remove()
            prism.spanner = null
        }
    }

    isEnd() {
        let prism = this
        return prism.status === PrismTower.END || prism.status === PrismTower.CREATED
    }

    isLean() {
        let prism = this
        return prism.hp < PrismTower.MAX_HP * 0.5
    }

    isCD() {
        let prism = this
        return prism.loadTime < PrismTower.ATTACK_CD
    }

    isTargetWithinRange() {
        let prism = this
        return prism.target && !prism.target.isEnd() &&
            ZdogUtils.getDistance(prism.getTopPoint(), prism.target.getCenterPoint()) <= PrismTower.ATTACK_RANGE
    }

    static MAX_HP = 800
    static AP = 200
    static ATTACK_CD = 8
    static ATTACK_RANGE = 2000
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

    recreateWithAnimeValue(model, animeObject) {
        let newModel = model.copy(animeObject)
        model.remove()
        return newModel
    }

    getModel(addTo, translate, rotate, scale) {
        let prism = this

        const silver = '#DFDFDF'
        const blue = prism.teamColor ? prism.teamColor : '#FF0000'
        const black = '#000000'
        const TAU = Zdog.TAU
        const TAU4 = TAU / 4
        const isVisible = false

        let baseArr = []
        let pillarArr = []
        let hingeArr = []
        let prismArr = []

        // [0]
        prism.partArr.push(baseArr)
        // [1]
        prism.partArr.push(pillarArr)
        // [2]
        prism.partArr.push(hingeArr)
        // [3]
        prism.partArr.push(prismArr)

        let prismTower = new Zdog.Shape({
            addTo: addTo,
            translate: translate,
            rotate: rotate,
            scale: scale,
            visible: isVisible
        })

        let base = new Zdog.Shape({
            addTo: prismTower,
            visible: isVisible
        })

        // half-pace circle1
        let base1 = new Zdog.Ellipse({
            addTo: base,
            diameter: 200,
            rotate: { x: TAU4 },
            translate: { y: 5 },
            stroke: 10 * scale,
            color: '#AEAEAE',
            fill: true,
            visible: isVisible
        })
        // half-pace circle2
        let base2 = new Zdog.Ellipse({
            addTo: base,
            diameter: 160,
            translate: { y: -9, z: 0 },
            rotate: { x: TAU4 },
            stroke: 20 * scale,
            color: silver,
            fill: true,
            visible: isVisible
        })
        // half-pace circle3
        let base3 = new Zdog.Ellipse({
            addTo: base,
            diameter: 153,
            translate: { y: -22 },
            rotate: { x: TAU4 },
            stroke: 20 * scale,
            color: silver,
            fill: true,
            visible: isVisible
        })
        // half-pace circle4
        let base4 = new Zdog.Ellipse({
            addTo: base,
            diameter: 146,
            translate: { y: -35 },
            rotate: { x: TAU4 },
            stroke: 20 * scale,
            color: silver,
            fill: true,
            visible: isVisible
        })
        // half-pace circle5
        let base5 = new Zdog.Ellipse({
            addTo: base,
            diameter: 140,
            translate: { y: -47 },
            rotate: { x: TAU4 },
            stroke: 20 * scale,
            color: silver,
            fill: true,
            visible: isVisible
        })

        baseArr.push(base)
        baseArr.push(base1)
        baseArr.push(base2)
        baseArr.push(base3)
        baseArr.push(base4)
        baseArr.push(base5)

        // fans
        let fanNum = 4
        let fanRadius = 85
        for (let i = 0; i < fanNum; i++) {
            let anchor = new Zdog.Anchor({
                addTo: base,
                rotate: { y: TAU * i / fanNum },
                translate: { y: -30 },
            })
            let fan = new Zdog.Shape({
                addTo: anchor,
            })

            let fanSide = new Zdog.Rect({
                addTo: fan,
                width: 40,
                height: 50,
                stroke: 20 * scale,
                rotate: { x: TAU / 20 },
                translate: { z: fanRadius },
                color: blue,
                fill: true,
                visible: isVisible
            })

            let fanTop = new Zdog.Rect({
                addTo: fan,
                width: 40,
                height: 10,
                stroke: 20 * scale,
                translate: { y: -27, z: -15 + fanRadius },
                rotate: { x: TAU4 },
                color: blue,
                fill: true,
                visible: isVisible
            })

            let fanCenter = new Zdog.Rect({
                addTo: fan,
                width: 25,
                height: 30,
                stroke: 5 * scale,
                translate: { z: 10 + fanRadius },
                rotate: { x: TAU / 20 },
                color: black,
                fill: true,
                visible: isVisible
            })

            baseArr.push(fanSide)
            baseArr.push(fanTop)
            baseArr.push(fanCenter)
        }

        // pillar
        let pillarAnchor = new Zdog.Anchor({
            addTo: prismTower
        })
        let pillarLength = 200
        let bottomHeight = 57
        // center pillar
        let centerPillar = new Zdog.Cylinder({
            addTo: pillarAnchor,
            diameter: 30,
            length: pillarLength,
            stroke: false,
            translate: { y: -pillarLength / 2 - bottomHeight },
            rotate: { x: TAU4 },
            color: black,
            visible: isVisible
        })

        pillarArr.push(pillarAnchor)
        pillarArr.push(centerPillar)
        // side pillars
        let sidePillarNum = 6
        let sidePillarRadius = 40
        let sidePillarBaseHeight = 10
        for (let i = 0; i < sidePillarNum; i++) {
            let anchor = new Zdog.Anchor({
                addTo: pillarAnchor,
                rotate: { y: TAU * i / sidePillarNum },
                translate: { y: -bottomHeight },
            })
            let sidePillarBase = new Zdog.Cylinder({
                addTo: anchor,
                diameter: 30,
                length: sidePillarBaseHeight,
                stroke: 3 * scale,
                translate: { y: -sidePillarBaseHeight / 2, z: sidePillarRadius },
                rotate: { x: TAU4 },
                color: '#4A494A',
                visible: isVisible
            })

            let sidePillar = new Zdog.Cylinder({
                addTo: anchor,
                diameter: 15,
                length: pillarLength - sidePillarBaseHeight,
                stroke: false,
                translate: { y: -(pillarLength - sidePillarBaseHeight) / 2 - sidePillarBaseHeight, z: sidePillarRadius },
                rotate: { x: TAU4 },
                color: '#52519C',
                visible: isVisible
            })

            pillarArr.push(sidePillarBase)
            pillarArr.push(sidePillar)
        }
        // pillar-top
        let pillarTop = new Zdog.Ellipse({
            addTo: pillarAnchor,
            diameter: 110,
            translate: { y: -267 },
            rotate: { x: TAU4 },
            stroke: 20 * scale,
            color: silver,
            fill: true,
            visible: isVisible
        })
        pillarArr.push(pillarTop)
        // bulbs
        let bulbNum = 6;
        let bulbRadius = 65;
        for (let i = 0; i < bulbNum; i++) {
            let anchor = new Zdog.Anchor({
                addTo: pillarAnchor,
                rotate: { y: TAU * i / bulbNum },
                translate: { y: -267 },
            })
            let bulb = new Zdog.Shape({
                addTo: anchor,
                stroke: 15 * scale,
                translate: { z: bulbRadius },
                color: '#FFD700',
                visible: isVisible
            })
            pillarArr.push(bulb)
        }

        // hinge
        let topAnchor = new Zdog.Anchor({
            addTo: prismTower,
            translate: { y: -300 }
        })

        let hinge1 = new Zdog.Ellipse({
            addTo: topAnchor,
            diameter: 100,
            translate: { y: 12 },
            rotate: { x: TAU4 },
            stroke: 10 * scale,
            color: blue,
            fill: true,
            visible: isVisible
        })
        let hinge2 = new Zdog.Cylinder({
            addTo: topAnchor,
            diameter: 90,
            translate: { y: 2 },
            rotate: { x: TAU4 },
            length: 30,
            color: black,
            fill: true,
            stroke: 3 * scale,
            visible: isVisible
        })

        let spinOffsetAnchor = new Zdog.Anchor({
            addTo: topAnchor
        })

        let spinAnchor = new Zdog.Anchor({
            addTo: spinOffsetAnchor
        })

        // half-pace circle1
        let hingeCircle1 = new Zdog.Ellipse({
            addTo: spinAnchor,
            diameter: 110,
            translate: { y: -26 },
            rotate: { x: TAU4 },
            stroke: 20 * scale,
            color: silver,
            fill: true,
            visible: isVisible
        })
        // half-pace circle2
        let hingeCircle2 = new Zdog.Ellipse({
            addTo: spinAnchor,
            diameter: 110,
            translate: { y: -38 },
            rotate: { x: TAU4 },
            stroke: 20 * scale,
            color: silver,
            fill: true,
            visible: isVisible
        })
        // half-pace circle3
        let hingeCircle3 = new Zdog.Ellipse({
            addTo: spinAnchor,
            diameter: 100,
            translate: { y: -48 },
            rotate: { x: TAU4 },
            stroke: 20 * scale,
            color: silver,
            fill: true,
            visible: isVisible
        })
        // half-pace circle4
        let hingeCircle4 = new Zdog.Ellipse({
            addTo: spinAnchor,
            diameter: 95,
            translate: { y: -58 },
            rotate: { x: TAU4 },
            stroke: 10 * scale,
            color: blue,
            fill: true,
            visible: isVisible
        })

        let hingeCircle5 = new Zdog.Cylinder({
            addTo: spinAnchor,
            diameter: 60,
            stroke: 10 * scale,
            translate: { y: -125 },
            rotate: { x: TAU4 },
            length: 120,
            color: black,
            fill: true,
            visible: isVisible
        })
        hingeArr.push(topAnchor)
        hingeArr.push(spinOffsetAnchor)
        hingeArr.push(spinAnchor)
        hingeArr.push(hinge1)
        hingeArr.push(hinge2)
        hingeArr.push(hingeCircle1)
        hingeArr.push(hingeCircle2)
        hingeArr.push(hingeCircle3)
        hingeArr.push(hingeCircle4)
        hingeArr.push(hingeCircle5)

        // prism
        let prismNum = 6
        let prismRadius = 42
        for (let i = 0; i < prismNum; i++) {
            let pipeAnchor = new Zdog.Anchor({
                addTo: spinAnchor,
                rotate: { y: TAU * i / prismNum },
                translate: { y: -100 }
            })

            let pipe = new Zdog.Rect({
                addTo: pipeAnchor,
                width: 8,
                height: 30,
                stroke: 5 * scale,
                color: '#4F0000',
                translate: { y: 20, z: 35 },
                fill: true,
                visible: isVisible
            })

            let prismAnchor = new Zdog.Anchor({
                addTo: spinAnchor,
                rotate: { y: TAU * i / prismNum },
                translate: { y: -100 }
            })

            let prismPartAnchor = new Zdog.Anchor({
                addTo: prismAnchor
            })

            let prismBack = new Zdog.Shape({
                addTo: prismPartAnchor,
                stroke: 10 * scale,
                translate: { z: prismRadius },
                color: '#AAAAAA',
                fill: true,
                path: [
                    { x: -20 },
                    { x: 20 },
                    { x: 20, y: -90 },
                    { x: -20, y: -90 },
                ],
                visible: isVisible
            })

            let prismBottom = new Zdog.Shape({
                addTo: prismPartAnchor,
                stroke: 10 * scale,
                translate: { z: prismRadius },
                color: '#AAAAAA',
                fill: true,
                path: [
                    { x: 20 },
                    { x: -20 },
                    { x: -20, z: 15 },
                    { x: 20, z: 15 },
                ],
                visible: isVisible
            })

            let prismLeft = new Zdog.Shape({
                addTo: prismPartAnchor,
                stroke: 10 * scale,
                translate: { z: prismRadius },
                color: '#AAAAAA',
                fill: true,
                path: [
                    { x: -20, z: 15 },
                    { x: -20, z: 0 },
                    {
                        bezier: [
                            { x: -20, y: -100, z: 0 },
                            { x: -20, y: -110, z: 5 },
                            { x: -20, y: -120, z: 45 },
                        ]
                    },
                ],
                visible: isVisible
            })

            let prismRight = prismLeft.copy({
                addTo: prismPartAnchor,
                color: "#BBCCCC",
                translate: { x: 40, z: prismRadius }
            })

            let prismFront = new Zdog.Shape({
                addTo: prismPartAnchor,
                stroke: 10 * scale,
                translate: { z: prismRadius },
                color: silver,
                fill: true,
                path: [
                    { x: -20, z: 20 },
                    { x: 20, z: 20 },
                    { x: 20, y: -120, z: 45 },
                    { x: -20, y: -120, z: 45 },
                ],
                visible: isVisible
            })

            let prismTop = new Zdog.Shape({
                addTo: prismPartAnchor,
                stroke: 5 * scale,
                translate: { z: prismRadius },
                color: '#AAAACC',
                fill: true,
                path: [
                    { x: 14, y: -88, z: 5 },
                    { x: -14, y: -88, z: 5 },
                    { x: -14, y: -94, z: 43 },
                    { x: 14, y: -94, z: 43 },
                ],
                visible: isVisible
            })

            let mirror = new Zdog.Rect({
                addTo: prismPartAnchor,
                width: 28,
                height: 100,
                stroke: 15 * scale,
                color: '#EEEEEE',
                rotate: { x: -TAU / 30 },
                translate: { y: -60, z: prismRadius + 43 },
                fill: true,
                visible: isVisible
            })

            hingeArr.push(pipeAnchor)
            hingeArr.push(pipe)
            prismArr.push(prismPartAnchor)
            prismArr.push(prismBack)
            prismArr.push(prismBottom)
            prismArr.push(prismLeft)
            prismArr.push(prismRight)
            prismArr.push(prismFront)
            prismArr.push(prismTop)
            prismArr.push(mirror)
        }

        return prismTower
    }
}