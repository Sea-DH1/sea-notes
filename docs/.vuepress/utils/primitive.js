import * as THREE from 'three'

const twoPI = Math.PI * 2

export function initBoxGeometry(options) {
  const group = new THREE.Group()

  const { width, height, depth, widthSegments, heightSegments, depthSegments } =
    typeof options !== 'undefined' && options
      ? options
      : {
          radius: 1,
          segments: 24,
          thetaStart: 0,
          thetaLength: twoPI
        }

  const geometry = new THREE.BoxGeometry(
    width,
    height,
    depth,
    widthSegments,
    heightSegments,
    depthSegments
  )

  const lineMaterial = setLineMaterial()
  const meshMaterial = setMaterial()

  group.add(new THREE.LineSegments(geometry, lineMaterial))
  group.add(new THREE.Mesh(geometry, meshMaterial))

  return group
}

export function initCircleGeometry(options) {
  const group = new THREE.Group()

  const { radius, segments, thetaStart, thetaLength } =
    typeof options !== 'undefined' && options
      ? options
      : {
          radius: 1,
          segments: 24,
          thetaStart: 0,
          thetaLength: twoPI
        }

  const geometry = new THREE.CircleGeometry(radius, segments, thetaStart, thetaLength)

  const lineMaterial = setLineMaterial()
  const meshMaterial = setMaterial()

  group.add(new THREE.LineSegments(geometry, lineMaterial))
  group.add(new THREE.Mesh(geometry, meshMaterial))

  return group
}

export function initConeGeometry(options) {
  const group = new THREE.Group()

  const { radius, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength } =
    typeof options !== 'undefined' && options
      ? options
      : {
          radius: 1,
          height: 1,
          radialSegments: 16,
          heightSegments: 1,
          openEnded: false,
          thetaStart: 0,
          thetaLength: twoPI
        }

  const geometry = new THREE.ConeGeometry(
    radius,
    height,
    radialSegments,
    heightSegments,
    openEnded,
    thetaStart,
    thetaLength
  )

  const lineMaterial = setLineMaterial()
  const meshMaterial = setMaterial()

  group.add(new THREE.LineSegments(geometry, lineMaterial))
  group.add(new THREE.Mesh(geometry, meshMaterial))

  return group
}

export function initCylinderGeometry(options) {
  const group = new THREE.Group()

  const {
    radiusTop,
    radiusBottom,
    height,
    radialSegments,
    heightSegments,
    openEnded,
    thetaStart,
    thetaLength
  } =
    typeof options !== 'undefined' && options
      ? options
      : {
          radiusTop: 1,
          radiusBottom: 1,
          height: 1,
          radialSegments: 16,
          heightSegments: 1,
          openEnded: false,
          thetaStart: 0,
          thetaLength: twoPI
        }

  const geometry = new THREE.CylinderGeometry(
    radiusTop,
    radiusBottom,
    height,
    radialSegments,
    heightSegments,
    openEnded,
    thetaStart,
    thetaLength
  )

  const lineMaterial = setLineMaterial()
  const meshMaterial = setMaterial()

  group.add(new THREE.LineSegments(geometry, lineMaterial))
  group.add(new THREE.Mesh(geometry, meshMaterial))

  return group
}

export function initDodecahedronGeometry(options) {
  const group = new THREE.Group()

  const { radius, detail } =
    typeof options !== 'undefined' && options
      ? options
      : {
          radius: 1,
          detail: 0
        }

  const geometry = new THREE.DodecahedronGeometry(radius, detail)

  const lineMaterial = setLineMaterial()
  const meshMaterial = setMaterial()

  group.add(new THREE.LineSegments(geometry, lineMaterial))
  group.add(new THREE.Mesh(geometry, meshMaterial))

  return group
}

export function initExtrudeGeometry(shape, options) {
  const group = new THREE.Group()

  const bevelThickness = 0.2

  const op =
    typeof options !== 'undefined' && options
      ? options
      : {
          curveSegments: 1,
          steps: 0,
          depth: 1,
          bevelEnabled: true,
          bevelThickness: bevelThickness,
          bevelSize: bevelThickness - 0.1,
          bevelOffset: 0,
          bevelSegments: 3,
          extrudePath: THREE.Curve
        }

  const geometry = new THREE.ExtrudeGeometry(shape, op)

  const lineMaterial = setLineMaterial()
  const meshMaterial = setMaterial()

  group.add(new THREE.LineSegments(geometry, lineMaterial))
  group.add(new THREE.Mesh(geometry, meshMaterial))

  return group
}

export function initIcosahedronGeometry(options) {
  const group = new THREE.Group()

  const { radius, detail } =
    typeof options !== 'undefined' && options
      ? options
      : {
          radius: 1,
          detail: 0
        }

  const geometry = new THREE.IcosahedronGeometry(radius, detail)

  const lineMaterial = setLineMaterial()
  const meshMaterial = setMaterial()

  group.add(new THREE.LineSegments(geometry, lineMaterial))
  group.add(new THREE.Mesh(geometry, meshMaterial))

  return group
}

export function initLatheGeometry(options) {
  const group = new THREE.Group()

  const { points, segments, phiStart, phiLength } =
    typeof options !== 'undefined' && options
      ? options
      : {
          points: [
            new THREE.Vector2(0, -0.5),
            new THREE.Vector2(0.5, 0),
            new THREE.Vector2(0, 0.5)
          ],
          segments: 12,
          phiStart: 0,
          phiLength: twoPI
        }

  const geometry = new THREE.LatheGeometry(points, segments, phiStart, phiLength)

  const lineMaterial = setLineMaterial()
  const meshMaterial = setMaterial()

  group.add(new THREE.LineSegments(geometry, lineMaterial))
  group.add(new THREE.Mesh(geometry, meshMaterial))

  return group
}

export function initOctahedronGeometry(options) {
  const group = new THREE.Group()

  const { radius, detail } =
    typeof options !== 'undefined' && options
      ? options
      : {
          radius: 1,
          detail: 0
        }

  const geometry = new THREE.OctahedronGeometry(radius, detail)

  const lineMaterial = setLineMaterial()
  const meshMaterial = setMaterial()

  group.add(new THREE.LineSegments(geometry, lineMaterial))
  group.add(new THREE.Mesh(geometry, meshMaterial))

  return group
}

function setLineMaterial() {
  return new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.5
  })
}

function setMaterial() {
  return new THREE.MeshPhongMaterial({
    color: 0x156289,
    emissive: 0x072534,
    side: THREE.DoubleSide,
    flatShading: true
  })
}
