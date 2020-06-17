class Lightning {
  constructor(addTo, translate, rotate, scale, distance, inflectionPoint, curveFunc) {
    let lit = this
    lit.isEnd = false
    lit.scale = scale
    lit.distance = distance
    lit.inflectionPoint = inflectionPoint
    lit.curveFunc = curveFunc

    lit.lightningGroup = new Zdog.Group({
      addTo: addTo,
      translate: translate,
      rotate: rotate
    })

    lit.lit1 = lit.getNewLit('yellow')

    lit.lit2 = lit.getNewLit('white')
    lit.lit2.rotate = { x: Zdog.TAU / 3 }

    lit.lit3 = lit.getNewLit('white')
    lit.lit3.rotate = { x: -Zdog.TAU / 3 }

    lit.tl = new TimelineMax()
    let feq = 15
    for (let i = 1; i < feq; i++) {
      lit.tl.call(() => lit.updateLit(), null, i / feq)
    }
    lit.tl.call(() => lit.remove(), null, 1)
  }

  getNewLit(color) {
    let lit = this
    return new Zdog.Shape({
      addTo: lit.lightningGroup,
      color: color,
      stroke: lit.scale,
      path: lit.getPath(),
      closed: false
    })
  }

  updateLit() {
    let lit = this
    lit.lit1.path = lit.getPath()
    lit.setRandomColor(lit.lit1)
    lit.lit1.updatePath()
    lit.lit2.path = lit.getPath()
    lit.lit2.updatePath()
    lit.setRandomColor(lit.lit2)
    lit.lit3.path = lit.getPath()
    lit.lit3.updatePath()
    lit.setRandomColor(lit.lit3)
  }

  setRandomColor(lit) {
    let r = Math.random()
    if (r < 0.33) {
      lit.color = 'yellow'
    } else if (r < 0.67) {
      lit.color = 'white'
    } else {
      lit.color = 'red'
    }
  }

  remove() {
    let lit = this
    lit.isEnd = true
    lit.lit1.remove()
    lit.lit1 = null
    lit.lit2.remove()
    lit.lit2 = null
    lit.lit3.remove()
    lit.lit3 = null
    lit.lightningGroup.remove()
    lit.lightningGroup = null
    lit.tl.kill()
    lit.tl = null
  }

  getPath() {
    let distance = this.distance
    let curve = this.getCurveEquation(distance)
    let loop = this.inflectionPoint
    let step = distance / loop
    let path = []
    let x, y, z
    for (let i = 0; i <= loop; i++) {
      if (i == 0) {
        x = y = z = 0
      } else {
        x = step * i + step * (Math.random() - 0.5) * 0.7
        y = curve(step * i) + step * (Math.random() - 0.5) * 0.7
        z = step * (Math.random() - 0.5) * 0.7
      }
      path.push({ x: x, y: y, z: z })
    }
    return path
  }

  getCurveEquation(distance) {
    if (this.curveFunc) return this.curveFunc
    let r = Math.random()
    if (r > 0.2) {
      return function (x) {
        return 0
      }
    } else {
      let e = 1 / Math.sqrt(distance)
      return function (x) {
        return 4 * e * (x * x / distance - x)
      }
    }
  }
}