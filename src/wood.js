import * as THREE from 'three';
import { Fading } from './fading.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { TTFLoader } from 'three/addons/loaders/TTFLoader.js';
import { Font } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import fontUrl from '../resources/FiraCode-Bold.ttf';
import modelUrl from '../resources/wood_d0.glb';

const eulerToQuaterion = (cur) => new THREE.Quaternion()
  .setFromEuler(new THREE.Euler(...cur.map((x) => x * Math.PI / 2.0), "XYZ"));
const spin = [[0, 0, 0], [0, 1, 0], [0, 2, 0], [0, 3, 0]] // WASD
  .map((cur) => eulerToQuaterion(cur));
const action = [[-1, 0, 0], [0, 0, 1], [1, 0, 0], [0, 0, -1]] // WASD
  .map((cur) => eulerToQuaterion(cur));
const rotation = [[0, 0, 0], /* up */    [0, 0, 2], /* down */
                  [0, 0, 1], /* left */  [0, 0, 3], /* right */
                  [1, 0, 0], /* front */ [3, 0, 0]] /* back */
  .map((cur) => eulerToQuaterion(cur));
// spin x rotation = orientation
const orientation = rotation.map((curRot) => spin.map((curSpin) => curRot.clone().multiply(curSpin)));
// orientation x action = actionMap
const actionMap = orientation.map((curRow) => curRow.map((curOrient) => action.map((curAct) => { 
  const curInvert = curAct.clone().multiply(curOrient).conjugate();
  const idle = new THREE.Quaternion();
  for (let i = 0; i < orientation.length; i++) {
      for (let j = 0; j < orientation[i].length; j++) {
        const compare = orientation[i][j].clone().multiply(curInvert).toArray();
        const dtp = idle.clone().toArray().reduce((acc, cur, index) => acc + Math.abs(compare[index] + cur), 0.0);
        const dtm = idle.clone().toArray().reduce((acc, cur, index) => acc + Math.abs(compare[index] - cur), 0.0);
        if (dtp < 1e-8 || dtm < 1e-8) return [i, j];
      }
    }
    return [-1, -1];
  })));

const actionEdge = [
  [[0, -2, -1], [-1, -2, 0], [0, -2, 1], [1, -2, 0]], // up-down
  [[0, -2, -1], [-1, -2, 0], [0, -2, 1], [1, -2, 0]], // up-down
  [[0, -1, -1], [-2, -1, 0], [0, -1, 1], [2, -1, 0]], // left-right
  [[0, -1, -1], [-2, -1, 0], [0, -1, 1], [2, -1, 0]], // left-right
  [[0, -1, -2], [-1, -1, 0], [0, -1, 2], [1, -1, 0]], // front-back
  [[0, -1, -2], [-1, -1, 0], [0, -1, 2], [1, -1, 0]], // front-back
].map((curRot) => curRot.map((cur) => new THREE.Vector3(...cur)));

const actionDir = [
  [[0, -1, -3], [-3, -1, 0], [0, -1, 3], [3, -1, 0]], // up-down
  [[0, -1, -3], [-3, -1, 0], [0, -1, 3], [3, -1, 0]], // up-down
  [[0,  0, -2], [-3,  1, 0], [0,  0, 2], [3,  1, 0]], // left-right
  [[0,  0, -2], [-3,  1, 0], [0,  0, 2], [3,  1, 0]], // left-right
  [[0,  1, -3], [-2,  0, 0], [0,  1, 3], [2,  0, 0]], // front-back
  [[0,  1, -3], [-2,  0, 0], [0,  1, 3], [2,  0, 0]], // front-back
].map((curRot) => curRot.map((cur) => new THREE.Vector3(...cur)));

const yellow = '#eb5a13';
const blue = '#87cefa';

class Wood {
  constructor(scene, window, map) {
    this.scene = scene;
    this.window = window;
    const scale = 2.0;
    this.phantom = new THREE.Object3D();
    scene.add(this.phantom);
    this.mixer = new THREE.AnimationMixer(this.phantom);
    this.actionClip = [...Array(4).keys()].map((x) => {
      const timeInterval = 0.2;
      const initKF = new THREE.Quaternion();
      const quaternionKF = new THREE.QuaternionKeyframeTrack(
        ".quaternion", [0.0, timeInterval], 
        [...initKF.toArray(), ...action[x].toArray()]
      );
      const clip = new THREE.AnimationClip("rotation_" + x, -1, [quaternionKF]).optimize();  
      const curAction = this.mixer.clipAction(clip);
      curAction.setLoop(THREE.LoopOnce);
      curAction.clampWhenFinished = true;
      return curAction;
    });
    this.curRotation = 0;
    this.curSpin = 0;
    this.isAnimPlaying = false;
    this.edge = actionEdge.map((row) => row.map((cur) => cur.multiplyScalar(scale / 2.0)));
    this.dir = actionDir.map((row) => row.map((cur) => cur.multiplyScalar(scale / 2.0)));
    this.map = map;
    this.isWin = false;
    this.curFadingTime = 0;
    this.isCurFading = false;
  }

  async loadText() {
    const fontLoader = new TTFLoader();
    const fontFira = await fontLoader.loadAsync(fontUrl);
    const textGeo = new TextGeometry("YOU WIN", {
      font: new Font(fontFira),
      size: 2,
      height: 0.5,
      curveSegments: 0.04,
      bevelThickness: 0.02,
      bevelSize: 0.015,
      bevelEnabled: true
    });
    textGeo.computeBoundingBox();
    const materials = new THREE.MeshStandardMaterial({
      color: 0xFFD700,
      metalness: 1.0,
      roughness: 0.2
    });
    this.textMesh = new THREE.Mesh(textGeo, materials);
    this.scene.add(this.textMesh);
    
    console.log(textGeo.boundingBox);

    const centerOffset = - 0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );  
    this.textMesh.position.x = centerOffset + 15.0;
    this.textMesh.position.y = 1.0;
    this.textMesh.position.z = -3.0;
  
    this.textMesh.quaternion.copy(orientation[2][1]);
    this.textMesh.visible = false;
  }

  async start() {
    const loader = new GLTFLoader();
    const woodScene = await loader.loadAsync(modelUrl);
    this.cube = woodScene.scene.children[0];
    this.cube.castShadow = true;
    // this.cube.receiveShadow = true;
    this.startCube = this.cube.clone();
    this.startCube.visible = true;
  
    this.fading = new Fading(this.cube.material);
    this.startFading = new Fading(this.startCube.material);
  
    this.cube.material = this.fading.getValue();
    this.startCube.material = this.startFading.getValue();

    this.fadingProgress = 0.0;
    this.curFadingTime = 0.0;
    this.fading.setProgress(1.0 - this.fadingProgress);
    this.startFading.setProgress(this.fadingProgress);
    
    this.fading.setColor(yellow);
    this.startFading.setColor(blue);

    this.cube.position.set(0, 0, 0);
    this.startCube.position.set(4, 4, 4);

    this.phantom.add(this.cube);
    this.scene.add(this.startCube);

    this.#setToStart();

    this.window.addEventListener('keydown', (event) => {
      let c = event.key.toLowerCase();
      if (this.isWin) {
        return;
      }
      switch (c) {
        case 'w': this.#addAction(1); break;
        case 'a': this.#addAction(2); break;
        case 's': this.#addAction(3); break;
        case 'd': this.#addAction(0); break;
        default: break;
      }
    }); 
  
    this.mixer.addEventListener("finished", (event) => {
      const name = event.action.getClip().name;
      switch(name) {
        case "rotation_0":this.#delAction(0);break;
        case "rotation_1":this.#delAction(1);break;
        case "rotation_2":this.#delAction(2);break;
        case "rotation_3":this.#delAction(3);break;
        default:break;
      }
    });

    await this.loadText();
  }

  #getMapPos(rota, p) {
    const s = 2.0;
    const pos = [];
    switch(rota) {
      case 0:
      case 1: pos.push([Math.round(p.x / s), Math.round(-p.z / s)]); 
              break;
      case 2:
      case 3: pos.push([Math.round(p.x / s + 0.5), Math.round(-p.z / s)]);
              pos.push([Math.round(p.x / s - 0.5), Math.round(-p.z / s)]);
              break;
      case 4:
      case 5: pos.push([Math.round(p.x / s), Math.round(-p.z / s + 0.5)]);
              pos.push([Math.round(p.x / s), Math.round(-p.z / s - 0.5)]);
              break;
      default:
    }
    if (pos.length == 1 && this.map.isWin(pos[0][0], pos[0][1])) {
      return 1; // 赢了
    }
    for (let i = 0; i < pos.length; i++) {
      if (this.map.isLava(pos[i][0], pos[i][1])) {
        return 2; // 着了
      }
      if (this.map.isWin(pos[i][0], pos[i][1])) {
        return 3; // 不让动
      }
    }
    return 0; // 没问题
  }

  #setToStart() {
    const st = this.map.getStart();
    let rota = 0;
    let spin = 0;
    let position = [0.0, 0.0, 0.0];
    if (st.length == 1) {
      // up-down 
      rota = 0;
      position[0] = st[0];
      position[1] = 0.0;
      position[2] = -st[1];
    } else if (st[0][0] == st[1][0]) {
      // front-back
      rota = 4;
      position[0] = st[0][0];
      position[1] = -0.5;
      position[2] = -(st[0][1] + st[1][1]) / 2.0;
    } else {
      // left-right
      rota = 2;
      position[0] = (st[0][0] + st[1][0]) / 2.0;
      position[1] = -0.5;
      position[2] = -st[0][1];
    }
    const vPos = new THREE.Vector3(...position);
    const scale = 2.0;
    vPos.multiplyScalar(scale);
    this.cube.quaternion.copy(orientation[rota][spin]);
    this.startCube.quaternion.copy(orientation[rota][spin]);
    this.phantom.position.copy(vPos);
    this.startCube.position.copy(vPos);
    this.#setFadingProgress(0.0);
    this.curRotation = rota;
    this.curSpin = spin;
    this.#getMapPos(this.curRotation, this.phantom.position);
  }

  #setFadingProgress(t) {
    this.fadingProgress = t;
    this.fading.setProgress(1.0 - this.fadingProgress);
    this.startFading.setProgress(this.fadingProgress);
  }

  #updateFading(delta) {
    if (!this.isCurFading) {
      return;
    }
    this.curFadingTime += delta;
    const maxTime = 0.8;
    if (this.curFadingTime > maxTime) {
      this.#setToStart();
      this.isAnimPlaying = false;
      this.isCurFading = false;
      return;
    }
    this.#setFadingProgress(this.curFadingTime / maxTime);
  }

  update(delta) {
    if (!this.hasOwnProperty('mixer')) {
      return;
    }
    this.mixer.update(delta);
    this.#updateFading(delta);
  }

  #addActionTest(actionType) {
    const preRota = this.curRotation;
    const preSpin = this.curSpin;
    const dPos = this.dir[preRota][actionType];
    const p = this.phantom.position.clone().add(dPos);
    const [rota, _] = actionMap[preRota][preSpin][actionType];
    let t = this.#getMapPos(rota, p);
    console.log(t);
    return t != 3; // 不让动的情况不播放动画
  }

  #addAction(actionType) {
    if (this.isAnimPlaying) {
      return;
    }
    if (!this.#addActionTest(actionType)) {
      return;
    }
    this.isAnimPlaying = true;
    
    let rota = this.curRotation;
    // 调整相对位置，将旋转点锚定在木块边界
    this.phantom.position.add(this.edge[rota][actionType]);
    this.cube.position.sub(this.edge[rota][actionType]);
    // 播放旋转动画
    this.actionClip[actionType].play();
  }

  #winAction() {
    const timeInterval = 0.2;
    const initKF = this.phantom.position.clone();
    const finalKF = initKF.clone();
    finalKF.y -= 4.0;
    const quaternionKF = new THREE.VectorKeyframeTrack(
      ".position", [0.0, timeInterval], 
      [...initKF.toArray(), ...finalKF.toArray()]
    );
    const clip = new THREE.AnimationClip("win", 3, [quaternionKF]);  
    const curAction = this.mixer.clipAction(clip);
    curAction.setLoop(THREE.LoopOnce);
    curAction.clampWhenFinished = true;
    curAction.play();
    this.textMesh.visible = true;
  }

  #delAction(actionType) {
    let rota = this.curRotation;
    let spin = this.curSpin;
    this.actionClip[actionType].stop();
    // 撤回相对调整，将旋转点撤回木块中心
    this.phantom.position.sub(this.edge[rota][actionType]);
    this.cube.position.add(this.edge[rota][actionType]);
    // 动作完成之后平移木块中心位置
    this.phantom.position.add(this.dir[rota][actionType]);
    // 动作完成之后调整木块的方位角与旋转角
    [rota, spin] = actionMap[rota][spin][actionType];
    this.cube.quaternion.copy(orientation[rota][spin]);
    this.curRotation = rota;
    this.curSpin = spin;
    // 标记动画结束
    let t = this.#getMapPos(rota, this.phantom.position);
    if (t == 0) {
      this.isAnimPlaying = false; // 正常处理，结束动画
    } else if (t == 1) {
      console.log("win!");
      this.isWin = true;  // 胜利
      this.isAnimPlaying = false; // 结束动画
      this.#winAction();
    } else {
      // 进入燃烧动画
      this.curFadingTime = 0;
      this.isCurFading = true;
    }
  }
}

export { Wood }