import * as THREE from 'three'
import { patchShaders } from "gl-noise";
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
  }`;

const fragmentShader = patchShaders(/* glsl */ `
  varying vec2 vUv;
  uniform float uThickness;
  uniform vec3 uColor;
  uniform float uProgress;
  void main() {
    gln_tFBMOpts opts = gln_tFBMOpts(1.0, 0.3, 2.0, 5.0, 1.0, 5, false, false);
    float noise = gln_sfbm(vUv, opts);
    noise = gln_normalize(noise);
    float progress = uProgress;
    float alpha = step(1.0 - progress, noise);
    float border = step((1.0 - progress) - uThickness, noise) - alpha;
    csm_DiffuseColor.a = alpha + border;
    csm_DiffuseColor.rgb = mix(csm_DiffuseColor.rgb, uColor, border);
    csm_Emissive.rgb = mix(vec3(0,0,0), uColor, border);
  }`);

class Fading {
  constructor(material) {
    this.uniforms = {
      uThickness: {value: 0.1},
      uColor: {value: new THREE.Color("#eb5a13").multiplyScalar(20)},
      //uColor: {value: new THREE.Color("#ffffff").multiplyScalar(20)},
      uProgress: {value: 0.5},
    };
    this.value = new CustomShaderMaterial({
      baseMaterial: material,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: this.uniforms,
      toneMapped: false,
      transparent: true,
    });
    this.value.side = THREE.DoubleSide;
    this.value.clearcoat = 0.1;
  }
  getValue() {
    return this.value;
  }
  setProgress(progress) {
    this.uniforms.uProgress.value = progress;
  }
  setColor(color) {
    this.uniforms.uColor.value = new THREE.Color(color).multiplyScalar(20);
  }
}

export { Fading }
