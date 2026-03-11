import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


// helpers 
function loadModel(scene, path, position, scale = 1, rotationY = 0) {
  const loader = new GLTFLoader();

  loader.load(
    path,
    (gltf) => {
      const model = gltf.scene;

      model.position.set(position.x, position.y, position.z);
      model.scale.set(scale, scale, scale);
      model.rotation.y = rotationY;

      scene.add(model);
    },
    undefined,
    (error) => {
      console.error(`Error loading model: ${path}`, error);
    }
  );
}

function loadAnimatedTank(scene, animatedObjects) {
  const loader = new GLTFLoader();

  loader.load(
    './src/models/Tank.glb',
    (gltf) => {
      const tank = gltf.scene;

      tank.position.set(-22, 0, -22);
      tank.scale.set(0.25, 0.25, 0.25);

      tank.userData.kind = 'tank';
      tank.userData.pathMinX = -22;
      tank.userData.pathMaxX = 22;
      tank.userData.pathMinZ = -22;
      tank.userData.pathMaxZ = 22;
      tank.userData.speed = 4;
      tank.userData.segment = 0;
      tank.userData.y = 0;

      scene.add(tank);
      animatedObjects.push(tank);
    },
    undefined,
    (error) => {
      console.error('Error loading tank:', error);
    }
  );
}

function makeBackroomsWallMaterial() {
  const loader = new THREE.TextureLoader();
  const texture = loader.load('./src/textures/backrooms.png');
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return new THREE.MeshPhongMaterial({ map: texture });
}

function addWall(scene, material, x, y, z, sx, sy, sz) {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const wall = new THREE.Mesh(geometry, material);

  wall.position.set(x, y, z);
  wall.scale.set(sx, sy, sz);

  // repeat texture based on wall size
  const map = material.map.clone();
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.colorSpace = THREE.SRGBColorSpace;
  map.repeat.set(Math.max(1, sx), Math.max(1, sy / 2));
  material = material.clone();
  material.map = map;
  wall.material = material;

  scene.add(wall);
  return wall;
}

function loadModelWithTexture(scene, modelPath, texturePath, position, scale = 1, rotationY = 0) {
  const texLoader = new THREE.TextureLoader();
  const gltfLoader = new GLTFLoader();

  const texture = texLoader.load('./src/textures/barrel.jpg');
  texture.colorSpace = THREE.SRGBColorSpace;

  gltfLoader.load(
    './src/models/WoodFloor2.glb',
    (gltf) => {
      const model = gltf.scene;

      model.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshPhongMaterial({
            map: texture,
          });
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      model.position.set(position.x, position.y, position.z);
      model.scale.set(scale, scale, scale);
      model.rotation.y = rotationY;

      scene.add(model);
    },
    undefined,
    (error) => {
      console.error('Error loading textured model:', error);
    }
  );
}


// main scene loaders 
export function all(scene) {
  const animatedObjects = [];
// big cube 
  {
    const cubeSize = 4;
    const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    const cubeMat = new THREE.MeshPhongMaterial({ color: '#8AC' });
    const mesh = new THREE.Mesh(cubeGeo, cubeMat);
    mesh.position.set(cubeSize + 1, cubeSize / 2, 0);
    scene.add(mesh);
  }
// big sphere 
  {
    const sphereRadius = 3;
    const sphereGeo = new THREE.SphereGeometry(sphereRadius, 32, 16);
    const sphereMat = new THREE.MeshPhongMaterial({ color: '#CA8' });
    const mesh = new THREE.Mesh(sphereGeo, sphereMat);
    mesh.position.set(-sphereRadius - 1, sphereRadius + 2, 6.8);
    scene.add(mesh);
  }
// dirt block 
  {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const loader = new THREE.TextureLoader();
    const texture = loader.load('./src/textures/dirt.jpg');
    texture.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.MeshPhongMaterial({
      map: texture,
    });

    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(3, 0.55, 8);
    scene.add(cube);
  }

// animated cylinder 
  {
    const radiusTop = 1;
    const radiusBottom = 1;
    const height = 3;
    const radialSegments = 32;

    const cylinderGeo = new THREE.CylinderGeometry(
      radiusTop,
      radiusBottom,
      height,
      radialSegments
    );

    const cylinderMat = new THREE.MeshPhongMaterial({
      color: 0x44aa88,
    });

    const cylinder = new THREE.Mesh(cylinderGeo, cylinderMat);
    cylinder.position.set(0, height / 2, 5);
    scene.add(cylinder);

    //animatedObjects.push(cylinder);
  }
  // 20 spheres 
  {
    const numSpheres = 20;
    const orbitRadius = 17;
    const orbitHeight = 11.2;

    for (let i = 0; i < numSpheres; i++) {
      const geo = new THREE.SphereGeometry(0.5, 32, 16);
      const mat = new THREE.MeshPhongMaterial({ color: 0xf26dea });
      const sphere = new THREE.Mesh(geo, mat);

      sphere.userData.kind = 'orbitSphere';
      sphere.userData.orbitIndex = i;
      sphere.userData.orbitCount = numSpheres;
      sphere.userData.orbitRadius = orbitRadius;
      sphere.userData.orbitHeight = orbitHeight;

      scene.add(sphere);
      animatedObjects.push(sphere);
    }
  }
  // model loaded with custom texture 
  loadModelWithTexture(
    scene,
    './src/models/WoodFloor2.glb',
    './src/textures/barrel.jpg',
    { x: -3, y: 0, z: 0 },
    1,
    1.2
  );

  // load more office objects 
  loadModel(scene, './src/models/BookShelf.glb', { x: 2.68, y: 0.1, z: 0.45 }, 1, -1.58);
  loadModel(scene, './src/models/Ladder.glb',    { x: -3, y: 0, z: -2 }, 1, Math.PI / 4);
  loadModel(scene, './src/models/lilbox.glb', { x: -6, y: 0, z: -6 }, 1, 0.3);
  loadModel(scene, './src/models/Box.glb', { x: -6, y: 0, z:  6 }, 1, 1.1);
  loadModel(scene, './src/models/lilbox.glb', { x:  6, y: 0, z: -6 }, 1, 2.0);
  loadModel(scene, './src/models/Box.glb', { x:  6, y: 0, z:  6 }, 1, -0.7);
  loadModel(scene, './src/models/Box.glb', { x:  0, y: 0, z: -7.5 }, 1, 1.7);
 
  //load the tank
  loadAnimatedTank(scene, animatedObjects);
 
 /*
  // trees around the map
  loadModel(scene, './src/models/Tree.glb',     { x: -14, y: 0, z: -14 }, 1.5,  0);
  loadModel(scene, './src/models/Tree.glb',     { x: -14, y: 0, z:  12 }, 1.5,  0.8);
  loadModel(scene, './src/models/Tree.glb',     { x:  14, y: 0, z:  14 }, 1.5, -0.6);
  loadModel(scene, './src/models/Tree.glb',     { x:  16, y: 0, z:  -2 }, 1.5,  1.2);

  loadModel(scene, './src/models/TreeLong.glb', { x:  -2, y: 0, z: -16 }, 1.5,  0.3);
  loadModel(scene, './src/models/TreeLong.glb', { x:  10, y: 0, z: -14 }, 1.5, -1.0);
  loadModel(scene, './src/models/TreeLong.glb', { x: -16, y: 0, z:   2 }, 1.5,  2.2);
  loadModel(scene, './src/models/TreeLong.glb', { x:   2, y: 0, z:  16 }, 1.5, -2.0);
*/
  {
  const wallMat = makeBackroomsWallMaterial();
  const wallHeight = 6;
  const y = wallHeight / 2;

  // Outer boundary with entrances/gaps
  addWall(scene, wallMat,  0, y, -18, 12, wallHeight, 0.5);
  addWall(scene, wallMat, -15, y, -18, 10, wallHeight, 0.5);
  addWall(scene, wallMat,  15, y, -18, 10, wallHeight, 0.5);

  addWall(scene, wallMat,  0, y,  18, 12, wallHeight, 0.5);
  addWall(scene, wallMat, -15, y,  18, 10, wallHeight, 0.5);
  addWall(scene, wallMat,  15, y,  18, 10, wallHeight, 0.5);

  addWall(scene, wallMat, -18, y,   0, 0.5, wallHeight, 12);
  addWall(scene, wallMat, -18, y, -15, 0.5, wallHeight, 10);
  addWall(scene, wallMat, -18, y,  15, 0.5, wallHeight, 10);

  addWall(scene, wallMat,  18, y,   0, 0.5, wallHeight, 12);
  addWall(scene, wallMat,  18, y, -15, 0.5, wallHeight, 10);
  addWall(scene, wallMat,  18, y,  15, 0.5, wallHeight, 10);

  // Central room edges, leaving several hallway openings
  addWall(scene, wallMat,  0, y, -10, 4, wallHeight, 0.5);
  addWall(scene, wallMat, -7, y, -10, 6, wallHeight, 0.5);
  addWall(scene, wallMat,  7, y, -10, 6, wallHeight, 0.5);

  addWall(scene, wallMat,  0, y,  10, 4, wallHeight, 0.5);
  addWall(scene, wallMat, -7, y,  10, 6, wallHeight, 0.5);
  addWall(scene, wallMat,  7, y,  10, 6, wallHeight, 0.5);

  addWall(scene, wallMat, -10, y,  0, 0.5, wallHeight, 4);
  addWall(scene, wallMat, -10, y, -7, 0.5, wallHeight, 6);
  addWall(scene, wallMat, -10, y,  7, 0.5, wallHeight, 6);

  addWall(scene, wallMat,  10, y,  0, 0.5, wallHeight, 4);
  addWall(scene, wallMat,  10, y, -7, 0.5, wallHeight, 6);
  addWall(scene, wallMat,  10, y,  7, 0.5, wallHeight, 6);

  // Maze corridors in outer ring
  addWall(scene, wallMat, -6, y, -14, 0.5, wallHeight, 8);
  addWall(scene, wallMat,  6, y, -14, 0.5, wallHeight, 8);

  addWall(scene, wallMat, -12, y, -6, 8, wallHeight, 0.5);
  addWall(scene, wallMat,  12, y, -6, 8, wallHeight, 0.5);

  addWall(scene, wallMat, -6, y,  14, 0.5, wallHeight, 8);
  addWall(scene, wallMat,  6, y,  14, 0.5, wallHeight, 8);

  addWall(scene, wallMat, -12, y,  6, 8, wallHeight, 0.5);
  addWall(scene, wallMat,  12, y,  6, 8, wallHeight, 0.5);

  // Extra turns / dead ends
  addWall(scene, wallMat, -14, y, -11, 0.5, wallHeight, 5);
  addWall(scene, wallMat,  14, y, -11, 0.5, wallHeight, 5);
  addWall(scene, wallMat, -14, y,  11, 0.5, wallHeight, 5);
  addWall(scene, wallMat,  14, y,  11, 0.5, wallHeight, 5);

  addWall(scene, wallMat, -9, y,  -3, 4, wallHeight, 0.5);
  addWall(scene, wallMat,  9, y,  -3, 4, wallHeight, 0.5);
  addWall(scene, wallMat, -9, y,   3, 4, wallHeight, 0.5);
  addWall(scene, wallMat,  9, y,   3, 4, wallHeight, 0.5);


  //outer wall 
  addWall(scene, wallMat,   0, y, -24, 48, wallHeight, 0.5);
  addWall(scene, wallMat,   0, y,  24, 48, wallHeight, 0.5);
  addWall(scene, wallMat, -24, y,   0, 0.5, wallHeight, 48);
  addWall(scene, wallMat,  24, y,   0, 0.5, wallHeight, 48);
}

  return animatedObjects;
}