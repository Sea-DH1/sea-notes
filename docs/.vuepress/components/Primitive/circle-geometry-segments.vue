<script>
import Base from '../base/base.vue'
import { initCircleGeometry } from '../../utils/primitive'

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
      const options = {
        radius: 7,
        segments: 24,
        thetaStart: Math.PI * 0.25,
        thetaLength: Math.PI * 1.5
      }
      this.mesh = initCircleGeometry(options)
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
