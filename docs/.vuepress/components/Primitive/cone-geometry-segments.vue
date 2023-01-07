<script>
import Base from '../base/base.vue'
import { initConeGeometry } from '../../utils/primitive'

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
      const options = {
        radius: 6,
        height: 8,
        radialSegments: 16,
        heightSegments :2,
        openEnded: true,
        thetaStart: Math.PI * 0.25,
        thetaLength: Math.PI * 1.5
      }

      this.mesh = initConeGeometry(options)
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
