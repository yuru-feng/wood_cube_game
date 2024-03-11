import * as THREE from 'three';
import basecolorUrl from '../resources/metal/basecolor.jpg';
import ambientOcclusionUrl from '../resources/metal/ambientOcclusion.jpg';
import heightUrl from '../resources/metal/height.png';
import normalUrl from '../resources/metal/normal.jpg';
import roughnessUrl from '../resources/metal/roughness.jpg';
import metallicUrl from '../resources/metal/metallic.jpg';

class Ice {
  #positionArr;
  #objectArr;
  constructor(scene) {
    this.scene = scene;
  }

  async load() {
    const loader = new THREE.TextureLoader();
    const [baseColorTexture, aoTexture, heightTexture, normalTexture, roughnessTexture, metalTexture] = 
      await Promise.all([
        loader.loadAsync(basecolorUrl),
	      loader.loadAsync(ambientOcclusionUrl),
        loader.loadAsync(heightUrl),
	      loader.loadAsync(normalUrl),
	      loader.loadAsync(roughnessUrl),
        loader.loadAsync(metallicUrl)
    ]);  
    baseColorTexture.colorSpace = THREE.SRGBColorSpace;
    aoTexture.colorSpace = THREE.SRGBColorSpace;
    heightTexture.colorSpace = THREE.SRGBColorSpace;
    normalTexture.colorSpace = THREE.SRGBColorSpace;
    roughnessTexture.colorSpace = THREE.SRGBColorSpace;
    metalTexture.colorSpace = THREE.SRGBColorSpace;
    const geo = new THREE.BoxGeometry(2.0, 2.0, 2.0);
    const mat = new THREE.MeshStandardMaterial();
    mat.metalness = 0;
    mat.roughness = 1;
    mat.map = baseColorTexture;
    mat.aoMap = aoTexture;
    mat.aoMapIntensity = 1;
    mat.displacementMap = heightTexture;
    mat.displacementScale = 0.05;
    mat.roughnessMap = roughnessTexture;
    mat.normalMap = normalTexture;
    mat.metalnessMap = metalTexture;
    mat.normalScale.set(0.5, 0.5);
    this.material = mat;
    this.geometry = geo;
  }

  add(x, y) {
    const mesh = new THREE.Mesh(this.geometry.clone(), this.material.clone());
    this.scene.add(mesh);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    const scale = 2.0;
    mesh.position.set(x * scale, -1.5 * scale, -y * scale);
  }
}

export { Ice }