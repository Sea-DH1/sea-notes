import * as THREE from 'three'

const twoPI = Math.PI * 2

export function initBoxGeometry({
  width,
  height,
  depth,
  widthSegments,
  heightSegments,
  depthSegments
}) {
  const group = new THREE.Group()

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

export function initConeGeometry() {
  const group = new THREE.Group()

  const { radius, height, radialSegments } =
    typeof options !== 'undefined' && options
      ? options
      : {
          radius: 1,
          height: 1,
          radialSegments: 32,
          heightSegments: 1,
          openEnded: false,
          thetaStart: 0,
          thetaLength: twoPI
        }

  const geometry = new THREE.ConeGeometry(radius, height, radialSegments)

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
