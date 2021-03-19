const defaultAttr = () => ({
  gl: null,
  vertices: [],
  geoData: [],
  size: 2,
  attrName: 'a_Position',
  count: 0,
  types: ['POINTS'],
  circleDot: false,
  u_IsPOINTS: null,
})

export default class Poly {
  constructor (attr) {
    Object.assign(this, defaultAttr(), attr)
    this.init()
  }

  init () {
    const { gl, attrName, size, circleDot } = this

    if (!gl) return

    const vertexBuffer = gl.createBuffer()
    const a_Position = gl.getAttribLocation(gl.program, attrName)

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    this.updateBuffer()
    gl.vertexAttribPointer(a_Position, size, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(a_Position)

    if (circleDot) {
      this.u_IsPOINTS = gl.getUniformLocation(gl.program, 'u_IsPOINTS')
    }
  }

  updateBuffer () {
    const { gl, vertices } = this
    this.updateCount()
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
  }

  updateCount () {
    this.count = this.vertices.length / this.size
  }

  addVertices (...params) {
    this.vertices.push(...params)
    this.updateBuffer()
  }

  popVertice () {
    const { vertices, size, geoData } = this
    const len = vertices.length

    geoData.pop()
    vertices.splice(len - size, len)
    this.updateCount()
  }

  setVertice (ind, ...params) {
    const { vertices, size } = this
    const i = ind * size

    params.forEach((param, paramInd) => {
      vertices[i + paramInd] = param
    })
    this.updateBuffer()
  }

  updateVertices (params) {
    const { geoData } = this
    const vertices = []
    geoData.forEach(data => {
      params.forEach(key => {
        vertices.push(data[key])
      })
    })
    this.vertices = vertices
  }

  draw (types = this.types) {
    const { gl, count, u_IsPOINTS, circleDot } = this
    for (let type of types) {
      circleDot && gl.uniform1f(u_IsPOINTS, type === 'POINTS')
      gl.drawArrays(gl[type], 0, count)
    }
  }
}