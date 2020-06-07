class ZdogUtils {
  static getUnitVector(v){
    let mag = v.magnitude();
    return new Zdog.Vector({
      x: v.x / mag,
      y: v.y / mag,
      z: v.z / mag
    });
  }

  static vecDotProduct(v1, v2){
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  }

  static getUnitVectorRotationAngle(v1, v2){
    return Math.acos(ZdogUtils.vecDotProduct(v1, v2));
  }

  static getUnitNormalVector(v1, v2){
    let v =  new Zdog.Vector({
      x: v1.y * v2.z - v2.y * v1.z,
      y: v2.x * v1.z - v1.x * v2.z,
      z: v1.x * v2.y - v2.x * v1.y
    });
    return ZdogUtils.getUnitVector(v);
  }

  static getCoordinateTransformatedVector(v1, v2, sourceVector){
    let cos = ZdogUtils.vecDotProduct(v1, v2);
    let sin = Math.sqrt(1 - cos * cos);
    let dcos = 1 - cos;
    let {x, y, z} = ZdogUtils.getUnitNormalVector(v1, v2);
    let rotationMatrix = [
      [ cos + dcos * x * x     , dcos * x * y - sin * z , dcos * x * z + sin * y ],
      [ dcos * y * x + sin * z , cos + dcos * y * y     , dcos * y * z - sin * x ],
      [ dcos * z * x - sin * y , dcos * z * y + sin * x , cos + dcos * z * z     ]
    ];

    // let v = new Zdog.Vector({
    //   x: rotationMatrix[0][0] * sourceVector.x + rotationMatrix[0][1] * sourceVector.y + rotationMatrix[0][2] * sourceVector.z,
    //   y: rotationMatrix[1][0] * sourceVector.x + rotationMatrix[1][1] * sourceVector.y + rotationMatrix[1][2] * sourceVector.z,
    //   z: rotationMatrix[2][0] * sourceVector.x + rotationMatrix[2][1] * sourceVector.y + rotationMatrix[2][2] * sourceVector.z
    // });
    let v = new Zdog.Vector({
      x: rotationMatrix[0][0] * sourceVector.x + rotationMatrix[1][0] * sourceVector.y + rotationMatrix[2][0] * sourceVector.z,
      y: rotationMatrix[0][1] * sourceVector.x + rotationMatrix[1][1] * sourceVector.y + rotationMatrix[2][1] * sourceVector.z,
      z: rotationMatrix[0][2] * sourceVector.x + rotationMatrix[1][2] * sourceVector.y + rotationMatrix[2][2] * sourceVector.z
    });
    return v;
  }

  static rotateAroundUnitVector(angle, UnitVectorAxis, oldPoint) {
    let sin = Math.sin(angle)
    let cos = Math.cos(angle)
    let dcos = 1 - cos
    let x = UnitVectorAxis.x
    let y = UnitVectorAxis.y
    let z = UnitVectorAxis.z

    let ox = oldPoint.x
    let oy = oldPoint.y
    let oz = oldPoint.z

    let nx = (x * x * dcos + cos) * ox + (x * y * dcos - z * sin) * oy + (x * z * dcos + y * sin) * oz
    let ny = (y * x * dcos + z * sin) * ox + (y * y * dcos + cos) * oy + (y * z * dcos - x * sin) * oz
    let nz = (x * z * dcos - y * sin) * ox + (y * z * dcos + x * sin) * oy + (z * z * dcos + cos) * oz

    return new Zdog.Vector({x: nx, y: ny, z: nz})
  }

  static getRotationMatrix(rotation) {
    let sinX = Math.sin(rotation.x);
    let sinY = Math.sin(rotation.y);
    let sinZ = Math.sin(rotation.z);

    let cosX = Math.cos(rotation.x);
    let cosY = Math.cos(rotation.y);
    let cosZ = Math.cos(rotation.z);

    let MX = [
      [1, 0, 0],
      [0, cosX, -sinX],
      [0, sinX, cosX]
    ];

    let MY = [
      [cosY, 0, -sinY],
      [0, 1, 0],
      [sinY, 0, cosY]
    ];

    let MZ = [
      [cosZ, -sinZ, 0],
      [sinZ, cosZ, 0],
      [0, 0, 1]
    ];

    let m = ZdogUtils.multiplyMatrices(ZdogUtils.multiplyMatrices(MX, MY), MZ);

    // m[0][0] = cosZ * cosY;
    // m[0][1] = cosZ * sinY * sinX - sinZ * cosX;
    // m[0][2] = cosZ * sinY * cosX + sinZ * sinX;
    // m[1][0] = sinZ * cosY;
    // m[1][1] = sinZ * sinY * sinX + cosZ * cosX;
    // m[1][2] = sinZ * sinY * cosX - cosZ * sinX;
    // m[2][0] = -sinY;
    // m[2][1] = cosY * sinX;
    // m[2][2] = cosY * cosX;

    return m;
  }

  static getTransposeRotationMatrix(rotation) {
    // let sinX = Math.sin(rotation.x);
    // let sinY = Math.sin(rotation.y);
    // let sinZ = Math.sin(rotation.z);

    // let cosX = Math.cos(rotation.x);
    // let cosY = Math.cos(rotation.y);
    // let cosZ = Math.cos(rotation.z);

    // let m = [[],[],[]];

    // m[0][0] = cosZ * cosY;
    // m[1][0] = cosZ * sinY * sinX - sinZ * cosX;
    // m[2][0] = cosZ * sinY * cosX + sinZ * sinX;
    // m[0][1] = sinZ * cosY;
    // m[1][1] = sinZ * sinY * sinX + cosZ * cosX;
    // m[2][1] = sinZ * sinY * cosX - cosZ * sinX;
    // m[0][2] = -sinY;
    // m[1][2] = cosY * sinX;
    // m[2][2] = cosY * cosX;

    let matrix = ZdogUtils.getRotationMatrix(rotation);

    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < i; j++) {
        const temp = matrix[i][j];
        matrix[i][j] = matrix[j][i];
        matrix[j][i] = temp;
      }
    }

    return matrix;
  }

  static multiplyMatrices(m1, m2) {
    let result = [];
    for (let i = 0; i < m1.length; i++) {
        result[i] = [];
        for (let j = 0; j < m2[0].length; j++) {
          let sum = 0;
            for (let k = 0; k < m1[0].length; k++) {
                sum += m1[i][k] * m2[k][j];
            }
            result[i][j] = sum;
        }
    }
    return result;
  }

  static multiplyMatrixAndVec(m, v) {
    let result = ZdogUtils.multiplyMatrices(m, [[v.x],[v.y],[v.z]]);
    return new Zdog.Vector({
      x: result[0][0],
      y: result[1][0],
      z: result[2][0]
    });
  }

  static getTransposeMatrix(matrix) {
    let m = new Array(matrix.length);
    for (let i = 0; i < matrix.length; i++) {
      m[i] = new Array(matrix.length);
    }
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j <= i; j++) {
        if (i == j) {
          m[i][j] = matrix[j][i];
        } else {
          m[i][j] = matrix[j][i];
          m[j][i] = matrix[i][j];
        }
      }
    }
    return m;
  }

  static test(){
    let x00 = new Zdog.Vector({x: 1});
    let y00 = new Zdog.Vector({y: 1});
    let z00 = new Zdog.Vector({z: 1});
    let rotation = new Zdog.Vector({x: 1.0471975511965976, y: 0, z: 0.7853981633974483});
    let z11 = z00.copy();
    let x01 = x00.copy().rotate(rotation);
    let y01 = y00.copy().rotate(rotation);
    let z01 = z00.copy().rotate(rotation);
    console.table(z01);
  }
}

// ZdogUtils.test();