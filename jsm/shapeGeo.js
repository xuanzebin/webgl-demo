export default class ShapeGeo {
  count = 0
  constructor (pathData = []) {
    this.pathData = pathData
    this.geoData = []
    this.triangles = []
    this.vertices = []
    this.parsePath()
    this.update()
  }

  update () {
    this.vertices = []
    this.triangles = []
    this.findTriangles(0)
    this.updateVertices()
  }

  parsePath () {
    this.geoData = []
    const { pathData, geoData } = this
    for (let i = 0; i < pathData.length; i += 2) {
      geoData.push({ x: pathData[i], y: pathData[i + 1] })
    }
  }

  // 寻找满足以下条件的▲ABC：
  // - ▲ABC的顶点索引位置连续，如012,123、234
  // - 点C在向量AB的正开半平面里，可以理解为你站在A点，面朝B点，点C要在你的左手边
  // - ▲ABC中没有包含路径G 中的其它顶点
  findTriangles (i) {
    if (this.count > 100) return
    const { geoData, triangles } = this
    const len = geoData.length
    if (len <= 3) {
      triangles.push([...geoData])
    } else {
      const [i0, i1, i2] = [
        i % len,
        (i + 1) % len,
        (i + 2) % len,
      ]
      const triangle = [
        geoData[i0],
        geoData[i1],
        geoData[i2],
      ]
      const isInPositiveHalfSurface = this.cross(triangle) > 0
      const isIncludePoint = this.includePoint(triangle)

      if (isInPositiveHalfSurface && !isIncludePoint) {
        triangles.push(triangle)
        geoData.splice(i1, 1)
      }
      this.count++
      this.findTriangles(i1)
    }
  }

  cross ([p0, p1, p2]) {
    const [ax, ay, bx, by] = [
      p1.x - p0.x,
      p1.y - p0.y,
      p2.x - p0.x,
      p2.y - p0.y
    ]

    return ax * by - bx * ay
  }

  includePoint (triangle) {
    for (let ele of this.geoData) {
      if (triangle.includes(ele)) continue
      if (this.inTriangle(ele, triangle)) return true
    }

    return false
  }

  inTriangle (p0, triangle) {
    let inPoly = true

    for (let i = 0; i < 3; i++) {
      const j = (i + 1) % 3
      const [p1, p2] = [triangle[i], triangle[j]]

      if (this.cross([p1, p2, p0]) < 0) { // 顺序其实关系不大，只要p0 -> p1 -> p2这样的逆时间方向均可判断
        inPoly = false
        break
      }
    }

    return inPoly
  }

  updateVertices () {
    const arr = []

    this.triangles.forEach(triangle => {
      for (let { x, y } of triangle) {
        arr.push(x, y)
      }
    })

    this.vertices = arr
  }
}