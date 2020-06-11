window.onerror = function (m, f, l) {
  alert(m + '\n' + f + '\n' + l)
}

window.requestAnimFrame = function () {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (/* function */ callback) {
      window.setTimeout(callback, 1000 / 60)
    }
  )
}

const MAP_GRID_NUM = 10
const MAP_GRID_LENGTH = 100

const stats = new Stats()
stats.showPanel(0)

let map
let time = 0
let isBuildMode = false
let video

let illoOption = {
  isDragRotate: false,
  maxZoom: 15,
  minZoom: 0.001,
  stats: false
}

let illo = new Zdog.Illustration({
  element: '.zdog-canvas',
  zoom: 1,
  resize: true
})

let illoAnchor = new Zdog.Anchor({
  addTo: illo
})

// drag event
let dragStartX, dragStartY
new Zdog.Dragger({
  startElement: illo.element,
  onDragStart: function (pointer) {
    if (illoOption.isDragRotate) {
      dragStartX = illoAnchor.rotate.x
      dragStartY = illoAnchor.rotate.y
    } else {
      dragStartX = illoAnchor.translate.x
      dragStartY = illoAnchor.translate.y
    }
  },
  onDragMove: function (pointer, moveX, moveY) {
    if (illoOption.isDragRotate) {
      let displaySize = Math.min(illo.width, illo.height)
      let moveRY = moveX / displaySize * Zdog.TAU
      let moveRX = moveY / displaySize * Zdog.TAU
      illoAnchor.rotate.x = dragStartX - moveRX
      illoAnchor.rotate.y = dragStartY - moveRY
    } else {
      illoAnchor.translate.x = dragStartX + moveX / illo.zoom
      illoAnchor.translate.y = dragStartY + moveY / illo.zoom
    }
  },
  onDragEnd: function () { },
})

function createOptionGUI() {
  let gui = new dat.GUI()
  gui.open()
  let illoFolder = gui.addFolder('illo')
  illoFolder.open()
  // zoom
  illoFolder.add(illo, 'zoom', illoOption.minZoom, illoOption.maxZoom).listen().onChange(v => illo.zoom = v)
  // drag
  illoFolder.add(illoOption, 'isDragRotate').listen()
  // stats
  illoFolder.add(illoOption, "stats").listen().onChange(v => changeStats(v))

  return gui
}

class IsometricMap {
  constructor(illo, cartAnchor, gridNum, gridLength) {
    this.illo = illo
    this.cartAnchor = cartAnchor
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
      color: 'rgba(240, 248, 255, 0.95)',
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

    this.groudGroup.addChild(getAxis(1))

    this.selectionBox = new Zdog.Rect({
      addTo: this.isoAnchor,
      width: gridLength * 0.9,
      height: gridLength * 0.9,
      translate: { z: 3 },
      stroke: 1,
      color: 'green',
      visible: false
    })

    let thisMap = this
    this.illo.element.addEventListener("mousemove", e => {
      let idx = thisMap.getScreenToMapIndex(e.offsetX, e.offsetY)
      if (idx) {
        let model = thisMap.getModelByGrid(idx)
        let newPoint = thisMap.getScreenToMapIndexCenterPoint(idx)
        thisMap.selectionBox.translate.x = newPoint.x
        thisMap.selectionBox.translate.y = newPoint.y
        if (model && isBuildMode) {
          thisMap.selectionBox.color = 'red'
        } else {
          thisMap.selectionBox.color = 'green'
        }
        thisMap.selectionBox.visible = true
      } else {
        thisMap.selectionBox.visible = false
      }
    }, false)

    this.illo.element.addEventListener("click", e => {
      if (!isBuildMode) return
      let idx = thisMap.getScreenToMapIndex(e.offsetX, e.offsetY)
      if (idx) {
        let model = thisMap.getModelByGrid(idx)
        if (model) {
          thisMap.removeModelByGrid(idx)
          thisMap.selectionBox.color = 'green'
        } else {
          thisMap.addModelByGrid(getAxis(0.5), idx)
          thisMap.selectionBox.color = 'red'
        }
      }
    }, false)
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


  getModelByGrid(index) {
    if (!index) return
    return this.isoArr[index.y][index.x]
  }

  addModelByGrid(model, index) {
    if (!model || !index) return
    let oldModel = this.isoArr[index.y][index.x]
    if (oldModel) return
    this.isoArr[index.y][index.x] = model
    let { x, y } = this.getScreenToMapIndexCenterPoint(index)
    let halfMapLength = MAP_GRID_LENGTH * MAP_GRID_NUM / 2
    model.translate.x += x
    model.translate.y += y
    this.isoAnchor.addChild(model)
  }

  removeModelByGrid(index) {
    if (!index) return
    let model = this.isoArr[index.y][index.x]
    if (!model) return
    this.isoAnchor.removeChild(model)
    this.isoArr[index.y][index.x] = null
  }

  remove() {
    this.illo = null
    this.isoAnchor.remove()
    this.isoAnchor = null
    this.isoArr = null
    this.cartAnchor = null
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

function getAxis(scale) {
  let axis = new Zdog.Group({
    scale: scale
  })

  new Zdog.Shape({
    addTo: axis,
    path: [
      { x: -40, y: 0 },
      { x: 40, y: 0 },
      { y: -5, x: 40 },
      { y: 0, x: 45 },
      { y: 5, x: 40 },
      { y: 0, x: 40 }
    ],
    closed: false,
    stroke: 3,
    color: 'red',
  })

  new Zdog.Shape({
    addTo: axis,
    path: [
      { x: 0, y: -40 },
      { x: 0, y: 40 },
      { x: -5, y: 40 },
      { x: 0, y: 45 },
      { x: 5, y: 40 },
      { x: 0, y: 40 }
    ],
    closed: false,
    stroke: 3,
    color: 'yellow',
  })

  new Zdog.Shape({
    addTo: axis,
    path: [
      {},
      { z: 40 },
      { x: -5, z: 40 },
      { x: 0, z: 45 },
      { x: 5, z: 40 },
      { x: 0, z: 40 }
    ],
    closed: false,
    stroke: 3,
    color: 'blue',
  })

  return axis
}

function changeStats(v) {
  illoOption.stats = v
  if (illoOption.stats) {
    document.body.appendChild(stats.dom)
  } else {
    stats.dom.parentNode.removeChild(stats.dom)
  }
}

function switchBuildMode() {
  let btn = document.getElementById('build-button')
  isBuildMode = !isBuildMode
  switchBtnActive(btn, isBuildMode)
}

// switch build mode
document.getElementById('build-button').addEventListener("click", e => {
  switchBuildMode()
}, false)

// wheel to zoom
illo.element.addEventListener("wheel", e => {
  let rate = illo.zoom / 20
  let zoom = illo.zoom - (e.deltaY > 0 ? 1 : -1) * rate
  if (zoom > illoOption.maxZoom) zoom = illoOption.maxZoom
  if (zoom < illoOption.minZoom) zoom = illoOption.minZoom
  illo.zoom = zoom
}, false)

document.addEventListener("keydown", e => {
  console.log(e)
  let moveStride = 10 / illo.zoom
  switch (e.keyCode) {
    // ←
    case 37:
      illoAnchor.translate.x += moveStride
      break
    // ↑
    case 38:
      illoAnchor.translate.y += moveStride
      break
    // →
    case 39:
      illoAnchor.translate.x -= moveStride
      break
    // ↓
    case 40:
      illoAnchor.translate.y -= moveStride
      break
    // b -> build
    case 66:
    case 98:
      switchBuildMode()
      break
    // c -> reset move&rotate
    case 67:
    case 99:
      illoAnchor.translate = new Zdog.Vector({})
      illoAnchor.rotate = new Zdog.Vector({})
      break
    // p -> PiP
    case 80:
    case 112:
      switchPip()
      break
    // r -> isDragRotate
    case 82:
    case 114:
      illoOption.isDragRotate = !illoOption.isDragRotate
      break
    // s -> stats
    case 83:
    case 115:
      changeStats(!illoOption.stats)
      break
  }
})

document.getElementById('pip-button').addEventListener("click", e => {
  switchPip()
}, false)

document.getElementById('restart-button').addEventListener("click", e => {
  map.removeAllChild()
}, false)

function switchBtnActive(btn, v) {
  if (v) {
    btn.className += ' active'
  } else {
    btn.className = btn.className.replace(' active', '')
  }
}

async function switchPip() {
  try {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture()
      video.pause()
      video.srcObject = null
    } else {
      video.srcObject = illo.element.captureStream(14)
      await video.play()
      await video.requestPictureInPicture()
    }
  } catch (error) {
    alert('browser not support PictureInPicture')
  }
}

function displayLoadingLayer(p) {
  if (p) {
    document.getElementById('loading-layer').style.display = 'display'
  } else {
    document.getElementById('loading-layer').style.display = 'none'
  }
}

function run() {
  stats.begin()
  illo.updateRenderGraph()
  // if (time % 60 == 0) {
  //   console.log(time)
  // }
  ++time
  stats.end()
  requestAnimationFrame(run)
}

video = document.createElement('video')
video.muted = true
// start the game
map = new IsometricMap(illo, illoAnchor, MAP_GRID_NUM, MAP_GRID_LENGTH)
createOptionGUI()
run()
displayLoadingLayer(false)
