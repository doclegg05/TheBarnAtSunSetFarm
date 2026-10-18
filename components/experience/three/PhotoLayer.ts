import * as THREE from 'three';

/**
 * Redraws chosen page photos in WebGL so they can bend with their own
 * motion and ripple under the pointer. Each photo stays in the page as a
 * normal <img> (for layout, alt text and fallbacks); once its WebGL copy is
 * ready the <img> turns invisible and the copy is drawn exactly over it.
 */

const VERTEX = /* glsl */ `
  uniform vec2 uVelocity;
  uniform vec2 uSize;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    vec2 v = clamp(uVelocity, vec2(-60.0), vec2(60.0));
    // The middle of the photo trails its edges, like paper moving through air.
    p.x += sin(uv.y * 3.14159) * -v.x * 0.9 / uSize.x;
    p.y += sin(uv.x * 3.14159) * v.y * 0.9 / uSize.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  uniform sampler2D uTexture;
  uniform vec2 uSize;
  uniform vec2 uImage;
  uniform vec2 uMouse;
  uniform vec2 uVelocity;
  uniform float uHover;
  uniform float uTime;
  uniform float uRadius;
  uniform float uOpacity;
  uniform float uZoom;
  varying vec2 vUv;

  vec2 cover(vec2 uv, float zoom) {
    float planeAspect = uSize.x / uSize.y;
    float imageAspect = uImage.x / uImage.y;
    vec2 scale = planeAspect > imageAspect
      ? vec2(1.0, imageAspect / planeAspect)
      : vec2(planeAspect / imageAspect, 1.0);
    return (uv - 0.5) * scale / zoom + 0.5;
  }

  void main() {
    vec2 uv = vUv;
    vec2 offset = uv - uMouse;
    offset.x *= uSize.x / uSize.y;
    float dist = length(offset);
    float wave = sin(dist * 32.0 - uTime * 5.0) * 0.011 * uHover;
    uv += normalize(offset + 1e-5) * wave * smoothstep(0.55, 0.0, dist);

    vec2 shift = clamp(uVelocity, vec2(-60.0), vec2(60.0)) * 0.00025;
    float zoom = uZoom + uHover * 0.05;
    vec2 base = cover(uv, zoom);
    vec4 color = texture2D(uTexture, base);
    color.r = texture2D(uTexture, cover(uv + shift, zoom)).r;
    color.b = texture2D(uTexture, cover(uv - shift, zoom)).b;

    vec2 pixel = vUv * uSize;
    vec2 q = abs(pixel - uSize * 0.5) - (uSize * 0.5 - uRadius);
    float edge = length(max(q, 0.0)) - uRadius;
    float alpha = 1.0 - smoothstep(-1.0, 0.5, edge);

    gl_FragColor = vec4(color.rgb, alpha * uOpacity);
    #include <colorspace_fragment>
  }
`;

interface Item {
  element: HTMLElement;
  image: HTMLImageElement;
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial> | null;
  last: { x: number; y: number } | null;
  hover: number;
}

export class PhotoLayer {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);
  private readonly geometry = new THREE.PlaneGeometry(1, 1, 24, 24);
  private readonly items: Item[];
  private readonly timer = new THREE.Timer();
  private width = 1;
  private height = 1;
  private pointer = { x: -9999, y: -9999 };
  private drewLastFrame = false;

  constructor(canvas: HTMLCanvasElement, elements: HTMLElement[]) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setClearColor(0x000000, 0);
    this.items = elements.flatMap((element) => {
      const image = element.querySelector('img');
      return image
        ? [{ element, image, mesh: null, last: null, hover: 0 }]
        : [];
    });
    for (const item of this.items) this.prepare(item);
    this.resize();
  }

  private prepare(item: Item) {
    const build = () => {
      if (!item.image.naturalWidth) return;
      const texture = new THREE.Texture(item.image);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      texture.needsUpdate = true;
      const radius =
        parseFloat(getComputedStyle(item.element).borderTopLeftRadius) || 0;
      const zoom = item.element.dataset.glZoom
        ? Number(item.element.dataset.glZoom)
        : 1;
      const material = new THREE.ShaderMaterial({
        vertexShader: VERTEX,
        fragmentShader: FRAGMENT,
        transparent: true,
        depthTest: false,
        uniforms: {
          uTexture: { value: texture },
          uSize: { value: new THREE.Vector2(1, 1) },
          uImage: {
            value: new THREE.Vector2(
              item.image.naturalWidth,
              item.image.naturalHeight
            ),
          },
          uMouse: { value: new THREE.Vector2(0.5, 0.5) },
          uVelocity: { value: new THREE.Vector2() },
          uHover: { value: 0 },
          uTime: { value: 0 },
          uRadius: { value: radius },
          uOpacity: { value: 1 },
          uZoom: { value: zoom },
        },
      });
      item.mesh = new THREE.Mesh(this.geometry, material);
      item.mesh.visible = false;
      this.scene.add(item.mesh);
      item.image.style.opacity = '0';
    };
    if (item.image.complete) build();
    else item.image.addEventListener('load', build, { once: true });
  }

  setPointer(x: number, y: number) {
    this.pointer = { x, y };
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(this.width, this.height, false);
    this.camera.left = -this.width / 2;
    this.camera.right = this.width / 2;
    this.camera.top = this.height / 2;
    this.camera.bottom = -this.height / 2;
    this.camera.updateProjectionMatrix();
  }

  render() {
    this.timer.update();
    const time = this.timer.getElapsed();
    let anyVisible = false;
    for (const item of this.items) {
      const mesh = item.mesh;
      if (!mesh) continue;
      const box = item.element.getBoundingClientRect();
      const onScreen =
        box.bottom > -50 &&
        box.top < this.height + 50 &&
        box.right > -50 &&
        box.left < this.width + 50 &&
        box.width > 0;
      const style = item.element.style;
      const opacity =
        style.visibility === 'hidden' ? 0 : Number(style.opacity || 1);
      mesh.visible = onScreen && opacity > 0.01;
      if (!mesh.visible) {
        item.last = null;
        continue;
      }
      anyVisible = true;
      const uniforms = mesh.material.uniforms;
      const velocity = uniforms.uVelocity.value as THREE.Vector2;
      if (item.last) {
        velocity.x += (box.left - item.last.x - velocity.x) * 0.25;
        velocity.y += (box.top - item.last.y - velocity.y) * 0.25;
      }
      item.last = { x: box.left, y: box.top };

      const inside =
        this.pointer.x >= box.left &&
        this.pointer.x <= box.right &&
        this.pointer.y >= box.top &&
        this.pointer.y <= box.bottom;
      item.hover += ((inside ? 1 : 0) - item.hover) * 0.08;
      if (inside) {
        (uniforms.uMouse.value as THREE.Vector2).set(
          (this.pointer.x - box.left) / box.width,
          1 - (this.pointer.y - box.top) / box.height
        );
      }

      mesh.position.set(
        box.left + box.width / 2 - this.width / 2,
        this.height / 2 - (box.top + box.height / 2),
        0
      );
      mesh.scale.set(box.width, box.height, 1);
      (uniforms.uSize.value as THREE.Vector2).set(box.width, box.height);
      uniforms.uHover.value = item.hover;
      uniforms.uTime.value = time;
      uniforms.uOpacity.value = opacity;
    }
    if (anyVisible || this.drewLastFrame) {
      this.renderer.render(this.scene, this.camera);
    }
    this.drewLastFrame = anyVisible;
  }

  dispose() {
    for (const item of this.items) {
      item.image.style.opacity = '';
      if (item.mesh) {
        (item.mesh.material.uniforms.uTexture.value as THREE.Texture).dispose();
        item.mesh.material.dispose();
      }
    }
    this.geometry.dispose();
    this.renderer.dispose();
  }
}
