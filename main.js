import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

function main() {
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 300);
  camera.lookAt(0, 0, 0);
  // camera.position.z = 15;
  // camera.position.y = -30;
  camera.position.z = 40;
  camera.position.y = -50;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("gray");

  {
    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 0, 0);
    controls.update();
  }

  const loader = new THREE.TextureLoader();

  {
    // plane
    const planeGeo = new THREE.PlaneGeometry(100, 100);
    const planeMat = new THREE.MeshPhongMaterial({ color: 0xd6d6d6 });
    const planeMesh = new THREE.Mesh(planeGeo, planeMat);
    scene.add(planeMesh);
  }

  // lights
  {
    // spot light
    const spotLight = new THREE.SpotLight(0xffffff, 2000);
    spotLight.angle = THREE.MathUtils.degToRad(55);
    spotLight.position.set(0, 0, 25);
    spotLight.target.position.set(0, 0, 0);
    scene.add(spotLight);
    // spot light helper
    const spotHelper = new THREE.SpotLightHelper(spotLight);
    scene.add(spotHelper);
    // hemisphere light
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.5);
    scene.add(hemisphereLight);
  }

  {
    // container surface
    const topAndBottomTexture = loader.load("./public/stone_texture.jpg"),
      rightAndLeftTexture = loader.load("./public/stone_texture.jpg"),
      frontAndBackTexture = loader.load("./public/stone_texture.jpg");

    topAndBottomTexture.repeat.set(1, 1);
    rightAndLeftTexture.repeat.set(1, 1 / 40);
    frontAndBackTexture.repeat.set(1 / 40, 1);

    const surfaceGeo = new THREE.BoxGeometry(40, 40, 1);
    const surfaceMat = [
      new THREE.MeshStandardMaterial({ map: frontAndBackTexture }),
      new THREE.MeshStandardMaterial({ map: frontAndBackTexture }),
      new THREE.MeshStandardMaterial({ map: rightAndLeftTexture }),
      new THREE.MeshStandardMaterial({ map: rightAndLeftTexture }),
      new THREE.MeshStandardMaterial({ map: topAndBottomTexture }),
      new THREE.MeshStandardMaterial({ map: topAndBottomTexture }),
    ];

    const surfaceMesh = new THREE.Mesh(surfaceGeo, surfaceMat);
    surfaceMesh.position.set(0, 0, 1);
    scene.add(surfaceMesh);
  }

  function makeXYZGUI(gui, vector3, name, onChangeFn) {
    const folder = gui.addFolder(name);
    folder.add(vector3, "x", -100, 100).onChange(onChangeFn);
    folder.add(vector3, "y", -100, 100).onChange(onChangeFn);
    folder.add(vector3, "z", -100, 100).onChange(onChangeFn);
  }

  {
    const gui = new GUI();
    function pendulumBases() {
      const baseGeo = new THREE.CylinderGeometry(0.5, 0.5, 25, 3);
      const baseMat = new THREE.MeshBasicMaterial({ color: "brown" });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.rotation.x = THREE.MathUtils.degToRad(90);
      // baseMesh.position.set(0, 0, 15);

      const baseParent = new THREE.Object3D();
      baseParent.position.set(20, 20, 10);

      makeXYZGUI(gui, baseMesh.position, "base pos");
      makeXYZGUI(gui, baseParent.position, "obj pos");

      const objRotation = {
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
      };

      gui.add(objRotation, "rotationX", -Math.PI, Math.PI).onChange(() => {
        baseParent.rotation.x = objRotation.rotationX;
      });
      gui.add(objRotation, "rotationY", -Math.PI, Math.PI).onChange(() => {
        baseParent.rotation.y = objRotation.rotationY;
      });
      gui.add(objRotation, "rotationZ", -Math.PI, Math.PI).onChange(() => {
        baseParent.rotation.z = objRotation.rotationZ;
      });

      baseParent.add(baseMesh);
      scene.add(baseParent);
    }

    pendulumBases();
  }

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }

    return needResize;
  }

  function render(time) {
    time *= 0.001;

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}
main();
