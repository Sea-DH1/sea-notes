<script>
import * as THREE from 'three'
import Base from '../base/base.vue'
import { initLatheGeometry } from '../../utils/primitive'

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
      const points = []
      for (let i = 0; i < 10; ++i) {
        points.push(new THREE.Vector2(Math.sin(i * 0.2) * 3 + 3, (i - 5) * 0.8))
      }

      const options = {
        points,
        segments: 12,
        phiStart: Math.PI * 0.25,
        phiLength: Math.PI * 1.5
      }

      this.mesh = initLatheGeometry(options)
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
