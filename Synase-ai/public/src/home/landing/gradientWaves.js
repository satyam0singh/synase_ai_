// @ts-check
/**
 * React Bits Gradient Waves — WebGL2 Atmospheric Background
 * Reference: https://reactbits.dev/tools/background-studio?bg=gradient-waves
 * 
 * Implements hardware-accelerated raymarched sine waves rolling toward an atmospheric horizon.
 * Exclusively active on the public landing page with theme synchronization and full lifecycle cleanup.
 */

const vertexShaderSource = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShaderSource = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uAmplitude;
uniform float uWaveScale;
uniform float uWaveRatio;
uniform float uSwell;
uniform float uTurbulence;
uniform float uTilt;
uniform float uZoom;
uniform float uHeight;
uniform float uFogDepth;
uniform float uSteps;
uniform float uBrightness;
uniform float uOpacity;
uniform float uGrain;
uniform float uGrainIntensity;
uniform vec2 uMouse;
uniform float uParallax;
uniform bool uEnableMouse;
uniform vec3 uHorizonColor;
uniform vec3 uWaveColor;
uniform vec3 uCrestColor;
out vec4 fragColor;

const float MAX_DIST = 20000.0;

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float plasma(vec3 r, vec2 freq, vec4 tc) {
  float mx = r.x + tc.x;
  mx += uSwell * sin((r.y + mx) / 20.0 + tc.y);
  float my = r.y - tc.z;
  my += uTurbulence * cos(r.x / 23.0 + tc.w);
  return r.z - (sin(mx * freq.x) * uAmplitude + sin(my * freq.y) * uAmplitude + uHeight);
}

float raymarch(vec3 pos, vec3 dir, vec2 freq, vec4 tc) {
  float dist = 0.0;
  for (int i = 0; i < 90; i++) {
    if (float(i) >= uSteps) break;
    float dscene = plasma(pos + dist * dir, freq, tc);
    if (abs(dscene) < 0.1) break;
    dist += 0.9 * dscene;
    if (!(abs(dist) < MAX_DIST)) return MAX_DIST;
  }
  return dist;
}

void main() {
  float T = iTime * uSpeed;
  vec2 freq = vec2(uWaveScale / 7.0, (uWaveScale * uWaveRatio) / 3.0);
  vec4 tc = vec4(T / 0.130, T / 0.810, T / 0.200, T / 0.710);
  float c, s;
  float vfov = (3.14159 / 2.3) / max(uZoom, 0.05);
  vec3 cam = vec3(0.0, 0.0, 30.0);
  vec2 uv = (gl_FragCoord.xy / iResolution.xy) - 0.5;
  uv.x *= iResolution.x / iResolution.y;
  uv.y *= -1.0;

  vec3 dir = vec3(0.0, 0.0, -1.0);
  float ulen = length(uv);
  float xrot = vfov * ulen;
  c = cos(xrot); s = sin(xrot);
  dir = mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c) * dir;
  vec2 nuv = ulen > 1e-5 ? uv / ulen : vec2(1.0, 0.0);
  c = nuv.x; s = nuv.y;
  dir = mat3(c, -s, 0.0, s, c, 0.0, 0.0, 0.0, 1.0) * dir;
  c = cos(uTilt); s = sin(uTilt);
  dir = mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c) * dir;

  if (uEnableMouse) {
    float yaw = (uMouse.x - 0.5) * uParallax * 0.4;
    float pitch = (uMouse.y - 0.5) * uParallax * 0.4;
    c = cos(yaw); s = sin(yaw);
    dir = mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c) * dir;
    c = cos(pitch); s = sin(pitch);
    dir = mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c) * dir;
  }

  float dist = raymarch(cam, dir, freq, tc);
  vec3 pos = cam + dist * dir;

  float t = clamp(uFogDepth / max(dist, 0.001), 0.0, 1.0);
  vec3 body = mix(uWaveColor, uCrestColor, clamp(pos.z * 0.08 + 0.5, 0.0, 1.0));
  vec3 col = mix(uHorizonColor, body, t);
  col *= uBrightness;
  col = clamp(col, 0.0, 1.0);

  float alpha = clamp(t, 0.0, 1.0) * uOpacity;
  if (uGrain > 0.5) {
    float g = hash21(gl_FragCoord.xy + mod(iTime, 64.0) * 11.0);
    alpha += (g - 0.5) * uGrainIntensity;
  }
  alpha = clamp(alpha, 0.0, 1.0);
  fragColor = vec4(col * alpha, alpha);
}
`;

/**
 * @param {string} hex
 * @returns {[number, number, number]}
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [1, 1, 1];
  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255
  ];
}

/**
 * Initializes the Gradient Waves effect inside a container.
 * @param {HTMLElement} container
 * @param {Object} [options]
 * @returns {{ destroy: () => void, updateTheme: (theme: string) => void }}
 */
export function initGradientWaves(container, options = {}) {
  if (!container || typeof window === 'undefined') {
    return { destroy: () => {}, updateTheme: () => {} };
  }

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  if (reducedMotion) {
    container.classList.add('gradient-waves-static');
    return { destroy: () => {}, updateTheme: () => {} };
  }

  const canvas = document.createElement('canvas');
  canvas.className = 'gradient-waves-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  container.appendChild(canvas);

  /** @type {WebGL2RenderingContext|null} */
  const gl = canvas.getContext('webgl2', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    powerPreference: 'high-performance'
  });

  if (!gl) {
    // Graceful fallback for environments without WebGL2
    container.classList.add('gradient-waves-fallback');
    return {
      destroy: () => {
        canvas.remove();
      },
      updateTheme: () => {}
    };
  }

  // Shader compilation helper
  function createShader(type, source) {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn('GradientWaves Shader Error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

  if (!vertexShader || !fragmentShader) {
    container.classList.add('gradient-waves-fallback');
    return { destroy: () => { canvas.remove(); }, updateTheme: () => {} };
  }

  const program = gl.createProgram();
  if (!program) return { destroy: () => { canvas.remove(); }, updateTheme: () => {} };

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn('GradientWaves Program Error:', gl.getProgramInfoLog(program));
    return { destroy: () => { canvas.remove(); }, updateTheme: () => {} };
  }

  gl.useProgram(program);

  // Full-screen triangle covering the viewport
  const positions = new Float32Array([
    -1.0, -1.0,
     3.0, -1.0,
    -1.0,  3.0
  ]);

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  const positionLoc = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(positionLoc);
  gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

  // Uniform locations cache
  const uniforms = {
    iResolution: gl.getUniformLocation(program, 'iResolution'),
    iTime: gl.getUniformLocation(program, 'iTime'),
    uSpeed: gl.getUniformLocation(program, 'uSpeed'),
    uAmplitude: gl.getUniformLocation(program, 'uAmplitude'),
    uWaveScale: gl.getUniformLocation(program, 'uWaveScale'),
    uWaveRatio: gl.getUniformLocation(program, 'uWaveRatio'),
    uSwell: gl.getUniformLocation(program, 'uSwell'),
    uTurbulence: gl.getUniformLocation(program, 'uTurbulence'),
    uTilt: gl.getUniformLocation(program, 'uTilt'),
    uZoom: gl.getUniformLocation(program, 'uZoom'),
    uHeight: gl.getUniformLocation(program, 'uHeight'),
    uFogDepth: gl.getUniformLocation(program, 'uFogDepth'),
    uSteps: gl.getUniformLocation(program, 'uSteps'),
    uBrightness: gl.getUniformLocation(program, 'uBrightness'),
    uOpacity: gl.getUniformLocation(program, 'uOpacity'),
    uGrain: gl.getUniformLocation(program, 'uGrain'),
    uGrainIntensity: gl.getUniformLocation(program, 'uGrainIntensity'),
    uMouse: gl.getUniformLocation(program, 'uMouse'),
    uParallax: gl.getUniformLocation(program, 'uParallax'),
    uEnableMouse: gl.getUniformLocation(program, 'uEnableMouse'),
    uHorizonColor: gl.getUniformLocation(program, 'uHorizonColor'),
    uWaveColor: gl.getUniformLocation(program, 'uWaveColor'),
    uCrestColor: gl.getUniformLocation(program, 'uCrestColor')
  };

  // Base parameters matching React Bits reference
  gl.uniform1f(uniforms.uSpeed, options.speed ?? 0.38);
  gl.uniform1f(uniforms.uAmplitude, options.amplitude ?? 2.4);
  gl.uniform1f(uniforms.uWaveScale, options.waveScale ?? 0.6);
  gl.uniform1f(uniforms.uWaveRatio, options.waveRatio ?? 0.9);
  gl.uniform1f(uniforms.uSwell, options.swell ?? 32.0);
  gl.uniform1f(uniforms.uTurbulence, options.turbulence ?? 18.0);
  gl.uniform1f(uniforms.uTilt, options.tilt ?? 1.11);
  gl.uniform1f(uniforms.uZoom, options.zoom ?? 1.0);
  gl.uniform1f(uniforms.uHeight, options.height ?? 5.5);
  gl.uniform1f(uniforms.uFogDepth, options.fogDepth ?? 15.0);
  gl.uniform1f(uniforms.uSteps, 64.0); // optimized raymarch steps
  gl.uniform1f(uniforms.uGrain, 1.0);
  gl.uniform1f(uniforms.uGrainIntensity, 0.04);
  gl.uniform1f(uniforms.uParallax, 0.45);
  gl.uniform1i(uniforms.uEnableMouse, 1);

  /**
   * Applies palette depending on current theme.
   * @param {string} theme
   */
  function applyThemeColors(theme) {
    const isDark = theme === 'dark' || document.documentElement.getAttribute('data-theme') === 'dark';

    if (isDark) {
      // Dark palette: deep violet-indigo horizon, electric violet waves, dark obsidian crests
      const h = hexToRgb(options.darkHorizonColor || '#140f2e');
      const w = hexToRgb(options.darkWaveColor || '#5b21b8');
      const c = hexToRgb(options.darkCrestColor || '#12131a');
      gl.uniform3f(uniforms.uHorizonColor, h[0], h[1], h[2]);
      gl.uniform3f(uniforms.uWaveColor, w[0], w[1], w[2]);
      gl.uniform3f(uniforms.uCrestColor, c[0], c[1], c[2]);
      gl.uniform1f(uniforms.uBrightness, 0.82);
      gl.uniform1f(uniforms.uOpacity, 0.52);
    } else {
      // Light palette: soft lavender-blue horizon, delicate mauve/violet waves, crisp off-white crests
      const h = hexToRgb(options.lightHorizonColor || '#dce0fa');
      const w = hexToRgb(options.lightWaveColor || '#c7aee0');
      const c = hexToRgb(options.lightCrestColor || '#f5f7ff');
      gl.uniform3f(uniforms.uHorizonColor, h[0], h[1], h[2]);
      gl.uniform3f(uniforms.uWaveColor, w[0], w[1], w[2]);
      gl.uniform3f(uniforms.uCrestColor, c[0], c[1], c[2]);
      gl.uniform1f(uniforms.uBrightness, 0.96);
      gl.uniform1f(uniforms.uOpacity, 0.58);
    }
  }

  applyThemeColors(document.documentElement.getAttribute('data-theme') || 'dark');

  // Sizing
  function resize() {
    const rect = container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5); // cap dpr for fluid 60fps
    const width = Math.max(1, Math.floor(rect.width * dpr));
    const height = Math.max(1, Math.floor(rect.height * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
      gl.uniform2f(uniforms.iResolution, width, height);
    }
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();

  // Pointer tracking
  let mouseX = 0.5;
  let mouseY = 0.5;
  let targetMouseX = 0.5;
  let targetMouseY = 0.5;

  function onPointerMove(e) {
    const rect = container.getBoundingClientRect();
    targetMouseX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    targetMouseY = Math.max(0, Math.min(1, 1.0 - (e.clientY - rect.top) / rect.height));
  }

  function onPointerLeave() {
    targetMouseX = 0.5;
    targetMouseY = 0.5;
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  container.addEventListener('pointerleave', onPointerLeave, { passive: true });

  // Theme mutation observer to update colors instantaneously without context loss
  const themeObserver = new MutationObserver(() => {
    applyThemeColors(document.documentElement.getAttribute('data-theme') || 'dark');
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });

  // Animation Loop with Visibility and Intersection detection
  let raf = 0;
  let isIntersecting = true;
  let isDocumentVisible = !document.hidden;
  const startTime = performance.now();

  function render(time) {
    const elapsed = (time - startTime) * 0.001;
    gl.uniform1f(uniforms.iTime, elapsed);

    // Smooth mouse interpolation
    mouseX += 0.04 * (targetMouseX - mouseX);
    mouseY += 0.04 * (targetMouseY - mouseY);
    gl.uniform2f(uniforms.uMouse, mouseX, mouseY);

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    if (isIntersecting && isDocumentVisible) {
      raf = requestAnimationFrame(render);
    } else {
      raf = 0;
    }
  }

  function tryStart() {
    if (isIntersecting && isDocumentVisible && raf === 0) {
      raf = requestAnimationFrame(render);
    }
  }

  function tryStop() {
    if (raf !== 0) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }

  const intersectionObserver = new IntersectionObserver(([entry]) => {
    isIntersecting = entry.isIntersecting;
    if (isIntersecting) tryStart();
    else tryStop();
  }, { threshold: 0 });
  intersectionObserver.observe(container);

  function onVisibilityChange() {
    isDocumentVisible = !document.hidden;
    if (isDocumentVisible) tryStart();
    else tryStop();
  }
  document.addEventListener('visibilitychange', onVisibilityChange);

  tryStart();

  return {
    destroy: () => {
      tryStop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      themeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerleave', onPointerLeave);

      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      canvas.remove();
    },
    updateTheme: (theme) => applyThemeColors(theme)
  };
}
