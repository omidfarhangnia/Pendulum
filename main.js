import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

function main() {
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  renderer.shadowMap.enabled = true;

  const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 300);
  camera.lookAt(0, 0, 0);
  camera.position.z = 35;
  camera.position.y = -50;
  
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xbebebe);
  scene.fog = new THREE.Fog(0xbebebe, 10, 100);

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 0, 5);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;

  const loader = new THREE.TextureLoader();

  // plane
  {
    const planeGeo = new THREE.PlaneGeometry(100, 100);
    const planeMat = new THREE.MeshBasicMaterial({ color: 0xbebebe });
    const planeMesh = new THREE.Mesh(planeGeo, planeMat);
    scene.add(planeMesh);
  }

  // lights
  {
    // spot light
    const spotLight = new THREE.SpotLight(0xffffff, 700);
    spotLight.angle = THREE.MathUtils.degToRad(60);
    spotLight.position.set(10, 0, 30);
    spotLight.target.position.set(0, 0, 5);
    spotLight.castShadow = true;
    scene.add(spotLight);
    // hemisphere light
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.3);
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
    surfaceMesh.receiveShadow = true;

    scene.add(surfaceMesh);
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
  const spheresObj = [];
  {
    const spheresData = [
      { y: 18, z: 16 },
      { y: 14, z: 15 },
      { y: 10, z: 14 },
      { y: 6, z: 13 },
      { y: 2, z: 12 },
      { y: -2, z: 11 },
      { y: -6, z: 10 },
      { y: -10, z: 9 },
      { y: -14, z: 8 },
      { y: -18, z: 7 },
    ];

    const sphereGeo = new THREE.SphereGeometry(1.5, 20, 20);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0,
      metalness: 0.3,
    });

    const lineMat = new THREE.LineBasicMaterial({
      color: "black",
    });

    for (let sphere of spheresData) {
      const obj = new THREE.Object3D();
      const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
      sphereMesh.castShadow = true;
      const points = [
        new THREE.Vector3(0, 0, sphere.z - 32),
        new THREE.Vector3(0, 0, 0),
      ];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(lineGeo, lineMat);

      sphereMesh.position.set(0, 0, sphere.z - 32);
      obj.position.set(0, sphere.y, 31.5);

      obj.add(sphereMesh);
      obj.add(line);
      spheresObj.push(obj);
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
    time *= 0.0025;

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    spheresObj.forEach((sphere, i) => {
      sphere.rotation.y = THREE.MathUtils.degToRad(Math.sin(time + i / 2) * 20);
    });

    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}
main();
