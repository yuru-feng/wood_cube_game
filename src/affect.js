import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

class Affect {
  #bloomComposer;
  #finalComposer;
  #window;

  constructor(scene, renderer, camera, window) {
    const params = {
        threshold: 0,
        strength: 0.1,
        radius: 0.5,
        exposure: 0.1
    };
    this.#window = window;
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight), 
        params.strength, params.radius, params.threshold);
    this.#bloomComposer = new EffectComposer(renderer);
    this.#bloomComposer.renderToScreen = false;
    this.#bloomComposer.addPass(renderScene);
    this.#bloomComposer.addPass(bloomPass);
    const mixPass = new ShaderPass(
      new THREE.ShaderMaterial({
        uniforms: {
          baseTexture: { value: null },
          bloomTexture: { value: this.#bloomComposer.renderTarget2.texture }
        },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
          }`,
        fragmentShader: /* glsl */`
          uniform sampler2D baseTexture;
          uniform sampler2D bloomTexture;
          varying vec2 vUv;
          void main() {
            gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );
          }`,
        defines: {}
      }), 'baseTexture'
    );
    mixPass.needsSwap = true;
    const outputPass = new OutputPass();
    this.#finalComposer = new EffectComposer(renderer);
    this.#finalComposer.addPass(renderScene);
    this.#finalComposer.addPass(mixPass);
    this.#finalComposer.addPass(outputPass);    
  }

  updateRenderer() {
    this.#bloomComposer.render();
    this.#finalComposer.render();
  }
  
  updateWindow() {
    const width = this.#window.innerWidth;
    const height = this.#window.innerHeight;
    this.#bloomComposer.setSize(width, height);
    this.#finalComposer.setSize(width, height);
  }
}

export { Affect }