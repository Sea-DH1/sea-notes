import * as THREE from 'three'

export function initLight() {
  const lights = []
  lights[0] = new THREE.PointLight(0xffffff, 1, 0)
  lights[1] = new THREE.PointLight(0xffffff, 1, 0)
  lights[2] = new THREE.PointLight(0xffffff, 1, 0)

  lights[0].position.set(0, 200, 0)
  lights[1].position.set(100, 200, 100)
  lights[2].position.set(-100, -200, -100)
  return lights
}
