<template>
  <canvas id="c2"></canvas>
</template>

<script>
import * as THREE from 'three/build/three.module.js'

let scene, camera, renderer, cube

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
      const canvas = document.querySelector('#c2')
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

      // const material = new THREE.MeshBasicMaterial({ color: 0x44aa88 }) // greenish blue
      const material = new THREE.MeshPhongMaterial({color: 0x44aa88}); 

      cube = new THREE.Mesh(geometry, material)
      scene.add(cube)

      this.render(0)
    },

    render(time) {
      time *= 0.001 // convert time to seconds

      cube.rotation.x = time
      cube.rotation.y = time

      renderer.render(scene, camera)

      requestAnimationFrame((e) => {
        this.render(e)
      })
    }
  }
}
</script>
