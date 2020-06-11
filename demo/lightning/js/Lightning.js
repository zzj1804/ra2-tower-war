class Lightning {
  constructor(addTo, translate, scale, distance) {
    let lit = this
    lit.isEnd = false
    lit.distance = distance
    lit.lightningGroup = new Zdog.Group({
      addTo: addTo,
      translate: translate
    })

    lit.lit1 = new Zdog.Shape({
      addTo: lit.lightningGroup,
      color: 'yellow',
      stroke: scale,
      path: [{},{},{},{},{},{},{},{},{},{}]
    })

    lit.lit2 = new Zdog.Shape({
      addTo: lit.lightningGroup,
      color: 'white',
      stroke: scale,
      path: [{},{},{},{},{},{},{},{},{},{}]
    })

    lit.lit3 = new Zdog.Shape({
      addTo: lit.lightningGroup,
      color: 'white',
      stroke: scale,
      path: [{},{},{},{},{},{},{},{},{},{}]
    })

    lit.tl = new TimelineMax({ repeat: 1, onUpdate: render, delay: 0 })
    lit.tl
    .call(() => lit.changeLitPath(), null, 0)
    .call(() => lit.changeLitPath(), null, 1)
    .call(() => lit.changeLitPath(), null, 2)
    .call(() => lit.remove(), null, 3)
  }

  render() { }

  changeLitPath(){
    let lit = this
    lit.lit1.path = lit.getPath()
    lit.lit2.path = lit.getPath()
    lit.lit3.path = lit.getPath()
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
    let loop = 10
    let step = distance / loop
    let path = []
    for (let i = 0; i < loop; i++) {
      let isStart = i == 0
      let isEnd = i == (loop - 1)
      let x
      let y
      if (!isStart && !isEnd) {
        x = step * i + step * (Math.random() - 0.5) * 0.5
        y = curve(x) + step * (Math.random() - 0.5) * 0.5
      } else if (isStart) {
        x = 0
        y = 0
      } else {
        x = 0
        y = distance
      }
      path.push({ x: x, y: y })
    }

    console.log(path)
    return path
  }

  getCurveEquation(distance) {
    return function (x) {
      return x * x / distance - x
    }
  }
}