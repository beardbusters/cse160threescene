import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { all } from './wowscene.js';


class MinMaxGUIHelper {
  constructor(obj, minProp, maxProp, minDif) {
    this.obj = obj;
    this.minProp = minProp;
    this.maxProp = maxProp;
    this.minDif = minDif;
  }
  get min() {
    return this.obj[this.minProp];
  }
  set min(v) {
    this.obj[this.minProp] = v;
    this.obj[this.maxProp] = Math.max(this.obj[this.maxProp], v + this.minDif);
  }
  get max() {
    return this.obj[this.maxProp];
  }
  set max(v) {
    this.obj[this.maxProp] = v;
    this.min = this.min;
  }
}

class ColorGUIHelper {
  constructor(object, prop) {
    this.object = object;
    this.prop = prop;
  }
  get value() {
    return '#' + this.object[this.prop].getHexString();
  }
  set value(hexString) {
    this.object[this.prop].set(hexString);
  }
}

function makeXYZGUI(gui, vector3, name, onChangeFn) {
  const folder = gui.addFolder(name);
  folder.add(vector3, 'x', -10, 10).onChange(onChangeFn);
  folder.add(vector3, 'y', 0, 10).onChange(onChangeFn);
  folder.add(vector3, 'z', -10, 10).onChange(onChangeFn);
  folder.open();
}


function main() {
  const canvas = document.querySelector('#c');

  /*const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
  });*/
/*
  const renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas,
      logarithmicDepthBuffer: true,
  });*/
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas,
    alpha: true,
  });


  renderer.setPixelRatio(window.devicePixelRatio);

  const scene = new THREE.Scene();
  //scene.background = new THREE.Color(0x202025);

  //skybox 
  const bgLoader = new THREE.TextureLoader();
  bgLoader.load('./src/textures/sky.png', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    scene.background = texture;
  });



  const camera = new THREE.PerspectiveCamera(
    60,
    2,
    0.1,
    100
  );
  camera.position.set(0, 1.5, 4);

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 1, 0);
  controls.update();

// lighting 

const skyColor = 0xB1E1FF;
const groundColor = 0xB97A20;
const intensity1 = 0.5;
const light1 = new THREE.HemisphereLight(skyColor, groundColor, intensity1);
scene.add(light1);

const color = 0xFFFFFF;
const intensity = 3;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(-5.48, 10, 0);
light.target.position.set(2.88, 0.66, 0);
scene.add(light);
scene.add(light.target);

const color2 = 0x73D9F0;
const intensity2 = 0.5;
const light2 = new THREE.AmbientLight(color2, intensity2);
scene.add(light2);   


const helper = new THREE.DirectionalLightHelper(light);
scene.add(helper);


    const planeSize = 50; 
    const loader1 = new THREE.TextureLoader();
    //const texture = loader1.load('./src/textures/checker.png');
    const texture = loader1.load('./src/textures/seamsand.jpg');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    const repeats = planeSize / 2;
    texture.repeat.set(repeats, repeats);
    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshPhongMaterial({
    map: texture,
    side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.rotation.x = Math.PI * -.5;
    scene.add(mesh);


  let model = null;

  // render a bunch of stuff found in wowscene
  // that file contains the loaderes for the primary objects
  // as well as the other models used to make the scene nice 
  //all(scene);
  const animatedObjects = all(scene);


  const loader = new GLTFLoader();
  loader.load(
    './src/models/StandingDesk.glb',
    (gltf) => {
      model = gltf.scene;
      scene.add(model);

      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);

      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      if (maxDim > 0) {
        const scale = 2 / maxDim;
        model.scale.setScalar(scale);
      }

      const newBox = new THREE.Box3().setFromObject(model);
      model.position.y -= newBox.min.y;

      const finalBox = new THREE.Box3().setFromObject(model);
      const finalCenter = finalBox.getCenter(new THREE.Vector3());
      controls.target.copy(finalCenter);
      controls.update();
    },
    undefined,
    (error) => {
      console.error('Error loading GLB:', error);
    }
  );

  
/*
  // GUI stuff
// camera GUI
  const gui = new GUI();
  gui.add(camera, 'fov', 1, 180).onChange(updateCamera);
  const minMaxGUIHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);
  gui.add(minMaxGUIHelper, 'min', 0.01, 50, 0.01).name('near').onChange(updateCamera);
  gui.add(minMaxGUIHelper, 'max', 0.1, 200, 0.1).name('far').onChange(updateCamera);
*/
/*
// hemisphere light GUI
  const gui2 = new GUI();
  //gui2.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
  gui2.addColor(new ColorGUIHelper(light, 'color'), 'value').name('skyColor');
  gui2.addColor(new ColorGUIHelper(light, 'groundColor'), 'value').name('groundColor');
  gui2.add(light, 'intensity', 0, 5, 0.01);
*/
/*
// directional light GUI 
  const gui = new GUI();
  gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
  gui.add(light, 'intensity', 0, 5, 0.01);
  gui.add(light.target.position, 'x', -10, 10);
  gui.add(light.target.position, 'z', -10, 10);
  gui.add(light.target.position, 'y', 0, 10);
*/
// updated helper GUI 
function updateLight() {
  light.target.updateMatrixWorld();
  helper.update();
}
updateLight();
const gui = new GUI();
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.add(light, 'intensity', 0, 5, 0.01);
makeXYZGUI(gui, light.position, 'position', updateLight);
makeXYZGUI(gui, light.target.position, 'target', updateLight);



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


  let lastTime = 0;

function render(time) {
  time *= 0.001;
  const deltaTime = time - lastTime;
  lastTime = time;

  for (const obj of animatedObjects) {
    if (obj.userData.kind === 'orbitSphere') {
      const i = obj.userData.orbitIndex;
      const count = obj.userData.orbitCount;
      const radius = obj.userData.orbitRadius;
      const height = obj.userData.orbitHeight;

      const angle = time + (i / count) * Math.PI * 2;

      obj.position.x = Math.cos(angle) * radius;
      obj.position.z = Math.sin(angle) * radius;
      obj.position.y = height;
    }

    if (obj.userData.kind === 'tank') {
      const speed = obj.userData.speed;
      const minX = obj.userData.pathMinX;
      const maxX = obj.userData.pathMaxX;
      const minZ = obj.userData.pathMinZ;
      const maxZ = obj.userData.pathMaxZ;
      const y = obj.userData.y;

      const move = speed * deltaTime;
      const tankHeadingOffset = Math.PI / -2;


        if (obj.userData.segment === 0) {
        obj.position.x += move;
        obj.rotation.y = -Math.PI / 2 + tankHeadingOffset;
        if (obj.position.x >= maxX) {
            obj.position.x = maxX;
            obj.userData.segment = 1;
        }
        } else if (obj.userData.segment === 1) {
        obj.position.z += move;
        obj.rotation.y = Math.PI + tankHeadingOffset;
        if (obj.position.z >= maxZ) {
            obj.position.z = maxZ;
            obj.userData.segment = 2;
        }
        } else if (obj.userData.segment === 2) {
        obj.position.x -= move;
        obj.rotation.y = Math.PI / 2 + tankHeadingOffset;
        if (obj.position.x <= minX) {
            obj.position.x = minX;
            obj.userData.segment = 3;
        }
        } else if (obj.userData.segment === 3) {
        obj.position.z -= move;
        obj.rotation.y = 0 + tankHeadingOffset;
        if (obj.position.z <= minZ) {
            obj.position.z = minZ;
            obj.userData.segment = 0;
        }
        }


      obj.position.y = y;
    }
  }

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}


  /*
  function render(time) {
    time *= 0.001;
   // for 20 rotating spheres 
    for (const obj of animatedObjects) {
        const i = obj.userData.orbitIndex;
        const count = obj.userData.orbitCount;
        const radius = obj.userData.orbitRadius;
        const height = obj.userData.orbitHeight;

        const angle = time + (i / count) * Math.PI * 2;

        obj.position.x = Math.cos(angle) * radius;
        obj.position.z = Math.sin(angle) * radius;
        obj.position.y = height;
    }
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }*/

  requestAnimationFrame(render);
}

main();