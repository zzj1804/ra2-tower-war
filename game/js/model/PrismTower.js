class PrismTower {
    constructor(addTo, translate, rotate, scale, teamColor, map, mapIndex) {
        let prism = this
        prism.addTo = addTo
        prism.map = map
        prism.mapIndex = mapIndex
        prism.teamColor = teamColor
        prism.buildingType = PrismTower.BUILDING_TYPE
        prism.status = PrismTower.STATUS.CREATED
        prism.hp = PrismTower.MAX_HP
        prism.scale = scale
        prism.isAutoRepairMode = true
        prism.target = null
        prism.loadTime = PrismTower.ATTACK_CD
        prism.partArr = []
        prism.model = prism.getModel(addTo, translate, rotate, scale)
        prism.anchor = new Zdog.Anchor({ addTo: prism.model })
        prism.centerPoint = new Zdog.Vector(prism.model.translate).subtract(new Zdog.Vector({ y: 200 * prism.scale }).rotate(prism.model.rotate))
        prism.normalTopPoint = new Zdog.Vector(prism.model.translate).subtract(new Zdog.Vector({ y: 450 * prism.scale }).rotate(prism.model.rotate))
        prism.leanTopPoint = new Zdog.Vector(prism.model.translate).subtract(new Zdog.Vector({ x: 25 * prism.scale, y: 445 * prism.scale, z: -25 * prism.scale }).rotate(prism.model.rotate))

        prism.tl = gsap.timeline({ repeat: -1 })
            .to(1, { duration: PrismTower.RENDER_PERIOD })
            .call(() => { prism.render() })
    }

    render() {
        let prism = this
        if (prism.status === PrismTower.STATUS.CREATED || prism.isEnd()) return
        if (prism.hp <= 0) prism.status = PrismTower.STATUS.DESTROYED

        // autoRepairMode
        prism.autoRepairModeAnime()
        prism.autoRepair()

        // lean the tower if damaged
        prism.lean()

        // smoke cause perspective bug
        prism.smoke()

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
        if (prism.status !== PrismTower.STATUS.CREATED || !part) return
        prism.build_tl = gsap.timeline({
            onStart: () => {
                if (prism.status === PrismTower.STATUS.CREATED) {
                    prism.status = PrismTower.STATUS.BUILDING
                }
            },
            onComplete: () => {
                if (prism.status === PrismTower.STATUS.BUILDING) {
                    prism.status = PrismTower.STATUS.STANDBY
                }
            }
        })
        let tl = prism.build_tl
        // build anime
        // 1.base
        tl.call(() => {
            if (!prism.partArr) return
            part[0][1].visible = true
        })
            .call(() => {
                if (!prism.partArr) return
                part[0].forEach(ele => { ele.visible = true })
            }, null, 0.3)
            .to(1, { duration: 0.2 })
        // 2.pillar
        let pillarAniObj = { translate_y: 80 }
        tl.call(() => {
            if (!prism.partArr) return
            part[1].forEach(ele => { ele.visible = true })
        })
            .to(pillarAniObj, {
                translate_y: 0,
                duration: 0.5,
                onUpdate: () => {
                    if (!prism.partArr) return
                    prism.changeAnimeValue(prism.partArr[1][0], pillarAniObj)
                }
            })
        // 3.prism
        let prismAniObj = { translate_y: 300, translate_z: 10, rotate_x: -Zdog.TAU / 2.5 }
        tl.addLabel('prismStart')
        tl.call(() => {
            if (!prism.partArr) return
            part[3].forEach(ele => { ele.visible = true })
        })
            .to(prismAniObj, {
                rotate_x: 0,
                translate_y: 0,
                translate_z: 0,
                duration: 1,
                onUpdate: () => {
                    if (!prism.partArr) return
                    for (let i = 0; i < 6; i++) {
                        const anchor = prism.partArr[3][i * 8]
                        prism.changeAnimeValue(anchor, prismAniObj)
                    }
                }
            })
        // 4.hinge
        tl.call(() => {
            if (!prism.partArr) return
            part[2].forEach(ele => { ele.visible = true })
        }, null, 'prismStart+=0.9')
    }

    getTopPoint() {
        let prism = this
        if (prism.isLean()) {
            return prism.leanTopPoint
        } else {
            return prism.normalTopPoint
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
            prism.findAndSetLaserHelper()
            prism.loading()
        } else {
            if (!prism.partArr) return
            let spinAnchor = prism.partArr[2][2]
            spinAnchor.rotate.y -= 2
        }
    }

    findAndSetTarget() {
        let prism = this
        // find target on map,bfs
        if (!prism.map || !prism.mapIndex) return false
        let buildingArr = prism.map.isoArr
        let len = prism.map.isoArr.length
        let startPoi = { x: prism.mapIndex.x, y: prism.mapIndex.y }
        let diers = [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 }]
        let visits = new Array(len)
        for (let i = 0; i < visits.length; i++) {
            visits[i] = new Array(len).fill(false)
        }
        visits[startPoi.x][startPoi.y] = true
        let queue = []
        queue.push(startPoi)
        while (queue.length > 0) {
            let poi = queue.shift()
            for (let i = 0; i < diers.length; i++) {
                const dier = diers[i]
                let tx = poi.x + dier.x
                let ty = poi.y + dier.y
                if (tx >= 0 && tx < len &&
                    ty >= 0 && ty < len &&
                    !visits[tx][ty]) {
                    visits[tx][ty] = true
                    let newPoi = { x: tx, y: ty }
                    queue.push(newPoi)

                    let absX = Math.abs(startPoi.x - tx)
                    let absY = Math.abs(startPoi.y - ty)
                    if (absX === absY && Math.sqrt(absX ** 2 + absY ** 2) * prism.map.gridLength > PrismTower.ATTACK_RANGE) {
                        return false
                    }

                    let building = buildingArr[ty][tx]
                    if (building && !building.isEnd() && !prism.isSameTeam(building.teamColor) &&
                        ZdogUtils.getDistance(prism.getTopPoint(), building.getCenterPoint()) <= PrismTower.ATTACK_RANGE) {
                        prism.target = building
                        return true
                    }
                }
            }
        }
        return false
    }

    findAndSetLaserHelper() {
        let prism = this
        // find target on map,bfs
        if (!prism.map || !prism.mapIndex) return false
        let totalNum = 0
        let buildingArr = prism.map.isoArr
        let len = prism.map.isoArr.length
        let diers = [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 }]
        let visits = new Array(len)
        let queue = []
        let startPoi = { x: prism.mapIndex.x, y: prism.mapIndex.y }
        queue.push(startPoi)
        for (let i = 0; i < visits.length; i++) {
            visits[i] = new Array(len).fill(false)
        }
        visits[startPoi.x][startPoi.y] = true
        while (queue.length > 0) {
            let poi = queue.shift()
            for (let i = 0; i < diers.length; i++) {
                const dier = diers[i]
                let tx = poi.x + dier.x
                let ty = poi.y + dier.y
                if (tx >= 0 && tx < len &&
                    ty >= 0 && ty < len &&
                    !visits[tx][ty]) {
                    visits[tx][ty] = true
                    let newPoi = { x: tx, y: ty }
                    queue.push(newPoi)

                    let absX = Math.abs(startPoi.x - tx)
                    let absY = Math.abs(startPoi.y - ty)
                    if (absX === absY && Math.sqrt(absX ** 2 + absY ** 2) * prism.map.gridLength > PrismTower.ATTACK_RANGE) {
                        return false
                    }

                    let building = buildingArr[ty][tx]
                    if (building && !building.isEnd() &&
                        building.buildingType === PrismTower.BUILDING_TYPE &&
                        prism.isSameTeam(building.teamColor) &&
                        building.setPassLaserTarget(prism)) {
                        totalNum += 1
                    }
                    if (totalNum >= PrismTower.MAX_RECEIVE_LASER_NUM) {
                        return totalNum
                    }
                }
            }
        }
        return totalNum
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
            prism.spanner = new Spanner(prism.anchor, { x: 150, y: -300 }, { x: Zdog.TAU / 4 }, 150, 2, 5, 0.6, '#CBCBCB', 3, 2)
        }
    }

    getDamage(damage) {
        let prism = this
        if (prism.hp > PrismTower.MAX_HP) {
            prism.hp = PrismTower.MAX_HP
        }
        let hp = prism.hp - damage
        if (hp > PrismTower.MAX_HP) {
            hp = PrismTower.MAX_HP
        } else if (hp < 0) {
            hp = 0
        }
        prism.hp = hp
    }

    smoke() {
        let prism = this
        if (prism.hp < PrismTower.MAX_HP * 0.5 && prism.addTo) {
            new Smoke(prism.addTo, prism.getCenterPoint(), {}, 10, 5, 5, 3 * (1 - prism.hp / PrismTower.MAX_HP))
        }
    }

    isSameTeam(teamColor) {
        let prism = this
        return prism.teamColor === teamColor
    }

    loading() {
        let prism = this
        if (prism.status !== PrismTower.STATUS.STANDBY) return
        prism.receive_laser_num = 0

        let pillarColor = '#52519C'
        let mirrorColor = '#EEEEEE'
        prism.loading_tl = gsap.timeline({
            onStart: () => {
                prism.status = PrismTower.STATUS.LOADING
            },
            onUpdate: () => {
                if (!prism.isTargetWithinRange() && prism.status === PrismTower.STATUS.LOADING) {
                    prism.status = PrismTower.STATUS.STANDBY
                    prism.loading_tl.kill()

                    if (!prism.partArr) return
                    for (let i = 0; i < 6; i++) {
                        prism.partArr[1][3 + 2 * i] = prism.recreateWithAnimeValue(prism.partArr[1][3 + 2 * i], { color: pillarColor })
                        prism.partArr[3][7 + 8 * i].color = mirrorColor
                    }
                }
            }
        })

        let tl = prism.loading_tl

        // 1.pillar
        let pillarAniObj = { color: pillarColor }
        let mirrorAniObj = { color: mirrorColor }
        tl.to(pillarAniObj, {
            color: '#DDE4FF',
            duration: 1,
            onUpdate: () => {
                if (!prism.partArr) return
                for (let i = 0; i < 6; i++) {
                    prism.partArr[1][3 + 2 * i] = prism.recreateWithAnimeValue(prism.partArr[1][3 + 2 * i], pillarAniObj)
                }
            }
        }, 'pillarMiddle')
            .to(pillarAniObj, {
                color: pillarColor,
                duration: 1,
                onUpdate: () => {
                    if (!prism.partArr) return
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
                if (!prism.partArr) return
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
                    if (!prism.partArr) return
                    for (let i = 0; i < 6; i++) {
                        prism.changeAnimeValue(prism.partArr[3][7 + 8 * i], mirrorAniObj)
                    }
                }
            })
    }

    attack() {
        let prism = this
        if (prism.status === PrismTower.STATUS.LOADING && prism.isTargetWithinRange()) {
            // attack anime
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

            prism.target.getDamage(PrismTower.AP * (1 + PrismTower.PER_RECEIVE_LASER_AP_AMPLIFICATION * prism.receive_laser_num))

            prism.status = PrismTower.STATUS.STANDBY
            prism.target = null
            prism.loadTime = 0
            prism.receive_laser_num = 0
        } else {
            prism.status = PrismTower.STATUS.STANDBY
        }
    }

    addOneReceiveLaserNum() {
        this.receive_laser_num += 1
    }

    setPassLaserTarget(target) {
        let prism = this
        if (target && target.buildingType === PrismTower.BUILDING_TYPE && !target.isEnd() &&
            prism.status === PrismTower.STATUS.STANDBY && !prism.isCD() && prism.isSameTeam(target.teamColor) &&
            ZdogUtils.getDistance(prism.getTopPoint(), target.getTopPoint()) <= PrismTower.ATTACK_RANGE) {
            prism.pass_laser_target = target
            prism.passLaserLoading()
            return true
        } else {
            return false
        }
    }

    passLaserLoading() {
        let prism = this
        if (prism.status !== PrismTower.STATUS.STANDBY) return
        let pillarColor = '#52519C'
        let mirrorColor = '#EEEEEE'
        prism.pass_laser_loading_tl = gsap.timeline({
            onStart: () => {
                prism.status = PrismTower.STATUS.PASS_LASER_LOADING
            },
            onUpdate: () => {
                if (!prism.isPassLaserTargetWithinRange() && prism.status === PrismTower.STATUS.PASS_LASER_LOADING) {
                    prism.status = PrismTower.STATUS.STANDBY
                    if (prism.pass_laser_loading_tl) {
                        prism.pass_laser_loading_tl.kill()
                    }

                    if (!prism.partArr) return
                    for (let i = 0; i < 6; i++) {
                        prism.partArr[1][3 + 2 * i] = prism.recreateWithAnimeValue(prism.partArr[1][3 + 2 * i], { color: pillarColor })
                        prism.partArr[3][7 + 8 * i].color = mirrorColor
                    }
                }
            }
        })

        let tl = prism.pass_laser_loading_tl

        // 1.pillar
        let pillarAniObj = { color: pillarColor }
        let mirrorAniObj = { color: mirrorColor }
        tl.to(pillarAniObj, {
            color: '#DDE4FF',
            duration: 1,
            onUpdate: () => {
                if (!prism.partArr) return
                for (let i = 0; i < 6; i++) {
                    prism.partArr[1][3 + 2 * i] = prism.recreateWithAnimeValue(prism.partArr[1][3 + 2 * i], pillarAniObj)
                }
            }
        }, 'pillarMiddle')
            .to(pillarAniObj, {
                color: pillarColor,
                duration: 1,
                onUpdate: () => {
                    if (!prism.partArr) return
                    for (let i = 0; i < 6; i++) {
                        prism.partArr[1][3 + 2 * i] = prism.recreateWithAnimeValue(prism.partArr[1][3 + 2 * i], pillarAniObj)
                    }
                }
            })
        // 2.mirror
        tl.to(mirrorAniObj, {
            color: '#FFFFFF',
            duration: 0.5,
            onUpdate: () => {
                if (!prism.partArr) return
                for (let i = 0; i < 6; i++) {
                    prism.changeAnimeValue(prism.partArr[3][7 + 8 * i], mirrorAniObj)
                }
            },
            onComplete: () => {
                if (prism.status === PrismTower.STATUS.PASS_LASER_LOADING) {
                    prism.passLaser()
                }
            }
        }, 'pillarMiddle+=0.2')
            .to(mirrorAniObj, {
                color: mirrorColor,
                duration: 0.6,
                onUpdate: () => {
                    if (!prism.partArr) return
                    for (let i = 0; i < 6; i++) {
                        prism.changeAnimeValue(prism.partArr[3][7 + 8 * i], mirrorAniObj)
                    }
                }
            })
    }

    passLaser() {
        let prism = this
        if (prism.status === PrismTower.STATUS.PASS_LASER_LOADING && prism.isPassLaserTargetWithinRange()) {
            // passing laser anime
            prism.status = PrismTower.STATUS.ATTACKING
            let topPoint = prism.getTopPoint()
            let targetPoint = prism.pass_laser_target.getTopPoint()
            let toVec = targetPoint.copy().subtract(topPoint)
            let angelY = Math.atan(toVec.z / toVec.x) + (toVec.x < 0 ? Zdog.TAU / 2 : 0)
            let angelZ = Math.atan(toVec.y / Math.sqrt(toVec.x ** 2 + toVec.z ** 2))
            let rotate = new Zdog.Vector({ y: angelY, z: angelZ })
            let distance = ZdogUtils.getDistance(topPoint, targetPoint)
            let duration = 1
            prism.pass_laser_target.addOneReceiveLaserNum()
            new Laser(prism.addTo, topPoint, rotate, 40 * prism.scale, distance, duration)

            prism.status = PrismTower.STATUS.STANDBY
            prism.loadTime = 0
            prism.pass_laser_target = null
        } else {
            prism.status = PrismTower.STATUS.STANDBY
            prism.pass_laser_target = null
        }
    }

    lean() {
        let prism = this
        if (prism.isEnd() || !prism.partArr) return
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
        tl.call(() => {
            if (!prism.partArr) return
            part[2].forEach(ele => { ele.visible = false })
        }, null, 0.1)
        // 2.prism
        let prismAniObj = { translate_y: 0, translate_z: 0, rotate_x: 0 }
        tl.to(prismAniObj, {
            rotate_x: -Zdog.TAU / 2.5,
            translate_y: 300,
            translate_z: 10,
            duration: 1,
            onUpdate: () => {
                if (!prism.partArr) return
                for (let i = 0; i < 6; i++) {
                    const anchor = prism.partArr[3][i * 8]
                    prism.changeAnimeValue(anchor, prismAniObj)
                }
            }
        })
            .call(() => {
                if (!prism.partArr) return
                part[3].forEach(ele => { ele.visible = false })
            })
        // 3.pillar
        let pillarAniObj = { translate_y: 0 }
        tl.to(pillarAniObj, {
            translate_y: 80,
            duration: 0.5,
            onUpdate: () => {
                if (!prism.partArr) return
                prism.changeAnimeValue(prism.partArr[1][0], pillarAniObj)
            }
        })
            .call(() => {
                if (!prism.partArr) return
                part[1].forEach(ele => { ele.visible = false })
            })

        // 4.base
        tl.addLabel('baseStart')
        tl.call(() => {
            if (!prism.partArr) return
            for (let i = 2; i < part[0].length; i++) {
                part[0][i].visible = false
            }
        }, null, 'baseStart+=0.2')
            .call(() => {
                if (!prism.partArr) return
                part[0][1].visible = false
            }, null, 'baseStart+=0.5')
    }

    destroyed() {
        let prism = this
        new Explosion(prism.addTo, prism.getCenterPoint(), 3 * prism.scale, 3)
        prism.remove()
    }

    remove() {
        let prism = this
        prism.status = PrismTower.STATUS.END
        prism.addTo = null
        prism.scale = null
        prism.map = null
        prism.mapIndex = null
        prism.buildingType = null
        prism.receive_laser_num = null
        prism.isAutoRepairMode = null
        prism.target = null
        prism.pass_laser_target = null
        prism.loadTime = null
        prism.hp = null
        prism.partArr = null
        if (prism.anchor) {
            prism.anchor.remove()
            prism.anchor = null
        }
        if (prism.model) {
            prism.model.remove()
            prism.model = null
        }
        if (prism.tl) {
            prism.tl.kill()
            prism.tl = null
        }
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
        if (prism.pass_laser_loading_tl) {
            prism.pass_laser_loading_tl.kill()
            prism.pass_laser_loading_tl = null
        }
        if (prism.spanner) {
            prism.spanner.remove()
            prism.spanner = null
        }
    }

    isEnd() {
        let prism = this
        return prism.status === PrismTower.STATUS.END
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

    isPassLaserTargetWithinRange() {
        let prism = this
        return prism.pass_laser_target && !prism.pass_laser_target.isEnd() &&
            ZdogUtils.getDistance(prism.getTopPoint(), prism.pass_laser_target.getTopPoint()) <= PrismTower.ATTACK_RANGE
    }

    static BUILDING_TYPE = 2
    static MAX_HP = 800
    static AP = 200
    static ATTACK_CD = 6
    static ATTACK_RANGE = 500
    static AUTO_REPAIR_VAL = 1
    static RENDER_PERIOD = 0.1
    static MAX_RECEIVE_LASER_NUM = 5
    static PER_RECEIVE_LASER_AP_AMPLIFICATION = 1.5

    static STATUS = {
        CREATED: 'created',
        BUILDING: 'building',
        DESTROYED: 'destroyed',
        STANDBY: 'standby',
        LOADING: 'loading',
        ATTACKING: 'attacking',
        PASS_LASER_LOADING: 'pass_laser_loading',
        PASSING_LASER: 'passing_laser',
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