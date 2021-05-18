const defaultAttr = () => ({
  gl: null,
  vertices: [],
  geoData: [],
  size: 2,
  attrName: 'a_Position',
  count: 0,
  uniforms: {},
  types: ['POINTS'],
  circleDot: false,
  u_IsPOINTS: null,
  maps: {}
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

    this.updateUniform()
    if (circleDot) {
      this.u_IsPOINTS = gl.getUniformLocation(gl.program, 'u_IsPOINTS')
    }
  }

  updateUniform () {
    const {gl, uniforms} = this

    for (let [key, val] of Object.entries(uniforms)) {
      const { type, value } = val

      const u = gl.getUniformLocation(gl.program, key)
      if (type.includes('Matrix')) {
        gl[type](u, false, value)
      } else {
        gl[type](u, value)
      }
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

  updateMaps () {
    const { gl, maps } = this

    Object.entries(maps).forEach(([key, val], index) => {
      const {
        format = gl.RGB,
        image,
        wrapS,
        wrapT,
        magFilter,
        minFilter
      } = val

      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
      gl.activeTexture(gl[`TEXTURE${index}`])
      const texture = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, texture)

      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        format,
        format,
        gl.UNSIGNED_BYTE,
        image
      )

      wrapS&&gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_WRAP_S,
        wrapS
      )

      wrapT&&gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_WRAP_T,
        wrapT
      )

      magFilter&&gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_MAG_FILTER,
        magFilter
      )

      if (!minFilter || minFilter > 9729) {
        gl.generateMipmap(gl.TEXTURE_2D)
      }

      minFilter&&gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_MIN_FILTER,
        minFilter
      )

      const u = gl.getUniformLocation(gl.program, key)
      gl.uniform1i(u, index)
    }) 
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