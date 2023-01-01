<template>
  <canvas id="c1"></canvas>
</template>

<script>
import * as THREE from 'three/build/three.module.js';

let scene, camera, renderer, cube

export default {
  data() {
    return {
      gui:null
    }
  },
  mounted(){
    this.main()
  },
  methods:{
    main() {
      const canvas = document.querySelector('#c1');
      renderer = new THREE.WebGLRenderer({canvas});

      const fov = 75;
      const aspect = 2;  // the canvas default
      const near = 0.1;
      const far = 5;
      camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
      camera.position.z = 2;

      scene = new THREE.Scene();

      const boxWidth = 1;
      const boxHeight = 1;
      const boxDepth = 1;
      const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

      const material = new THREE.MeshBasicMaterial({color: 0x44aa88});  // greenish blue

      cube = new THREE.Mesh(geometry, material);
      scene.add(cube);

      requestAnimationFrame((e) => {
        this.render(e)
      })
    },

    render(time) {
      time *= 0.001;  // convert time to seconds

      cube.rotation.x = time;
      cube.rotation.y = time;

      renderer.render(scene, camera);

      requestAnimationFrame((e) => {
        this.render(e)
      })
    }
  }
}
</script>
