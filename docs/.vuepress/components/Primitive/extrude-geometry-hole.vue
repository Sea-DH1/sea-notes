<script>
import * as THREE from 'three'
import Base from '../base/base.vue'
import { initExtrudeGeometry } from '../../utils/primitive'

export default {
  extends: Base,
  data() {
    return {}
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.camera.position.set(0, 0, 20)
      const shape = new THREE.Shape(
        [
          [-2, -0.1],
          [2, -0.1],
          [2, 0.6],
          [1.6, 0.6],
          [1.6, 0.1],
          [-2, 0.1]
        ].map((p) => new THREE.Vector2(...p))
      )

      const x = -2.5
      const y = -5
      const curve = new THREE.CurvePath()
      const points = [
        [x + 2.5, y + 2.5],
        [x + 2.5, y + 2.5],
        [x + 2, y],
        [x, y],
        [x - 3, y],
        [x - 3, y + 3.5],
        [x - 3, y + 3.5],
        [x - 3, y + 5.5],
        [x - 1.5, y + 7.7],
        [x + 2.5, y + 9.5],
        [x + 6, y + 7.7],
        [x + 8, y + 4.5],
        [x + 8, y + 3.5],
        [x + 8, y + 3.5],
        [x + 8, y],
        [x + 5, y],
        [x + 3.5, y],
        [x + 2.5, y + 2.5],
        [x + 2.5, y + 2.5]
      ].map((p) => new THREE.Vector3(...p, 0))
      for (let i = 0; i < points.length; i += 3) {
        curve.add(new THREE.CubicBezierCurve3(...points.slice(i, i + 4)))
      }

      const options = {
        steps: 100, // ui: steps
        bevelEnabled: false,
        extrudePath: curve
      }

      this.mesh = initExtrudeGeometry(shape, options)
      this.scene.add(this.mesh)
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
