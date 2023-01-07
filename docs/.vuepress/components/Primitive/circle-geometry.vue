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
      const twoPi = Math.PI * 2

      const options = {
        radius: 7,
        segments: 24,
        thetaStart: 0,
        thetaLength: twoPi
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

