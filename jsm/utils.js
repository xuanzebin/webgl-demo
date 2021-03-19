export function initShader (gl, vsSource, fsSource) {
  //创建程序对象
  const program = gl.createProgram()
  //建立着色对象
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource)
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource)
  //把顶点着色对象装进程序对象中
  gl.attachShader(program, vertexShader)
  //把片元着色对象装进程序对象中
  gl.attachShader(program, fragmentShader)
  //连接webgl上下文对象和程序对象
  gl.linkProgram(program)
  //启动程序对象
  gl.useProgram(program)
  //将程序对象挂到上下文对象上
  gl.program = program
  return true
}

const loadShader = (gl, type, source) => {
  //根据着色类型，建立着色器对象
  const shader = gl.createShader(type)
  //将着色器源文件传入着色器对象中
  gl.shaderSource(shader, source)
  //编译着色器对象
  gl.compileShader(shader)
  //返回着色器对象
  return shader
}

export const getMousePosInWebgl = (event, canvas) => {
  const { clientX, clientY } = event
  const { left, top, width, height } = canvas.getBoundingClientRect()
  const [cssX, cssY] = [clientX - left, clientY - top]

  // 解决坐标原点位置的差异
  const [halfWidth, halfHeight] = [width / 2, height / 2]
  const [xBaseCenter, yBaseCenter] = [cssX - halfWidth, cssY - halfHeight]
  // 解决Y方向的差异
  const yBaseCenterTop = -yBaseCenter
  const [x, y] = [xBaseCenter / halfWidth, yBaseCenterTop / halfHeight]

  return { x, y }
}

// export const glToWebglPos = (cssPos)

export const glToCssPos = (delta, canvas) => {
  const { x, y } = delta
  const { width, height } = canvas
  const [halfWidth, halfHeight] = [width / 2, height / 2]

  // 距离比例转换
  return {
    x: x * halfWidth,
    y: -y * halfHeight
  }
}

export const scaleLinear = (ax, ay, bx, by) => {
  const delta = {
    x: bx - ax,
    y: by - ay
  }
  const k = delta.y / delta.x
  const b = ay - ax * k

  return x => {
    return k * x + b
  }
}
