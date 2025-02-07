import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

function main() {
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 300);
  camera.lookAt(0, 0, 0);
  camera.position.z = 20;
  camera.position.x = 40;
  camera.rotateY(THREE.MathUtils.degToRad(80));
  camera.rotateZ(THREE.MathUtils.degToRad(90));
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("gray");
  // const gui = new GUI();

  // {
  //   const controls = new OrbitControls(camera, canvas);
  //   controls.target.set(0, 0, 0);
  //   controls.update();
  // }

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
    spotLight.position.set(0, 0, 30);
    spotLight.target.position.set(0, 0, 0);
    scene.add(spotLight);
    // spot light helper
    const spotHelper = new THREE.SpotLightHelper(spotLight);
    scene.add(spotHelper);
    // hemisphere light
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.5);
    scene.add(hemisphereLight);
  }

  // container surface
  {
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

  // bases
  {
    const woodTexture = loader.load("./public/wood_texture.jpg");
    const baseMat = new THREE.MeshStandardMaterial({ map: woodTexture });
    const baseGeo = new THREE.CylinderGeometry(0.5, 0.5, 35, 15);

    function pendulumBases(x, y, isRight) {
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);

      const baseParent = new THREE.Object3D();
      baseParent.position.set(x, y, 16);

      baseParent.rotation.set(
        THREE.MathUtils.degToRad(isRight ? 90 : -90),
        0,
        THREE.MathUtils.degToRad(25)
      );

      baseParent.add(baseMesh);
      scene.add(baseParent);
    }

    pendulumBases(11, 18, true);
    pendulumBases(-11, 18, false);
    pendulumBases(11, -18, true);
    pendulumBases(-11, -18, false);
  }

  // bases container
  {
    const topAndBottomTexture = loader.load("./public/wood_texture.jpg"),
      rightAndLeftTexture = loader.load("./public/wood_texture.jpg"),
      frontAndBackTexture = loader.load("./public/wood_texture.jpg");

    topAndBottomTexture.repeat.set(1, 1);
    rightAndLeftTexture.repeat.set(1, 1 / 40);
    frontAndBackTexture.repeat.set(1 / 40, 1);

    const baseContainerGeo = new THREE.BoxGeometry(13, 40, 1);

    const baseContainerMat = [
      new THREE.MeshStandardMaterial({ map: frontAndBackTexture }),
      new THREE.MeshStandardMaterial({ map: frontAndBackTexture }),
      new THREE.MeshStandardMaterial({ map: rightAndLeftTexture }),
      new THREE.MeshStandardMaterial({ map: rightAndLeftTexture }),
      new THREE.MeshStandardMaterial({ map: topAndBottomTexture }),
      new THREE.MeshStandardMaterial({ map: topAndBottomTexture }),
    ];
    const baseContainerMesh = new THREE.Mesh(
      baseContainerGeo,
      baseContainerMat
    );
    baseContainerMesh.position.set(0, 0, 32);

    scene.add(baseContainerMesh);
  }

  // spheres
  {
    const spheres = [];

    for (var i = 0; i < 10; i++) {
      const value = {
        y: 18 - i * 4,
        z: 16 - i,
      };

      spheres.push(value);
    }

    const sphereGeo = new THREE.SphereGeometry(1.5, 20, 20);
    const sphereMat = new THREE.MeshStandardMaterial({ color: "blue" });

    const lineMat = new THREE.LineBasicMaterial({
      color: "black",
    });

    for (let sphere of spheres) {
      const obj = new THREE.Object3D();
      const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
      const points = [
        new THREE.Vector3(0, sphere.y, sphere.z),
        new THREE.Vector3(0, sphere.y, 32),
      ];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(lineGeo, lineMat);

      obj.position.set(0, sphere.y, sphere.z);

      obj.add(sphereMesh);
      scene.add(line);
      scene.add(obj);
    }
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
