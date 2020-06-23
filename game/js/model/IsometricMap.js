class IsometricMap {
    constructor(illo, cartAnchor, gridNum, gridLength, mapColor) {
        this.illo = illo
        this.cartAnchor = cartAnchor
        this.gridLength = gridLength
        this.gridNum = gridNum
        this.isoArr = new Array(gridNum)
        for (let i = 0; i < gridNum; i++) {
            this.isoArr[i] = new Array(gridNum).fill(null)
        }

        this.isoAnchor = new Zdog.Anchor({
            addTo: cartAnchor,
            rotate: { x: Zdog.TAU / 6, y: 0, z: Zdog.TAU / 8 }
        })

        this.groudGroup = new Zdog.Group({
            addTo: this.isoAnchor
        })

        let len = gridLength * gridNum
        let thickness = 40
        new Zdog.Rect({
            addTo: this.groudGroup,
            width: len,
            height: len,
            translate: { z: -thickness / 2 },
            stroke: thickness,
            color: mapColor,
            fill: true
        })

        // counter-balanced invisible shape
        new Zdog.Shape({
            addTo: this.groudGroup,
            visible: false,
            translate: {
                z: -len * len
            }
        })

        this.selectionBox = new Zdog.Rect({
            addTo: this.isoAnchor,
            width: gridLength * 0.9,
            height: gridLength * 0.9,
            translate: { z: 3 },
            stroke: 1,
            color: 'green',
            visible: false
        })
    }

    getScreenToMapVector(offsetX, offsetY) {
        let cartX = offsetX
        let cartY = offsetY
        if (this.illo.centered) {
            cartX -= this.illo.width / 2
            cartY -= this.illo.height / 2
        }
        cartX = cartX / this.illo.zoom - this.cartAnchor.translate.x
        cartY = cartY / this.illo.zoom - this.cartAnchor.translate.y

        let A0 = this.cartAnchor
        let A1 = this.isoAnchor

        let getTM = ZdogUtils.getTransposeRotationMatrix
        let mMV = ZdogUtils.multiplyMatrixAndVec

        let x00 = new Zdog.Vector({ x: 1 })
        let y00 = new Zdog.Vector({ y: 1 })
        let z00 = new Zdog.Vector({ z: 1 })
        let TM0 = getTM(A0.rotate)
        let TM1 = getTM(A1.rotate)

        let z21 = z00.copy().rotate(A1.rotate)
        let z01 = mMV(TM0, z00)
        let y01 = mMV(TM0, y00)
        let x01 = mMV(TM0, x00)

        let M01 = [
            [x01.x, x01.y, x01.z],
            [y01.x, y01.y, y01.z],
            [z01.x, z01.y, z01.z]
        ]
        let z20 = mMV(M01, z21)

        let cartZ = - (cartX * z20.x + cartY * z20.y) / z20.z
        let cartPoint = new Zdog.Vector({ x: cartX, y: cartY, z: cartZ })
        let isoPoint = mMV(TM1, mMV(TM0, cartPoint))
        console.debug(`isoPoint: x: ${isoPoint.x} y: ${isoPoint.y} z: ${isoPoint.z}`)

        return isoPoint
    }

    getScreenToMapIndex(offsetX, offsetY) {
        let vec = this.getScreenToMapVector(offsetX, offsetY)
        let halfMapLength = MAP_GRID_LENGTH * MAP_GRID_NUM / 2
        if (Math.abs(vec.x) > halfMapLength || Math.abs(vec.y) > halfMapLength) return
        let x = vec.x + halfMapLength
        let y = vec.y + halfMapLength
        let indexX = Math.floor(x / MAP_GRID_LENGTH)
        let indexY = Math.floor(y / MAP_GRID_LENGTH)
        console.debug(`indexX:${indexX} indexY:${indexY}`)

        return { x: indexX, y: indexY }
    }

    getScreenToMapIndexCenterPoint(index) {
        let halfMapLength = MAP_GRID_LENGTH * MAP_GRID_NUM / 2
        return { x: (index.x + 0.5) * MAP_GRID_LENGTH - halfMapLength, y: (index.y + 0.5) * MAP_GRID_LENGTH - halfMapLength }
    }


    getObjByGrid(index) {
        if (!index) return
        return this.isoArr[index.y][index.x]
    }

    addObjByGrid(model, index) {
        if (!model || !index) return
        let oldModel = this.isoArr[index.y][index.x]
        if (oldModel) return
        this.isoArr[index.y][index.x] = model
    }

    removeObjByGrid(index) {
        if (!index) return
        this.isoArr[index.y][index.x] = null
    }

    remove() {
        this.illo = null
        this.isoAnchor.remove()
        this.isoAnchor = null
        this.isoArr = null
        this.cartAnchor = null
        this.gridLength = null
        this.gridNum = null
    }

    removeAllChild() {
        for (let i = 0; i < this.isoArr.length; i++) {
            const arr = this.isoArr[i]
            for (let j = 0; j < arr.length; j++) {
                this.isoAnchor.removeChild(arr[j])
                arr[j] = null
            }
        }
    }
}