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
        widthSegments: 1,
        heightSegments: 1,
        depthSegments: 1
      }

      this.cube = initBoxGeometry(options)
      this.scene.add(this.cube)
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
