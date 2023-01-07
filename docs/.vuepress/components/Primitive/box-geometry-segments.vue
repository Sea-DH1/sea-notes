<script>
import Base from '../base/base.vue'
import { initBoxGeometry } from '../../utils/primitive'

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
        width: 8,
        height: 8,
        depth: 8,
        widthSegments: 4,
        heightSegments: 4,
        depthSegments: 4
      }

      this.mesh = initBoxGeometry(options)
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
