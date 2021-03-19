export default class Sky {
  constructor (gl) {
    this.gl = gl
    this.children = []
  }

  add (obj) {
    obj.gl = this.gl
    this.children.push(obj)
  }

  updateVertices (params) {
    this.children.forEach(ele => {
      ele.updateVertices(params)
    })
  }

  draw () {
    this.children.forEach(ele => {
      // 这里 init 主要是为了解决多个poly的问题
      ele.init()
      ele.draw()
    })
  }
}