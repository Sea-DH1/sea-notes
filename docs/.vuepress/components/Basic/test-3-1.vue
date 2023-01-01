<template>
  <canvas id="c4"></canvas>
</template>

<script>
import * as THREE from 'three/build/three.module.js'

let scene, camera, renderer, cubes

export default {
  data() {
    return {
      gui: null
    }
  },
  mounted() {
    this.main()
  },
  methods: {
    main() {
      const canvas = document.querySelector('#c4')
      renderer = new THREE.WebGLRenderer({ canvas })

      const fov = 75
      const aspect = 2 // the canvas default
      const near = 0.1
      const far = 5
      camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
      camera.position.z = 2

      scene = new THREE.Scene()

      const color = 0xffffff
      const intensity = 1
      const light = new THREE.DirectionalLight(color, intensity)
      light.position.set(-1, 2, 4)
      scene.add(light)

      const boxWidth = 1
      const boxHeight = 1
      const boxDepth = 1
      const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth)

      cubes = [
        this.makeInstance(geometry, 0x44aa88, 0),
        this.makeInstance(geometry, 0x8844aa, -2),
        this.makeInstance(geometry, 0xaa8844, 2)
      ]

      this.render(0)
    },

    makeInstance(geometry, color, x) {
      const material = new THREE.MeshPhongMaterial({ color })

      const cube = new THREE.Mesh(geometry, material)
      scene.add(cube)

      cube.position.x = x

      return cube
    },

    render(time) {
      time *= 0.001 // convert time to seconds

      cubes.forEach((cube, ndx) => {
        const speed = 1 + ndx * 0.1
        const rot = time * speed
        cube.rotation.x = rot
        cube.rotation.y = rot
      })

      renderer.render(scene, camera)

      requestAnimationFrame((e) => {
        this.render(e)
      })
    }
  }
}
</script>
