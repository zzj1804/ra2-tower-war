let illoOption = {
  isDragRotate: true,
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

// getAxis(illoAnchor, 1)

let test1Group = getAxis(illo, 0.5)
test1Group.visible = false

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

    test1(pointer, moveX, moveY)
  },
  onDragEnd: function () {
    test1Group.visible = false
  },
})

class IsometricMap {
  constructor(illo, cartAnchor, gridNum) {
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

    let len = 100 * gridNum
    let thickness = 40
    new Zdog.Rect({
      addTo: this.groudGroup,
      width: len,
      height: len,
      translate: { z: -thickness / 2 },
      stroke: thickness,
      color: 'rgba(162,109,57,0.8)',
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

    getAxis(this.isoAnchor, 1)
  }

  getScreenToMapVector(offsetX, offsetY) {
    let ramdomColor = '#' + (Math.random() * 0xffffff << 0).toString(16)
    let cartX = offsetX
    let cartY = offsetY
    if (this.illo.centered) {
      cartX -= this.illo.width / 2
      cartY -= this.illo.height / 2
    }
    cartX = cartX / this.illo.zoom - this.cartAnchor.translate.x
    cartY = cartY / this.illo.zoom - this.cartAnchor.translate.y

    let x00 = new Zdog.Vector({ x: 1 })
    let y00 = new Zdog.Vector({ y: 1 })
    let z00 = new Zdog.Vector({ z: 1 })

    let x01 = x00.copy().rotate(this.isoAnchor.rotate)
    let y01 = y00.copy().rotate(this.isoAnchor.rotate)
    let z01 = z00.copy().rotate(this.isoAnchor.rotate)

    let cartAnchorTransposeRotationMatrix = ZdogUtils.getTransposeRotationMatrix(this.cartAnchor.rotate)
    let isoAnchorTransposeRotationMatrix = ZdogUtils.getTransposeRotationMatrix(this.isoAnchor.rotate)
    let totalTransposeRotationMatrix = ZdogUtils.multiplyMatrices(cartAnchorTransposeRotationMatrix, isoAnchorTransposeRotationMatrix)
    let isoAnchorZAxisMatrix = ZdogUtils.multiplyMatrices(totalTransposeRotationMatrix, [[0], [0], [1]])
    let isoAnchorZAxis = new Zdog.Vector({
      x: isoAnchorZAxisMatrix[0][0],
      y: isoAnchorZAxisMatrix[1][0],
      z: isoAnchorZAxisMatrix[2][0]
    })
    console.table(isoAnchorZAxis)

    let cartZ = - (cartX * isoAnchorZAxis.x + cartY * isoAnchorZAxis.y) / isoAnchorZAxis.z
    let cartPoint = new Zdog.Vector({ x: cartX, y: cartY, z: cartZ })


    let isoPoint = new Zdog.Vector({
      x: cartPoint.x * ZdogUtils.vecDotProduct(x01, x00) + cartPoint.y * ZdogUtils.vecDotProduct(x01, y00) + cartPoint.z * ZdogUtils.vecDotProduct(x01, z00),
      y: cartPoint.x * ZdogUtils.vecDotProduct(y01, x00) + cartPoint.y * ZdogUtils.vecDotProduct(y01, y00) + cartPoint.z * ZdogUtils.vecDotProduct(y01, z00),
      z: cartPoint.x * ZdogUtils.vecDotProduct(z01, x00) + cartPoint.y * ZdogUtils.vecDotProduct(z01, y00) + cartPoint.z * ZdogUtils.vecDotProduct(z01, z00)
    })

    console.log(`cartX: ${cartPoint.x} cartY: ${cartPoint.y} cartZ: ${cartPoint.z}`)
    console.log(`isoX: ${isoPoint.x} isoY: ${isoPoint.y} isoZ: ${isoPoint.z}`)

    new Zdog.Shape({
      addTo: this.isoAnchor,
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
      color: ramdomColor,
      translate: isoPoint
    })
    console.log(`------------------------------------------------------------------`)
    return isoPoint
  }

  remove() {
    this.illo = null
    this.isoAnchor.remove()
    this.isoAnchor = null
    this.isoArr = null
    this.cartAnchor = null
  }
}

function getAxis(addTo, scale) {
  let axis = new Zdog.Group({
    addTo: addTo,
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

const stats = new Stats()
stats.showPanel(0)

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

function changeStats(v) {
  illoOption.stats = v
  if (illoOption.stats) {
    document.body.appendChild(stats.dom)
  } else {
    stats.dom.parentNode.removeChild(stats.dom)
  }
}

let map = new IsometricMap(illo, illoAnchor, 10)

let isBuildMode = false
function switchBuildMode() {
  let btn = document.getElementById('build-button')
  isBuildMode = !isBuildMode
  switchBtnActive(btn, isBuildMode)
}

document.getElementById('build-button').addEventListener("click", e => {
  switchBuildMode()
}, false)

illo.element.addEventListener("mousemove", e => {
  if (isBuildMode)
    map.getScreenToMapVector(e.offsetX, e.offsetY)
}, false)

illo.element.addEventListener("click", e => {
  map.getScreenToMapVector(e.offsetX, e.offsetY)
}, false)

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
      illoAnchor.translate.x -= moveStride
      break
    // ↑
    case 38:
      illoAnchor.translate.y -= moveStride
      break
    // →
    case 39:
      illoAnchor.translate.x += moveStride
      break
    // ↓
    case 40:
      illoAnchor.translate.y += moveStride
      break
    // b -> build
    case 66:
    case 98:
      switchBuildMode()
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

function switchBtnActive(btn, v) {
  if (v) {
    btn.className += ' active'
  } else {
    btn.className = btn.className.replace(' active', '')
  }
}

let time = 0
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

createOptionGUI()
illoAnchor.rotate = new Zdog.Vector({ x: -0.1489563611329071, y: 0.11457967569366773, z: 0.3853981633974483 })
run()

let video = document.createElement('video')
video.muted = true

async function switchPip() {
  try {
    let btn = document.getElementById('pip-button')
    if (document.pictureInPictureElement) {
      switchBtnActive(btn, false)
      await document.exitPictureInPicture()
      video.pause()
      video.srcObject = null
    } else {
      switchBtnActive(btn, true)
      video.srcObject = illo.element.captureStream(14)
      await video.play()
      await video.requestPictureInPicture()
    }
  } catch (error) {
    alert('browser not support PictureInPicture')
  }
}

document.getElementById('pip-button').addEventListener("click", e => {
  switchPip()
}, false)

function test1(pointer, moveX, moveY) {
  let cartX = pointer.offsetX
  let cartY = pointer.offsetY
  if (illo.centered) {
    cartX -= illo.width / 2
    cartY -= illo.height / 2
  }

  let A0 = illoAnchor
  let A1 = map.isoAnchor

  let getM = ZdogUtils.getRotationMatrix
  let getTM = ZdogUtils.getTransposeRotationMatrix
  let mM = ZdogUtils.multiplyMatrices
  let vDP = ZdogUtils.vecDotProduct

  let A0M = getM(A0.rotate)
  let A2M = getM(A1.rotate)
  let A0TM = getTM(A0.rotate)
  let A1TM = getTM(A1.rotate)
  // let A0A1TM = mM(A0TM, A1TM)
  let A0A1TM = mM(A0M, A0TM)
  console.log(A0A1TM)
  let A0zM = mM(A0A1TM, [[0], [0], [1]])
  let A0z = new Zdog.Vector({
    x: A0zM[0][0],
    y: A0zM[1][0],
    z: A0zM[2][0]
  })
  test1Group.rotate.set(A0z)

  test1Group.visible = true
  test1Group.translate.x = cartX / illo.zoom
  test1Group.translate.y = cartY / illo.zoom
}

document.getElementById('loading-layer').style.display = 'none'

