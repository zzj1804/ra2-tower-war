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
      closed: false
    })

    lit.lit3 = new Zdog.Shape({
      addTo: lit.lightningGroup,
      color: 'white',
      stroke: scale,
      path: lit.getPath(),
      closed: false
    })

    lit.tl = new TimelineMax({ repeat: 1, onUpdate: render, delay: 0 })
    lit.tl
    .call(() => lit.updateLit(), null, 0)
    .call(() => lit.updateLit(), null, 1)
    .call(() => lit.updateLit(), null, 2)
    .call(() => lit.remove(), null, 3)
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
    lit.lit1 = lit.getNewLit('yellow')
    lit.lit2 = lit.getNewLit('white')
    lit.lit3 = lit.getNewLit('white')

    console.log('updated')
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

    console.log('removed')
  }

  getPath() {
    let distance = this.distance
    let curve = this.getCurveEquation(distance)
    let loop = 10
    let step = distance / loop
    let path = []
    for (let i = 1; i <= loop; i++) {
      let isStart = i == 1
      let isEnd = i == loop
      let x
      let y
      if (!isStart && !isEnd) {
        x = step * i + step * (Math.random() - 0.5) * 0.7
        y = curve(step * i) + step * (Math.random() - 0.5) * 0.7
      } else if (isStart) {
        x = 0
        y = 0
      } else {
        x = distance
        y = 0
      }
      path.push({ x: x, y: y })
    }

    return path
  }

  getCurveEquation(distance) {
    return function (x) {
      return x * x / distance - x
    }
  }
}