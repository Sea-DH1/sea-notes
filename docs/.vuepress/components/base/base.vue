<template>
  <canvas ref="canvasRef"></canvas>
</template>

<script>
import * as THREE from 'three'
import { initRenderer, initCamera, initOrbitControls } from '../../utils'
import { initLight } from '../../utils/lights'

export default {
  data() {
    return {}
  },
  mounted() {
    this.main()
  },
  methods: {
    main() {
      const rendererOptions = {
        canvas: this.$refs.canvasRef,
        antialias: true
      }
      this.renderer = initRenderer(rendererOptions)
      const cameraOptions = {
        fov: 65,
        aspect: 2,
        near: 0.1,
        far: 1000
      }
      this.camera = initCamera(cameraOptions)
      this.camera.position.set(0, 0, 20)

      this.scene = new THREE.Scene()

      const lights = initLight()

      this.scene.add(...lights)

      this.controls = initOrbitControls(this.camera, this.renderer)

      this.render()
    },

    render() {
      if (this.mesh) {
        this.mesh.rotation.x += 0.005
        this.mesh.rotation.y += 0.005
      }

      this.controls.update()
      this.renderer.render(this.scene, this.camera)

      requestAnimationFrame(() => {
        this.render()
      })
    }
  }
}
</script>

<style scoped>
.view {
  width: 300px;
  height: 300px;
  position: relative;
}
</style>
