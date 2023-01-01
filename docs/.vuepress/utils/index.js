import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

/**
 * 初始化renderer
 *
 * @param additionalProperties Additional properties to pass into the renderer
 * @param domEl 容器
 */
export function initRenderer(additionalProperties) {
  const props =
    typeof additionalProperties !== 'undefined' && additionalProperties ? additionalProperties : {}
  const renderer = new THREE.WebGLRenderer(props)
  return renderer
}

/**
 * Initialize a simple camera and point it at the center of a scene
 * 初始化相机
 *
 * @param domEl 容器
 * @param {THREE.Vector3} [initialPosition]
 */
export function initCamera({ fov, aspect, near, far }, initialPosition) {
  const position = initialPosition !== undefined ? initialPosition : new THREE.Vector3(-10, 40, 30)

  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
  camera.position.set(position.x, position.y, position.z)
  camera.lookAt(new THREE.Vector3(0, 0, 0))

  return camera
}

/**
 * Initialize OrbitControls in the scene
 *
 * @param {THREE.Camera} camera
 * @param {THREE.Renderer} renderer
 */
export function initOrbitControls(camera, renderer) {
  const orbitControls = new OrbitControls(camera, renderer.domElement)
  orbitControls.enableDamping = true
  orbitControls.dampingFactor = 0.05
  orbitControls.screenSpacePanning = false

  // orbitControls.minDistance = 100
  // orbitControls.maxDistance = 500

  return orbitControls
}
