/**
 * left-handed
 */
class ZdogUtils {
  static getUnitVector(v) {
    let mag = v.magnitude()
    return new Zdog.Vector({
      x: v.x / mag,
      y: v.y / mag,
      z: v.z / mag
    })
  }

  static vecDotProduct(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z
  }

  static vecCrossProduct(v1, v2) {
    return new Zdog.Vector({
      x: v1.y * v2.z - v1.z * v2.y,
      y: v1.z * v2.x - v1.x * v2.z,
      z: v1.x * v2.y - v1.y * v2.x
    })
  }

  static getUnitNormalVector(v1, v2) {
    let v = new Zdog.Vector({
      x: v1.y * v2.z - v2.y * v1.z,
      y: v2.x * v1.z - v1.x * v2.z,
      z: v1.x * v2.y - v2.x * v1.y
    })
    return ZdogUtils.getUnitVector(v)
  }

  static getCoordinateTransformatedVector(CoorAxis1, CoorAxis2, vectorInCoorAxis1) {
    let cos = ZdogUtils.vecDotProduct(CoorAxis1, CoorAxis2)
    let sin = Math.sqrt(1 - cos * cos)
    let dcos = 1 - cos
    let { x, y, z } = ZdogUtils.getUnitNormalVector(CoorAxis1, CoorAxis2)
    let rotationMatrix = [
      [cos + dcos * x * x, dcos * x * y - sin * z, dcos * x * z + sin * y],
      [dcos * y * x + sin * z, cos + dcos * y * y, dcos * y * z - sin * x],
      [dcos * z * x - sin * y, dcos * z * y + sin * x, cos + dcos * z * z]
    ]

    let ox = vectorInCoorAxis1.x
    let oy = vectorInCoorAxis1.y
    let oz = vectorInCoorAxis1.z

    let sameVectorInCoorAxis2 = new Zdog.Vector({
      x: rotationMatrix[0][0] * ox + rotationMatrix[1][0] * oy + rotationMatrix[2][0] * oz,
      y: rotationMatrix[0][1] * ox + rotationMatrix[1][1] * oy + rotationMatrix[2][1] * oz,
      z: rotationMatrix[0][2] * ox + rotationMatrix[1][2] * oy + rotationMatrix[2][2] * oz
    })

    return sameVectorInCoorAxis2
  }

  static rotateAroundUnitVector(angle, UnitVectorAxis, oldPoint) {
    let sin = Math.sin(angle)
    let cos = Math.cos(angle)
    let dcos = 1 - cos
    let x = UnitVectorAxis.x
    let y = -UnitVectorAxis.y
    let z = UnitVectorAxis.z

    let ox = oldPoint.x
    let oy = oldPoint.y
    let oz = oldPoint.z

    let nx = (x * x * dcos + cos) * ox + (x * y * dcos - z * sin) * oy + (x * z * dcos + y * sin) * oz
    let ny = (y * x * dcos + z * sin) * ox + (y * y * dcos + cos) * oy + (y * z * dcos - x * sin) * oz
    let nz = (x * z * dcos - y * sin) * ox + (y * z * dcos + x * sin) * oy + (z * z * dcos + cos) * oz

    return new Zdog.Vector({ x: nx, y: ny, z: nz })
  }

  static getRotationMatrix(rotation) {
    let sinX = Math.sin(rotation.x)
    let sinY = Math.sin(rotation.y)
    let sinZ = Math.sin(rotation.z)

    let cosX = Math.cos(rotation.x)
    let cosY = Math.cos(rotation.y)
    let cosZ = Math.cos(rotation.z)

    // let MX = [
    //   [1, 0, 0],
    //   [0, cosX, -sinX],
    //   [0, sinX, cosX]
    // ]

    // let MY = [
    //   [cosY, 0, -sinY],
    //   [0, 1, 0],
    //   [sinY, 0, cosY]
    // ]

    // let MZ = [
    //   [cosZ, -sinZ, 0],
    //   [sinZ, cosZ, 0],
    //   [0, 0, 1]
    // ]

    // let m = ZdogUtils.multiplyMatrices(ZdogUtils.multiplyMatrices(MX, MY), MZ)

    let m = [[], [], []]
    m[0][0] = cosZ * cosY
    m[0][1] = -cosY * sinZ
    m[0][2] = -sinY
    m[1][0] = -sinX * sinY * cosZ + cosX * sinZ
    m[1][1] = sinZ * sinY * sinX + cosZ * cosX
    m[1][2] = -sinX * cosY
    m[2][0] = cosX * sinY * cosZ + sinX * sinZ
    m[2][1] = -cosX * sinY * sinZ + sinX * cosZ
    m[2][2] = cosY * cosX

    return m
  }

  static getTransposeRotationMatrix(rotation) {
    // let matrix = ZdogUtils.getRotationMatrix(rotation)

    // for (let i = 0; i < matrix.length; i++) {
    //   for (let j = 0; j < i; j++) {
    //     const temp = matrix[i][j]
    //     matrix[i][j] = matrix[j][i]
    //     matrix[j][i] = temp
    //   }
    // }

    let sinX = Math.sin(rotation.x)
    let sinY = Math.sin(rotation.y)
    let sinZ = Math.sin(rotation.z)

    let cosX = Math.cos(rotation.x)
    let cosY = Math.cos(rotation.y)
    let cosZ = Math.cos(rotation.z)

    let matrix = [[], [], []]
    matrix[0][0] = cosZ * cosY
    matrix[1][0] = -cosY * sinZ
    matrix[2][0] = -sinY
    matrix[0][1] = -sinX * sinY * cosZ + cosX * sinZ
    matrix[1][1] = sinZ * sinY * sinX + cosZ * cosX
    matrix[2][1] = -sinX * cosY
    matrix[0][2] = cosX * sinY * cosZ + sinX * sinZ
    matrix[1][2] = -cosX * sinY * sinZ + sinX * cosZ
    matrix[2][2] = cosY * cosX

    return matrix
  }

  static multiplyMatrices(m1, m2) {
    let result = []
    for (let i = 0; i < m1.length; i++) {
      result[i] = []
      for (let j = 0; j < m2[0].length; j++) {
        let sum = 0
        for (let k = 0; k < m1[0].length; k++) {
          sum += m1[i][k] * m2[k][j]
        }
        result[i][j] = sum
      }
    }
    return result
  }

  static multiplyMatrixAndVec(m, v) {
    let result = ZdogUtils.multiplyMatrices(m, [[v.x], [v.y], [v.z]])
    return new Zdog.Vector({
      x: result[0][0],
      y: result[1][0],
      z: result[2][0]
    })
  }

  static getTransposeMatrix(matrix) {
    let m = new Array(matrix.length)
    for (let i = 0; i < matrix.length; i++) {
      m[i] = new Array(matrix.length)
    }
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j <= i; j++) {
        if (i == j) {
          m[i][j] = matrix[j][i]
        } else {
          m[i][j] = matrix[j][i]
          m[j][i] = matrix[i][j]
        }
      }
    }
    return m
  }

  static isVecEqual(v1, v2) {
    if (!v1 || !v2) return false
    return ZdogUtils.isNumEqual(v1.x, v2.x) && ZdogUtils.isNumEqual(v1.y, v2.y) && ZdogUtils.isNumEqual(v1.z, v2.z)
  }

  static getDistance(v1, v2) {
    return Math.sqrt((v1.x - v2.x) ** 2 + (v1.y - v2.y) ** 2 + (v1.z - v2.z) ** 2)
  }

  static isNumEqual(num, sign) {
    let v = num - sign
    return v > -0.0000001 && v < 0.0000001
  }
}

function ZdogUtilsTest() {
  let cout = console.log
  cout('----------- ZdogUtilsTest START -----------')
  let angleX = Math.random() * Zdog.TAU
  let angleY = Math.random() * Zdog.TAU
  let angleZ = Math.random() * Zdog.TAU
  let x00 = new Zdog.Vector({ x: Math.random() })
  let y00 = new Zdog.Vector({ y: Math.random() })
  let z00 = new Zdog.Vector({ z: Math.random() })
  let rotation = new Zdog.Vector({ x: angleX, y: angleY, z: angleZ })

  // isVecEqual
  let isIsVecEqualPass = ZdogUtils.isVecEqual(x00, x00) && ZdogUtils.isVecEqual(y00, y00) && ZdogUtils.isVecEqual(z00, z00)
  cout('0. ZdogUtils.isVecEqual() ' + (isIsVecEqualPass ? 'pass' : 'not pass'))

  // getUnitVector
  x00 = ZdogUtils.getUnitVector(x00)
  y00 = ZdogUtils.getUnitVector(y00)
  z00 = ZdogUtils.getUnitVector(z00)
  let isGetUnitVectorPass = ZdogUtils.isNumEqual(x00.magnitude(), 1) && ZdogUtils.isNumEqual(y00.magnitude(), 1) && ZdogUtils.isNumEqual(z00.magnitude(), 1)
  cout('1. ZdogUtils.getUnitVector() ' + (isGetUnitVectorPass ? 'pass' : 'not pass'))

  let x01 = x00.copy().rotate(rotation)
  let y01 = y00.copy().rotate(rotation)
  let z01 = z00.copy().rotate(rotation)

  // vecDotProduct
  let isVecDotProductPass = ZdogUtils.isNumEqual(ZdogUtils.vecDotProduct(x00, y00), 0) &&
    ZdogUtils.isNumEqual(ZdogUtils.vecDotProduct(x00, z00), 0) &&
    ZdogUtils.isNumEqual(ZdogUtils.vecDotProduct(z00, y00), 0)
  cout('2. ZdogUtils.vecDotProduct() ' + (isVecDotProductPass ? 'pass' : 'not pass'))

  // getUnitNormalVector
  let isGetUnitNormalVectorPass = ZdogUtils.isVecEqual(ZdogUtils.getUnitNormalVector(x00, y00), z00) &&
    ZdogUtils.isVecEqual(ZdogUtils.getUnitNormalVector(z00, x00), y00) &&
    ZdogUtils.isVecEqual(ZdogUtils.getUnitNormalVector(y00, z00), x00)
  cout('3. ZdogUtils.getUnitNormalVector() ' + (isGetUnitNormalVectorPass ? 'pass' : 'not pass'))

  // getCoordinateTransformatedVector
  let isGetCoordinateTransformatedVectorPass = ZdogUtils.isVecEqual(ZdogUtils.getCoordinateTransformatedVector(z01, z00, z00), z01) &&
    ZdogUtils.isVecEqual(ZdogUtils.getCoordinateTransformatedVector(y01, y00, y00), y01) &&
    ZdogUtils.isVecEqual(ZdogUtils.getCoordinateTransformatedVector(x01, x00, x00), x01)
  cout('4. ZdogUtils.getCoordinateTransformatedVector() ' + (isGetCoordinateTransformatedVectorPass ? 'pass' : 'not pass'))

  // rotateAroundUnitVector
  let testVec5 = z00.copy()
  testVec5 = ZdogUtils.rotateAroundUnitVector(angleZ, z00, testVec5)
  testVec5 = ZdogUtils.rotateAroundUnitVector(angleY, y00, testVec5)
  testVec5 = ZdogUtils.rotateAroundUnitVector(angleX, x00, testVec5)
  cout('5. ZdogUtils.rotateAroundUnitVector() ' + (ZdogUtils.isVecEqual(testVec5, z01) ? 'pass' : 'not pass'))

  // getRotationMatrix
  let RM6 = ZdogUtils.getRotationMatrix(rotation)
  let testVec6 = ZdogUtils.multiplyMatrixAndVec(RM6, z00)
  cout('6. ZdogUtils.getRotationMatrix() ' + (ZdogUtils.isVecEqual(testVec6, z01) ? 'pass' : 'not pass'))

  // getTransposeRotationMatrix
  let TM7 = ZdogUtils.getTransposeRotationMatrix(rotation)
  let testVec7 = ZdogUtils.multiplyMatrixAndVec(TM7, z01)
  cout('7. ZdogUtils.getTransposeRotationMatrix() ' + (ZdogUtils.isVecEqual(testVec7, z00) ? 'pass' : 'not pass'))

  cout('----------- ZdogUtilsTest END -------------')
}