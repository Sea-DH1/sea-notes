<script>
import Base from '../base/base.vue'
import { initCylinderGeometry } from '../../utils/primitive'

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
        radiusTop: 4,
          radiusBottom: 4,
          height: 8,
          radialSegments: 12,
          heightSegments: 2,
          openEnded: false,
          thetaStart: Math.PI * 0.25,
          thetaLength: Math.PI * 1.5
      }

      this.mesh = initCylinderGeometry(options)
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
