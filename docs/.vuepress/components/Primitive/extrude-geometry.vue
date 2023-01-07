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
      const shape = new THREE.Shape()
      const x = -2.5
      const y = -5
      shape.moveTo(x + 2.5, y + 2.5)
      shape.bezierCurveTo(x + 2.5, y + 2.5, x + 2, y, x, y)
      shape.bezierCurveTo(x - 3, y, x - 3, y + 3.5, x - 3, y + 3.5)
      shape.bezierCurveTo(x - 3, y + 5.5, x - 1.5, y + 7.7, x + 2.5, y + 9.5)
      shape.bezierCurveTo(x + 6, y + 7.7, x + 8, y + 4.5, x + 8, y + 3.5)
      shape.bezierCurveTo(x + 8, y + 3.5, x + 8, y, x + 5, y)
      shape.bezierCurveTo(x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5)

      const options = {
        steps: 2, // ui: steps
        depth: 2, // ui: depth
        bevelEnabled: true, // ui: bevelEnabled
        bevelThickness: 1, // ui: bevelThickness
        bevelSize: 1, // ui: bevelSize
        bevelSegments: 2 // ui: bevelSegments
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
