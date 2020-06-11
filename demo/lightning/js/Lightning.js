class Lightning {
  constructor(addTo, translate, scale, distance) {
    let lit = this
    lit.isEnd = false
    lit.scale = scale
    lit.distance = distance
    lit.lightningGroup = new Zdog.Group({
      addTo: addTo,
      translate: translate
    })

    lit.lit1 = new Zdog.Shape({
      addTo: lit.lightningGroup,
      color: 'yellow',
      stroke: scale,
      path: lit.getPath(),
      closed: false
    })

    lit.lit2 = new Zdog.Shape({
      addTo: lit.lightningGroup,
      color: 'white',
      stroke: scale,
      path: lit.getPath(),
      closed: false,
      rotate: {x: Zdog.TAU / 72}
    })

    lit.lit3 = new Zdog.Shape({
      addTo: lit.lightningGroup,
      color: 'white',
      stroke: scale,
      path: lit.getPath(),
      closed: false,
      rotate: {x: -Zdog.TAU / 72}
    })

    lit.tl = new TimelineMax({ repeat: 1, onUpdate: render, delay: 0 })
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

  render() { }

  updateLit(){
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

  setRandomColor(lit){
    let b = Math.random() > 0.66
    lit.color = b ? 'yellow' : 'white'
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
    let loop = 20
    let step = distance / loop
    let path = []
    for (let i = 1; i <= loop; i++) {
      let x = step * i + step * (Math.random() - 0.5) * 0.7
      let y = curve(step * i) + step * (Math.random() - 0.5) * 0.7
      let z = step * (Math.random() - 0.5)
      path.push({ x: x, y: y, z: z})
    }

    return path
  }

  getCurveEquation(distance) {
    return function (x) {
      return x * x / distance - x
    }
  }
}