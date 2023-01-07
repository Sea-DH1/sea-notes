<script>
import Base from '../base/base.vue'
import { initDodecahedronGeometry } from '../../utils/primitive'

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
        radius: 7
      }

      this.mesh = initDodecahedronGeometry(options)
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
