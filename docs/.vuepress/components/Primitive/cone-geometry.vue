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
      this.camera.position.set(0, 0, 3)
      const options = {
        radius: 6,
        height: 8,
        radialSegments: 16
      }

      this.cube = initConeGeometry(options)
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
