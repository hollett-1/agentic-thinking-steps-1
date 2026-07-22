import React from 'react';
import { LoaderConfig, ProductIconType, ThemeMode, DetailItem } from '../types';
import ParticleText from './ParticleText';
import { AuroraParticleMesh } from './AuroraParticleMesh';
import { NeuralSheetMesh } from './NeuralSheetMesh';
import { ProductOrbitVortex } from './ProductOrbitVortex';

interface LoaderProps {
  config: LoaderConfig;
  mode: ThemeMode;
  replayKey?: number;
  onToggleExpand?: () => void;
}

interface ProcessingEnergyShaderProps {
  isInProgress: boolean;
  isDark: boolean;
  strokeLength?: number;
  strokePeak?: number;
  outerSize?: number;
  outerFeather?: number;
  innerFeather?: number;
  colorBias?: number;
  midColor?: string;
  endColor?: string;
  hoverColor?: string;
}

// WebGL Processing Energy Shader (derived from Zipline material energy shader)
const ProcessingEnergyShader: React.FC<ProcessingEnergyShaderProps> = (props) => {
  const { isInProgress, isDark } = props;
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const propsRef = React.useRef(props);
  propsRef.current = props;

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true });
    if (!gl) return;

    const vsSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision mediump float;
      uniform vec2 u_resolution;
      uniform vec2 u_hostHalfSize;
      uniform float u_time;
      uniform float u_active;
      uniform float u_strokeLength;
      uniform float u_strokePeak;
      uniform float u_outerSize;
      uniform float u_outerFeather;
      uniform float u_innerFeather;
      uniform float u_colorBias;
      uniform vec3 u_midColor;
      uniform vec3 u_endColor;
      uniform vec3 u_hoverColor;

      float sdRoundedBox(vec2 p, vec2 b, vec4 r) {
        r.xy = (p.x > 0.0) ? r.xy : r.zw;
        r.x  = (p.y > 0.0) ? r.x  : r.y;
        vec2 q = abs(p) - b + r.x;
        return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r.x;
      }

      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      void main() {
        vec2 st = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
        float radius = u_hostHalfSize.y * 1.0; 
        
        float d = sdRoundedBox(st, u_hostHalfSize, vec4(radius));
        
        // True Clockwise angle calculation around center
        float cwAngle = atan(-st.y, st.x) / 6.28318530718 + 0.5;
        
        float speed = u_time * 0.35;
        float head = fract(cwAngle - speed);
        
        float len = clamp(u_strokeLength, 0.1, 0.95);
        float peak = clamp(u_strokePeak, 0.05, 0.95) * len;
        float tail = smoothstep(0.0, peak, head) * smoothstep(len + 0.06, peak, head);
        
        float n = noise(vec2(cwAngle * 10.0 - speed * 2.0, u_time * 1.5)) * 0.25 + 0.75;
        tail *= n;
        
        float baseThickness = 0.006 + u_outerSize * 0.025;
        float outerF = 0.02 + u_outerFeather * 0.18;
        float innerF = 0.02 + u_innerFeather * 0.18;
        
        float edge = (d > 0.0) 
          ? smoothstep(baseThickness + outerF, 0.0, d)
          : smoothstep(-baseThickness - innerF, 0.0, d);
          
        float colorMix = fract(head * (1.0 + u_colorBias * 0.5) + n * 0.3);
        vec3 color = mix(u_midColor, u_endColor, smoothstep(0.0, 0.6, colorMix));
        color = mix(color, u_hoverColor, smoothstep(0.6, 1.0, colorMix));
        
        float alpha = edge * (tail * 1.6) * (0.4 + 0.6 * u_active);
        float clampedAlpha = clamp(alpha, 0.0, 1.0);
        
        // Exact premultiplied alpha output for clean, zero-grey, matte blending onto DOM
        gl_FragColor = vec4(color * clampedAlpha, clampedAlpha);
      }
    `;

    const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,  1, -1, -1,  1,
      -1,  1,  1, -1,  1,  1,
    ]), gl.STATIC_DRAW);

    const positionAttr = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionAttr);
    gl.vertexAttribPointer(positionAttr, 2, gl.FLOAT, false, 0, 0);

    const resLocation = gl.getUniformLocation(program, 'u_resolution');
    const hostHalfSizeLocation = gl.getUniformLocation(program, 'u_hostHalfSize');
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const activeLocation = gl.getUniformLocation(program, 'u_active');
    const strokeLengthLocation = gl.getUniformLocation(program, 'u_strokeLength');
    const strokePeakLocation = gl.getUniformLocation(program, 'u_strokePeak');
    const outerSizeLocation = gl.getUniformLocation(program, 'u_outerSize');
    const outerFeatherLocation = gl.getUniformLocation(program, 'u_outerFeather');
    const innerFeatherLocation = gl.getUniformLocation(program, 'u_innerFeather');
    const colorBiasLocation = gl.getUniformLocation(program, 'u_colorBias');
    const midColorLocation = gl.getUniformLocation(program, 'u_midColor');
    const endColorLocation = gl.getUniformLocation(program, 'u_endColor');
    const hoverColorLocation = gl.getUniformLocation(program, 'u_hoverColor');

    const hexToRgb = (hex?: string, fallback: [number, number, number] = [1, 1, 1]): [number, number, number] => {
      if (!hex) return fallback;
      const clean = hex.replace('#', '');
      if (clean.length !== 6) return fallback;
      const num = parseInt(clean, 16);
      if (isNaN(num)) return fallback;
      return [
        ((num >> 16) & 255) / 255,
        ((num >> 8) & 255) / 255,
        (num & 255) / 255,
      ];
    };

    let animationFrameId: number;
    let startTime = performance.now();

    const render = (now: number) => {
      const width = canvas.clientWidth || 88;
      const height = canvas.clientHeight || 80;
      if (canvas.width !== width * 2 || canvas.height !== height * 2) {
        canvas.width = width * 2;
        canvas.height = height * 2;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }

      const hostWidth = Math.max(1, width - 40);
      const hostHeight = Math.max(1, height - 40);
      const hostHalfWidthNorm = (hostWidth * 0.5) / height;
      const hostHalfHeightNorm = (hostHeight * 0.5) / height;

      const p = propsRef.current;
      const [midR, midG, midB] = hexToRgb(p.midColor, [0.643, 0.851, 1.000]);   // #a4d9ff
      const [endR, endG, endB] = hexToRgb(p.endColor, [0.525, 0.694, 1.000]);   // #86b1ff
      const [hovR, hovG, hovB] = hexToRgb(p.hoverColor, [0.659, 0.780, 0.980]); // #a8c7fa

      gl.uniform2f(resLocation, canvas.width, canvas.height);
      gl.uniform2f(hostHalfSizeLocation, hostHalfWidthNorm, hostHalfHeightNorm);
      gl.uniform1f(timeLocation, (now - startTime) * 0.001);
      gl.uniform1f(activeLocation, p.isInProgress ? 1.0 : 0.25);
      gl.uniform1f(strokeLengthLocation, p.strokeLength ?? 0.5);
      gl.uniform1f(strokePeakLocation, p.strokePeak ?? 0.5);
      gl.uniform1f(outerSizeLocation, p.outerSize ?? 0.57);
      gl.uniform1f(outerFeatherLocation, p.outerFeather ?? 0.5);
      gl.uniform1f(innerFeatherLocation, p.innerFeather ?? 0.5);
      gl.uniform1f(colorBiasLocation, p.colorBias ?? 1.0);
      gl.uniform3f(midColorLocation, midR, midG, midB);
      gl.uniform3f(endColorLocation, endR, endG, endB);
      gl.uniform3f(hoverColorLocation, hovR, hovG, hovB);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isInProgress, isDark]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute -inset-5 w-[calc(100%+40px)] h-[calc(100%+40px)] pointer-events-none" 
    />
  );
};

// 2026 Aurora Google Workspace Product Icons (from /dist/product-icons)
export const ProductIcon: React.FC<{ type: ProductIconType }> = ({ type }) => {
  switch (type) {
    case 'gmail':
      return (
        <svg viewBox="0 0 192 192" fill="none" className="w-full h-full">
          <path fill="url(#gmail_a)" d="M146 44h38v110c0 6.627-5.373 12-12 12h-20a6 6 0 0 1-6-6z"/>
          <path fill="#fc413d" d="M46 44H8v110c0 6.627 5.373 12 12 12h20a6 6 0 0 0 6-6z"/>
          <path fill="url(#gmail_b)" d="M39.226 30.456c-8.033-6.752-20.018-5.714-26.77 2.319-6.752 8.032-5.714 20.017 2.319 26.77l76.078 63.949a8 8 0 0 0 10.295 0l76.078-63.95c8.032-6.752 9.07-18.737 2.318-26.77-6.752-8.032-18.737-9.07-26.769-2.318L96 78.18z"/>
          <defs>
            <linearGradient id="gmail_a" x1="165" x2="165" y1="166" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#60d673"/><stop offset=".17" stopColor="#42c868"/><stop offset=".39" stopColor="#0ebc5f"/>
              <stop offset=".62" stopColor="#00a9bb"/><stop offset=".86" stopColor="#3c90ff"/><stop offset="1" stopColor="#3186ff"/>
            </linearGradient>
            <linearGradient id="gmail_b" x1="8" x2="184" y1="46.13" y2="46.13" gradientUnits="userSpaceOnUse">
              <stop offset=".08" stopColor="#ff63a0"/><stop offset=".3" stopColor="#fc413d"/><stop offset=".5" stopColor="#fc413d"/>
              <stop offset=".65" stopColor="#fc413d"/><stop offset=".72" stopColor="#fc5c30"/><stop offset=".86" stopColor="#feb10c"/>
              <stop offset=".91" stopColor="#fec700"/><stop offset=".96" stopColor="#ffdb0f"/>
            </linearGradient>
          </defs>
        </svg>
      );
    case 'docs':
      return (
        <svg viewBox="0 0 192 192" fill="none" className="w-full h-full">
          <mask id="docs_a" width="128" height="176" x="32" y="8" maskUnits="userSpaceOnUse" style={{ maskType: 'alpha' }}>
            <path fill="#3186ff" d="M130.33 184H61.6c-8.94 0-13.42 0-16.96-1.4a20 20 0 0 1-11.24-11.24c-1.4-3.55-1.4-8.02-1.4-16.96V37.6c0-8.94 0-13.42 1.4-16.96A20 20 0 0 1 44.64 9.4C48.18 8 52.66 8 61.6 8H100l54.8 54.8c1.65 1.65 2.48 2.48 3.12 3.42a12 12 0 0 1 1.87 4.5c.2 1.12.2 2.3.2 4.68-.03 48.92-.05 49.4-.05 78.97 0 8.96 0 13.45-1.4 17a20 20 0 0 1-11.24 11.23c-3.55 1.4-8.02 1.4-16.97 1.4"/>
          </mask>
          <g mask="url(#docs_a)">
            <path fill="#3186ff" d="M159.94 184H32V8h68l60 60z"/>
            <path fill="url(#docs_c)" d="M43 192h106V20H43z"/>
          </g>
          <path fill="#76bbff" d="M155 63c-2.51-1.89-5.62-3-9-3h-33.2A12.8 12.8 0 0 1 100 47.2V8z"/>
          <rect width="64" height="12" x="64" y="114" fill="#fff" rx="6"/>
          <rect width="48" height="12" x="64" y="143" fill="#fff" rx="6"/>
          <defs>
            <linearGradient id="docs_c" x1="96" x2="54.61" y1="59.28" y2="171.34" gradientUnits="userSpaceOnUse">
              <stop offset=".33" stopColor="#3186ff"/><stop offset="1" stopColor="#a9a8ff"/>
            </linearGradient>
          </defs>
        </svg>
      );
    case 'sheets':
      return (
        <svg viewBox="0 0 192 192" fill="none" className="w-full h-full">
          <path fill="#009954" d="M8 74.6c0-8.943 0-13.415 1.404-16.962a20 20 0 0 1 11.234-11.233C24.185 45 28.656 45 37.6 45h60.8c8.943 0 13.415 0 16.962 1.404a20 20 0 0 1 11.234 11.234C128 61.185 128 65.656 128 74.6v42.8c0 8.943 0 13.415-1.404 16.962a20 20 0 0 1-11.234 11.234C111.815 147 107.343 147 98.4 147H37.6c-8.943 0-13.415 0-16.963-1.404a20 20 0 0 1-11.233-11.234C8 130.815 8 126.343 8 117.4z"/>
          <mask id="sheets_a" width="160" height="128" x="24" y="32" maskUnits="userSpaceOnUse" style={{ maskType: 'alpha' }}>
            <rect width="160" height="128" x="24" y="32" fill="#0ebc5f" rx="20"/>
          </mask>
          <g mask="url(#sheets_a)">
            <path fill="#0ebc5f" d="M24 32h160v128H24z"/>
            <rect width="144" height="102" fill="url(#sheets_c)" rx="25.6" transform="matrix(1 0 0 -1 8 147)"/>
          </g>
          <path stroke="#fff" strokeLinecap="round" strokeWidth="12" d="M80 121h84m-20 19V76"/>
          <defs>
            <linearGradient id="sheets_c" x1="122.24" x2="20.76" y1="43.31" y2="43.31" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0ebc5f"/><stop offset=".95" stopColor="#78c9ff"/>
            </linearGradient>
          </defs>
        </svg>
      );
    case 'drive':
      return (
        <svg viewBox="0 0 192 192" fill="none" className="w-full h-full">
          <mask id="drive_a" width="168" height="154" x="12" y="18" maskUnits="userSpaceOnUse" style={{ maskType: 'alpha' }}>
            <path fill="#b43333" d="M63.09 37c14.626-25.333 51.193-25.334 65.819 0l45.033 78c14.626 25.334-3.657 57.001-32.91 57.001H50.967c-29.253 0-47.536-31.667-32.91-57.001z"/>
          </mask>
          <g mask="url(#drive_a)">
            <path fill="url(#drive_b)" d="M206.905 172.02h-91.888l-19.015-32.934 45.944-79.578z"/>
            <path fill="url(#drive_c)" d="M-14.919 172.006 50.04 59.494v.002L31.032 92.422h38.02L115 172.004l-129.918.001z"/>
            <path fill="url(#drive_d)" d="M96.007-20.085 141.954 59.5l-19.011 32.928H31.048z"/>
          </g>
          <defs>
            <linearGradient id="drive_b" x1="193.6" x2="103.09" y1="165.6" y2="111.21" gradientUnits="userSpaceOnUse">
              <stop offset=".09" stopColor="#ffe921"/><stop offset="1" stopColor="#fec700"/>
            </linearGradient>
            <linearGradient id="drive_c" x1="114.4" x2="15.53" y1="181.61" y2="121.8" gradientUnits="userSpaceOnUse">
              <stop offset=".15" stopColor="#a9a8ff"/><stop offset=".33" stopColor="#6d97ff"/><stop offset=".48" stopColor="#3186ff"/>
            </linearGradient>
            <linearGradient id="drive_d" x1="128.88" x2="28.7" y1="37.88" y2="84.64" gradientUnits="userSpaceOnUse">
              <stop offset=".55" stopColor="#0ebc5f"/><stop offset=".85" stopColor="#78c9ff"/>
            </linearGradient>
          </defs>
        </svg>
      );
    case 'chat':
      return (
        <svg viewBox="0 0 192 192" fill="none" className="w-full h-full">
          <rect width="160" height="96" x="16" y="28" fill="#00AF57" rx="48"/>
          <path fill="#0EBC5F" d="M133 48c28.167 0 51 22.834 51 51 0 28.167-22.833 51-51 51H96.624l-34.857 23.064c-3.86 2.544-5.789 3.816-7.372 3.92a6 6 0 0 1-5.612-3.022C48 172.583 48 170.271 48 165.649V148.81C25.121 143.78 8 123.39 8 99c0-28.166 22.834-51 51-51h74z"/>
          <mask id="chat_a" width="176" height="129" x="8" y="48" maskUnits="userSpaceOnUse" style={{ maskType: 'alpha' }}>
            <path fill="#0EBC5F" d="M133 48c28.167 0 51 22.834 51 51 0 28.167-22.833 51-51 51H96.722l-39.428 25.896c-3.99 2.62-9.294-.242-9.294-5.015V148.81C25.121 143.78 8 123.39 8 99c0-28.166 22.834-51 51-51h74z"/>
          </mask>
          <g mask="url(#chat_a)">
            <rect width="160" height="96" x="16" y="28" fill="#0EBC5F" rx="48"/>
            <rect width="160" height="96" x="16" y="28" fill="url(#chat_b)" rx="48"/>
            <path stroke="#fff" strokeLinecap="round" strokeWidth="12" d="M62 94s8.84 18 34 18 34-17.182 34-17.182"/>
          </g>
          <defs>
            <linearGradient id="chat_b" x1="96" x2="96" y1="28" y2="124" gradientUnits="userSpaceOnUse">
              <stop offset=".09" stopColor="#94D4FF"/><stop offset=".28" stopColor="#78C9FF"/>
              <stop offset=".88" stopColor="#01AE58" stopOpacity="0"/>
            </linearGradient>
          </defs>
        </svg>
      );
    case 'calendar':
      return (
        <svg viewBox="0 0 192 192" fill="none" className="w-full h-full">
          <path fill="#bbe2ff" d="M32 36.8C32 20.894 44.894 8 60.8 8h70.4C147.106 8 160 20.894 160 36.8v30.4c0 15.906-12.894 28.8-28.8 28.8H60.8C44.894 96 32 83.106 32 67.2z"/>
          <path fill="#3c90ff" d="M19.867 49.392C17.818 33.82 29.94 20 45.645 20h100.71c15.706 0 27.827 13.82 25.778 29.392L166 96l6.133 46.608C174.182 158.18 162.061 172 146.355 172H45.645c-15.706 0-27.827-13.82-25.778-29.392L26 96z"/>
          <mask id="cal_a" width="154" height="152" x="19" y="20" maskUnits="userSpaceOnUse" style={{ maskType: 'alpha' }}>
            <path fill="#3c90ff" d="M19.867 49.392C17.818 33.82 29.94 20 45.645 20h100.71c15.706 0 27.827 13.82 25.778 29.392L166 96l6.133 46.608C174.182 158.18 162.061 172 146.355 172H45.645c-15.706 0-27.827-13.82-25.778-29.392L26 96z"/>
          </mask>
          <g mask="url(#cal_a)">
            <path fill="url(#cal_b)" d="M0 0h166v76H0z" transform="matrix(1 0 0 -1 13 172)"/>
          </g>
          <path fill="#fff" d="M75.353 133.336q-6.282 0-10.777-2.043t-7.61-5.465q-3.065-3.474-4.342-6.793T51.603 115a2.07 2.07 0 0 1 1.021-1.124l5.67-2.247q.714-.357 1.43-.102.714.204 1.685 2.349 1.022 2.145 2.86 4.546a14.3 14.3 0 0 0 4.495 3.728q2.606 1.328 6.435 1.328 6.18 0 9.807-3.575 3.677-3.575 3.677-9.091 0-5.976-3.882-9.194-3.881-3.269-10.266-3.269h-5.362a1.9 1.9 0 0 1-1.328-.51q-.51-.562-.511-1.277v-5.465q0-.767.51-1.277a1.82 1.82 0 0 1 1.329-.562h4.647q5.721 0 9.194-3.116t3.473-8.07q0-4.902-3.116-7.916t-8.58-3.014q-3.065 0-5.312 1.022a11.5 11.5 0 0 0-3.882 2.86 22.7 22.7 0 0 0-2.809 3.78q-1.174 1.941-1.89 2.145-.714.153-1.379-.255l-5.363-2.605q-.664-.358-.868-1.124t1.226-3.575q1.481-2.86 4.494-5.823a21 21 0 0 1 7.049-4.597q4.035-1.635 9.398-1.634 9.96 0 15.782 5.26 5.823 5.21 5.823 13.791 0 5.925-2.86 10.266-2.81 4.34-7.968 6.13v.204q6.231 1.838 9.806 6.741 3.627 4.853 3.626 11.594 0 9.654-6.742 15.834-6.74 6.18-17.57 6.18zm51.25-1.175q-.868 0-1.533-.664a2.25 2.25 0 0 1-.612-1.583V73.118l-11.492 8.274q-.614.46-1.431.307a1.96 1.96 0 0 1-1.225-.766l-3.32-4.7a1.98 1.98 0 0 1-.358-1.43q.153-.816.817-1.276l20.379-14.557q.256-.204.562-.306.307-.153.715-.153h4.291q.868 0 1.379.613.562.56.562 1.43v69.36q0 .92-.664 1.583a2 2 0 0 1-1.533.664z"/>
          <defs>
            <linearGradient id="cal_b" x1="83" x2="83" y1="76" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4fa0ff"/><stop offset="1" stopColor="#3186ff"/>
            </linearGradient>
          </defs>
        </svg>
      );
    default:
      return null;
  }
};

// SVG Sparkle (Gemini 4-point star with Aurora Gradient)
const SparkIcon: React.FC = () => (
  <svg className="w-5 h-5 select-none" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="auroraSparkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#346BF1" />
        <stop offset="50%" stopColor="#3186FF" />
        <stop offset="100%" stopColor="#A9A8FF" />
      </linearGradient>
    </defs>
    <path
      d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4771 12 22C12 16.4771 16.4771 12 22 12C16.4771 12 12 7.52285 12 2Z"
      fill="url(#auroraSparkGradient)"
    />
  </svg>
);

const AuroraGlowBehavior: React.FC<{
  glowPos?: string;
  auroraBg: string;
  glowRadius: number;
  glowBlur: number;
  glowOpacity: number;
  waveOffset?: number;
}> = ({ glowPos, auroraBg, glowRadius, glowBlur, glowOpacity, waveOffset }) => {
  const shiftX = waveOffset !== undefined ? ((waveOffset - 50) / 50) * 190 : 0;
  const transformStyle = shiftX !== 0 ? { transform: `translateX(${shiftX}px)` } : {};

  let edgeOpacity = 1;
  if (waveOffset !== undefined) {
    if (waveOffset < 18) {
      const norm = Math.max(0, waveOffset / 18);
      edgeOpacity = 0.5 - 0.5 * Math.cos(norm * Math.PI);
    } else if (waveOffset > 82) {
      const norm = Math.max(0, (100 - waveOffset) / 18);
      edgeOpacity = 0.5 - 0.5 * Math.cos(norm * Math.PI);
    }
  }
  const finalOpacity = glowOpacity * edgeOpacity;

  if (glowPos === 'swipe_in_out') {
    return (
      <div 
        className="absolute inset-0 overflow-visible pointer-events-none flex items-center justify-center transition-all duration-75 ease-out" 
        style={transformStyle}
      >
        <div 
          className="rounded-full transition-all duration-75 ease-out"
          style={{
            width: `calc(26% + ${glowRadius * 1.2}px)`,
            height: `calc(44% + ${glowRadius * 1.0}px)`,
            backgroundImage: auroraBg,
            filter: `blur(${glowBlur}px)`,
            opacity: finalOpacity,
          }}
        />
      </div>
    );
  }

  if (glowPos === 'pulse_sweep') {
    return (
      <div 
        className="absolute inset-0 overflow-visible pointer-events-none flex items-center justify-center transition-all duration-75 ease-out" 
        style={transformStyle}
      >
        <div 
          className="rounded-[40px] transition-all duration-75 ease-out"
          style={{
            width: `calc(135% + ${glowRadius * 4}px)`,
            height: `calc(145% + ${glowRadius * 3.5}px)`,
            backgroundImage: auroraBg,
            filter: `blur(${glowBlur}px)`,
            opacity: finalOpacity,
          }}
        />
      </div>
    );
  }

  if (glowPos === 'orbit_clockwise') {
    const orbSize = `calc(50% + ${glowRadius * 2.5}px)`;
    return (
      <div 
        className="absolute inset-0 overflow-visible pointer-events-none transition-all duration-200"
        style={{
          margin: `-${glowRadius * 0.75}px`,
          ...transformStyle
        }}
      >
        <div className="absolute inset-[-25%] animate-[spin_6s_linear_infinite] flex items-start justify-start pointer-events-none">
          <div 
            className="rounded-full transition-all duration-200"
            style={{
              width: orbSize,
              height: orbSize,
              backgroundImage: auroraBg,
              filter: `blur(${glowBlur}px)`,
              opacity: finalOpacity,
            }}
          />
        </div>
        <div className="absolute inset-[-25%] animate-[spin_6s_linear_infinite] flex items-end justify-end pointer-events-none" style={{ animationDelay: '-3s' }}>
          <div 
            className="rounded-full transition-all duration-200"
            style={{
              width: orbSize,
              height: orbSize,
              backgroundImage: auroraBg,
              filter: `blur(${glowBlur}px)`,
              opacity: finalOpacity * 0.85,
            }}
          />
        </div>
      </div>
    );
  }

  /* Default Border Halo (Breathing) */
  return (
    <div 
      className="absolute inset-0 rounded-full animate-pulse transition-all duration-75 ease-out pointer-events-none"
      style={{
        backgroundImage: auroraBg,
        filter: `blur(${glowBlur}px)`,
        opacity: finalOpacity,
        margin: `-${glowRadius * 1.5}px`,
        ...transformStyle
      }}
    />
  );
};

const AuroraYAxisCarousel: React.FC<{
  items: DetailItem[];
  activeStepIndex: number;
  isInProgress: boolean;
  isDark: boolean;
  onSelectStep: (idx: number) => void;
  titleStyle: React.CSSProperties;
  bodyStyle: React.CSSProperties;
  config?: LoaderConfig;
}> = ({ items, activeStepIndex, isInProgress, isDark, onSelectStep, titleStyle, bodyStyle, config }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const [translateY, setTranslateY] = React.useState(0);

  const count = items.length;
  const tripledItems = React.useMemo(() => [...items, ...items, ...items], [items]);
  const middleActiveIndex = count + activeStepIndex;

  const [virtualIndex, setVirtualIndex] = React.useState(middleActiveIndex);
  const [isSnapping, setIsSnapping] = React.useState(false);

  React.useEffect(() => {
    const currentRel = virtualIndex % count;
    if (activeStepIndex === currentRel) return;

    if (activeStepIndex === 0 && currentRel === count - 1) {
      setVirtualIndex(prev => prev + 1);
    } else {
      setVirtualIndex(count + activeStepIndex);
    }
  }, [activeStepIndex, count]);

  React.useEffect(() => {
    if (virtualIndex >= count * 2) {
      const timer = setTimeout(() => {
        setIsSnapping(true);
        setVirtualIndex(virtualIndex - count);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setIsSnapping(false);
          });
        });
      }, 720);
      return () => clearTimeout(timer);
    } else if (virtualIndex < count) {
      const timer = setTimeout(() => {
        setIsSnapping(true);
        setVirtualIndex(virtualIndex + count);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setIsSnapping(false);
          });
        });
      }, 720);
      return () => clearTimeout(timer);
    }
  }, [virtualIndex, count]);

  React.useEffect(() => {
    const activeEl = cardRefs.current[virtualIndex];
    const containerEl = containerRef.current;
    if (activeEl && containerEl) {
      const activeTop = activeEl.offsetTop;
      const activeHeight = activeEl.offsetHeight;
      const containerHeight = containerEl.offsetHeight;

      const targetOffset = activeTop + activeHeight / 2 - containerHeight / 2;
      setTranslateY(-targetOffset);
    }
  }, [virtualIndex, isSnapping, tripledItems]);

  cardRefs.current = cardRefs.current.slice(0, tripledItems.length);

  const padX = config?.auroraCardWidthPadding ?? 24;
  const glowPos = config?.auroraGlowPosition ?? 'border_halo';
  const glowRadius = config?.auroraGlowRadius ?? 14;
  const glowBlur = config?.auroraGlowBlur ?? 20;
  const glowOpacity = config?.auroraGlowOpacity ?? 0.85;
  const glowPalette = config?.auroraGlowColors ?? 'blue_aurora';
  const activeCardOpacity = config?.auroraActiveCardOpacity ?? 1.0;

  const showAuroraOnExplanation = config?.auroraOnExplanationItems !== undefined 
    ? Boolean(config.auroraOnExplanationItems) 
    : Boolean(config?.expandedStyle === 'title_list_aurora' || config?.expandedStyle === 'title_list_determinate_aurora');
  const showNeuralOnExplanation = config?.neuralOnExplanationItems !== undefined 
    ? Boolean(config.neuralOnExplanationItems) 
    : Boolean(config?.auroraParticlesOnDetailLines || config?.expandedStyle === 'title_list_neural' || config?.expandedStyle === 'title_list_determinate_neural' || config?.expandedStyle === 'title_list_neural_particles' || config?.expandedStyle === 'title_list_determinate_neural_particles' || config?.preset === 'labs_neural_aurora_particles');

  let gradientColors = '#73a8f4, #a4d9ff, #c8e2fb';
  if (glowPalette === 'violet_aurora') gradientColors = '#a855f7, #3b82f6, #06b6d4';
  if (glowPalette === 'emerald_aurora') gradientColors = '#10b981, #34d399, #a7f3d0';
  if (isDark) {
    if (glowPalette === 'blue_aurora') gradientColors = '#1d4ed8, #3b82f6, #60a5fa';
    if (glowPalette === 'violet_aurora') gradientColors = '#7e22ce, #2563eb, #0891b2';
    if (glowPalette === 'emerald_aurora') gradientColors = '#047857, #059669, #34d399';
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-[560px] mx-auto h-[290px] overflow-hidden select-none shadow-none"
    >
      {/* Top Gradient Fading Out over non-aurora glowing cards (z-30) */}
      <div className={`absolute top-0 left-0 right-0 h-[75px] z-30 pointer-events-none ${
        isDark 
          ? 'bg-gradient-to-b from-[#131416] via-[#131416]/85 to-transparent' 
          : 'bg-gradient-to-b from-white via-white/85 to-transparent'
      }`} />

      {/* Bottom Gradient Fading Out over non-aurora glowing cards (z-30) */}
      <div className={`absolute bottom-0 left-0 right-0 h-[75px] z-30 pointer-events-none ${
        isDark 
          ? 'bg-gradient-to-t from-[#131416] via-[#131416]/85 to-transparent' 
          : 'bg-gradient-to-t from-white via-white/85 to-transparent'
      }`} />

      {/* Y-Axis Eased Cycling Track with horizontal cushion to completely prevent left/right glow clipping */}
      <div
        className={`w-full flex flex-col gap-2.5 pt-2 pb-2 ${
          isSnapping ? 'transition-none duration-0' : 'transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]'
        }`}
        style={{ 
          transform: `translateY(${translateY}px)`,
          paddingLeft: `${padX}px`,
          paddingRight: `${padX}px`
        }}
      >
        {tripledItems.map((item, idx) => {
          const isVirtuallyActive = idx === virtualIndex;
          const origIdx = idx % count;
          const isActive = isInProgress ? isVirtuallyActive : (origIdx === 0 && idx === count);
          const isBelow = idx > virtualIndex;

          return (
            <div
              key={idx}
              ref={el => { cardRefs.current[idx] = el; }}
              onClick={() => onSelectStep(origIdx)}
              className={`w-full transition-[opacity,background-color,border-color,box-shadow] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer shadow-none scale-100 ${
                isActive
                  ? 'relative z-20 overflow-visible p-0 border-0'
                  : `relative z-0 overflow-hidden rounded-[20px] p-5 opacity-75 hover:opacity-95 border ${
                      isDark
                        ? 'bg-[#1e1f22] border-[#2b2d31]'
                        : 'bg-[#eaf0f5] border-white/70'
                    }`
              }`}
            >
              {/* Active Aurora Card Wrapper with separated layers: container (z-0), Aurora on top (z-10), text (z-20) */}
              {isActive ? (
                <div className="relative w-full rounded-[28px] overflow-visible shadow-none scale-100 min-h-[110px]">
                  {/* Layer 0: Active Card Container Background (controlled exclusively by active card opacity) */}
                  <div 
                    className={`absolute inset-0 rounded-[28px] transition-all duration-700 border shadow-none z-0 ${
                      isDark
                        ? 'bg-[#1e242b] border-[#3b82f6]/40'
                        : 'bg-[#e5ecf2] border-[#a4d9ff]/50'
                    }`}
                    style={{ opacity: activeCardOpacity }}
                  />

                  {/* Layer 1: Aurora Effect rendered ON TOP (z-10) of the active card's container background */}
                  {showAuroraOnExplanation && (
                    <AuroraGlowBehavior 
                      glowPos={glowPos}
                      auroraBg={`linear-gradient(to right, ${gradientColors})`}
                      glowRadius={glowRadius}
                      glowBlur={glowBlur}
                      glowOpacity={glowOpacity}
                    />
                  )}

                  {showNeuralOnExplanation && (
                    <AuroraParticleMesh 
                      isDark={isDark} 
                      density={config?.auroraParticleDensity} 
                      speed={config?.auroraParticleSpeed} 
                      size={config?.auroraParticleSize} 
                    />
                  )}

                  {/* Layer 2: Card Content (Title & Body) at z-20 with 100% opacity unaffected by container opacity */}
                  <div className="relative z-20 rounded-[28px] p-5 transition-all duration-700">
                    <div className="flex flex-col items-start">
                      <h4
                        className={`text-[14px] font-bold leading-[20px] mb-1 transition-colors font-display ${
                          isDark ? 'text-[#e3e2e6]' : 'text-[#1f1f1f]'
                        }`}
                        style={titleStyle}
                      >
                        {item.title}
                      </h4>
                      <p
                        className={`text-[13px] sm:text-[14px] leading-[20px] transition-colors font-display ${
                          isDark ? 'text-[#d4d7dc]' : 'text-[#262a33]'
                        }`}
                        style={bodyStyle}
                      >
                        {item.body}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Inactive Card Content - card below active shouldn't have text */
                <div className={`relative z-10 flex flex-col items-start transition-all duration-500 ${
                  isBelow ? 'opacity-0 h-4 pointer-events-none' : 'opacity-100'
                }`}>
                  {!isBelow && (
                    <h4
                      className={`text-[14px] font-bold leading-[20px] transition-colors font-display ${
                        isDark ? 'text-[#c4c7c5]' : 'text-[#262a33]'
                      }`}
                      style={titleStyle}
                    >
                      {item.title}
                    </h4>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const Loader: React.FC<LoaderProps> = ({ config, mode, replayKey, onToggleExpand }) => {
  const isDark = mode === 'dark';
  const isInProgress = config.sparkState === 'in_progress';

  // Determine how many badges to display based on badgeCount setting
  let maxVisible = 3;
  if (config.badgeCount === '1') maxVisible = 1;
  if (config.badgeCount === '2') maxVisible = 2;
  if (config.badgeCount === '3') maxVisible = 3;
  if (config.badgeCount === '4+') maxVisible = 3;

  const visibleIcons = config.selectedProductIcons.slice(0, maxVisible);
  const extraCount = config.selectedProductIcons.length - maxVisible;

  const [animatedActiveIcons, setAnimatedActiveIcons] = React.useState<ProductIconType[]>([]);

  React.useEffect(() => {
    if (!config.animateBadges || !isInProgress || config.selectedProductIcons.length === 0) {
      setAnimatedActiveIcons([]);
      return;
    }

    const updateRandomActiveSet = () => {
      const all = config.selectedProductIcons;
      if (all.length === 0) {
        setAnimatedActiveIcons([]);
        return;
      }

      // Determine active count for this cycle:
      // ~60% chance: 1 active badge (placed at leftmost position)
      // ~25% chance: 2-3 active badges
      // ~15% chance: >3 active badges (so badge count pill appears randomly)
      const rand = Math.random();
      let count = 1;
      if (all.length > 3 && rand > 0.85) {
        count = Math.min(all.length, 4 + Math.floor(Math.random() * (all.length - 3)));
      } else if (all.length >= 2 && rand > 0.60) {
        count = Math.min(all.length, 2 + Math.floor(Math.random() * Math.min(all.length - 1, 2)));
      } else {
        count = 1;
      }

      const shuffled = [...all].sort(() => Math.random() - 0.5);
      setAnimatedActiveIcons(shuffled.slice(0, count));
    };

    updateRandomActiveSet();
    const interval = setInterval(updateRandomActiveSet, 2000);
    return () => clearInterval(interval);
  }, [config.animateBadges, isInProgress, config.selectedProductIcons]);

  const [activeStepIndex, setActiveStepIndex] = React.useState(0);

  React.useEffect(() => {
    if (replayKey !== undefined && replayKey > 0) {
      setActiveStepIndex(0);
    }
  }, [replayKey]);

  React.useEffect(() => {
    if (!isInProgress || !config.isExpanded) {
      setActiveStepIndex(0);
      return;
    }

    const count = config.detailItemCount || 1;
    if (count <= 1) {
      setActiveStepIndex(0);
      return;
    }

    const isDeterminate = config.expandedStyle === 'title_list_determinate' || config.expandedStyle === 'title_list_determinate_neural' || config.expandedStyle === 'title_list_determinate_neural_particles';

    const interval = setInterval(() => {
      setActiveStepIndex(prev => {
        if (isDeterminate) {
          // Determinate: go from 0 up to count (where count means all steps are completed). Do not loop!
          return prev < count ? prev + 1 : count;
        } else if (config.expandedStyle === 'carousel_stack' || config.carouselMode) {
          // Carousel style: cycle continuously 0 -> 1 -> ... -> (count - 1) -> 0
          return (prev + 1) % count;
        } else if (count === 2) {
          // Medium explanation: alternate between paragraphs
          return (prev + 1) % 2;
        } else {
          // More explanation (>= 3): progressive reveal accumulator
          return (prev + 1) % count;
        }
      });
    }, 2800);

    return () => clearInterval(interval);
  }, [isInProgress, config.isExpanded, config.detailItemCount, config.expandedStyle, config.carouselMode]);

  const hasContainment = config.hasContainment === true;
  const titleStyle = {
    fontVariationSettings: `'wght' ${config.titleWeight ?? 500}, 'wdth' ${config.titleWidth ?? 100}`,
    fontWeight: config.titleWeight ?? 500,
    fontStretch: `${config.titleWidth ?? 100}%`,
  };
  const bodyStyle = {
    fontVariationSettings: `'wght' ${config.bodyWeight ?? 400}, 'wdth' ${config.bodyWidth ?? 100}`,
    fontWeight: config.bodyWeight ?? 400,
    fontStretch: `${config.bodyWidth ?? 100}%`,
  };

  const isCarouselMode = config.isExpanded && (config.expandedStyle === 'carousel_stack' || config.carouselMode === true);

  const glowPos = config.auroraGlowPosition;
  const glowRadius = config.auroraGlowRadius ?? 20;
  const glowBlur = config.auroraGlowBlur ?? 25;
  const glowOpacity = config.auroraGlowOpacity ?? 0.85;
  const glowPalette = config.auroraGlowColors ?? 'blue_aurora';

  let auroraBg = 'radial-gradient(ellipse at center, #73a8f4 0%, #a4d9ff 50%, rgba(200, 226, 251, 0) 80%)';
  if (glowPalette === 'violet_aurora') auroraBg = 'radial-gradient(ellipse at center, #a855f7 0%, #3b82f6 50%, rgba(6, 182, 212, 0) 80%)';
  if (glowPalette === 'emerald_aurora') auroraBg = 'radial-gradient(ellipse at center, #10b981 0%, #34d399 50%, rgba(167, 243, 208, 0) 80%)';
  if (isDark) {
    if (glowPalette === 'blue_aurora') auroraBg = 'radial-gradient(ellipse at center, #3b82f6 0%, #1d4ed8 50%, rgba(96, 165, 250, 0) 80%)';
    if (glowPalette === 'violet_aurora') auroraBg = 'radial-gradient(ellipse at center, #9333ea 0%, #2563eb 50%, rgba(8, 145, 178, 0) 80%)';
    if (glowPalette === 'emerald_aurora') auroraBg = 'radial-gradient(ellipse at center, #059669 0%, #047857 50%, rgba(52, 211, 153, 0) 80%)';
  }

  const [wavePhase, setWavePhase] = React.useState(config.auroraWaveOffset ?? 50);

  React.useEffect(() => {
    if (!config.auroraWaveAutoPlay) {
      setWavePhase(config.auroraWaveOffset ?? 50);
      return;
    }
    let rafId: number;
    let startTime = typeof performance !== 'undefined' ? performance.now() : 0;
    const baseSpeed = config.auroraWaveSpeed ?? 1.5;

    const animateWave = (now: number) => {
      const elapsed = (now - startTime) * 0.001 * baseSpeed;
      // Continuous left-to-right sweep: 0 -> 100
      const currentOffset = (elapsed * 35) % 100;
      setWavePhase(currentOffset);
      rafId = requestAnimationFrame(animateWave);
    };

    rafId = requestAnimationFrame(animateWave);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [config.auroraWaveAutoPlay, config.auroraWaveOffset, config.auroraWaveSpeed]);

  const [elapsedSeconds, setElapsedSeconds] = React.useState(0);

  React.useEffect(() => {
    if (replayKey !== undefined && replayKey > 0) {
      setElapsedSeconds(0);
    }
  }, [replayKey]);

  React.useEffect(() => {
    if (!isInProgress || !config.showTimer) {
      return;
    }
    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isInProgress, config.showTimer]);

  const formatTimer = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const showLeadingLoader = config.showLeadingLoader !== false;
  const showTitle = config.showTitle !== false;
  const showBadges = (config.loaderVariant === 'with_badges' || (config.showBadges && config.loaderVariant !== 'default')) && config.showBadges !== false;
  const showTimer = config.showTimer === true;
  const showStopIcon = config.showStopIcon === true;
  const showChevron = config.showChevron !== false;

  const showAuroraOnLeading = Boolean(config.auroraOnLeadingLoader);
  const showAuroraOnTitle = config.auroraOnTitleRow !== undefined 
    ? Boolean(config.auroraOnTitleRow) 
    : Boolean(config.auroraGlowOnTopTitle ?? (glowPos && config.isExpanded === false));
  const showAuroraOnExplanation = config.auroraOnExplanationItems !== undefined 
    ? Boolean(config.auroraOnExplanationItems) 
    : Boolean(config.expandedStyle === 'title_list_aurora' || config.expandedStyle === 'title_list_determinate_aurora');

  const showNeuralOnLeading = config.neuralOnLeadingLoader !== undefined 
    ? Boolean(config.neuralOnLeadingLoader) 
    : Boolean(config.auroraParticlesOnIcon && !config.auroraParticlesOnTopTitle && !config.auroraParticlesOnDetailLines);
  const showNeuralOnTitle = config.neuralOnTitleRow !== undefined 
    ? Boolean(config.neuralOnTitleRow) 
    : Boolean(config.auroraParticlesOnTopTitle);
  const showNeuralOnExplanation = config.neuralOnExplanationItems !== undefined 
    ? Boolean(config.neuralOnExplanationItems) 
    : Boolean(config.auroraParticlesOnDetailLines);

  const showTopTitleAurora = showAuroraOnTitle;
  const showTopTitleParticles = showNeuralOnTitle;
  const showTextGlow = Boolean(config.textGlowEnabled || config.preset === 'labs_neural_glow_layer' || config.preset === 'labs_neural_mesh_sheet' || config.preset === 'labs_aurora_neural_wave_pool' || (glowPos && config.isExpanded === false));

  return (
    <div className={`transition-all duration-300 w-full overflow-visible ${isCarouselMode ? 'w-[560px] min-w-[320px] sm:min-w-[560px]' : 'w-[440px] min-w-[320px] sm:min-w-[440px]'} ${
      hasContainment 
        ? `rounded-[24px] p-4 border shadow-sm ${isDark ? 'bg-[#1e1f22] border-[#2b2d31] text-[#e3e2e6]' : 'bg-white border-[#e0e2e5] text-[#1f1f1f]'}`
        : `p-2 bg-transparent border-transparent ${isDark ? 'text-[#e3e2e6]' : 'text-[#1f1f1f]'}`
    }`}>
      {/* Top Bar / Header */}
      <div className="relative flex items-center justify-between gap-3 min-h-[36px] w-full overflow-visible">
        {/* Layer 0: Aurora Glow & Neural Particles rendered around/behind Top Title */}
        {showTopTitleAurora && (
          <div className="absolute inset-x-[-36px] inset-y-[-24px] pointer-events-none overflow-visible z-0 flex items-center justify-center">
            <AuroraGlowBehavior 
              glowPos={glowPos || 'border_halo'}
              auroraBg={auroraBg}
              glowRadius={glowRadius}
              glowBlur={glowBlur}
              glowOpacity={glowOpacity}
              waveOffset={wavePhase}
            />
          </div>
        )}
        {showTopTitleParticles && (
          <div className="absolute inset-x-[-36px] inset-y-[-24px] pointer-events-none overflow-visible z-0">
            {config.neuralMeshStyle === 'sheet_mesh' || config.preset === 'labs_neural_mesh_sheet' ? (
              <NeuralSheetMesh 
                isDark={isDark} 
                density={config.auroraParticleDensity ?? 5} 
                speed={config.sheetWaveSpeed ?? config.auroraParticleSpeed ?? 0.9} 
                amplitude={config.sheetWaveAmplitude ?? 50}
                wireframeOpacity={config.sheetWireframeOpacity ?? 0.0}
                particleShape={config.particleShape}
                waveOffset={wavePhase}
              />
            ) : (
              <AuroraParticleMesh 
                isDark={isDark} 
                density={config.auroraParticleDensity} 
                speed={config.auroraParticleSpeed} 
                size={config.auroraParticleSize} 
                particleShape={config.particleShape}
                waveOffset={wavePhase}
              />
            )}
          </div>
        )}

        {/* Left Side: Spark + Streaming Text + Badges */}
        <div className="relative z-10 flex items-center gap-3 min-w-0 flex-1">
          {/* Spark / Indicator Container */}
          {showLeadingLoader && (
            <div className="relative flex-shrink-0 min-w-[26px] h-8 flex items-center justify-center scale-[0.8] origin-center">
              {/* Aurora Glow on Leading Loader */}
              {showAuroraOnLeading && (
                <div className="absolute inset-[-8px] rounded-full pointer-events-none overflow-visible z-0">
                  <AuroraGlowBehavior
                    glowPos="border_halo"
                    auroraBg={auroraBg}
                    glowRadius={10}
                    glowBlur={12}
                    glowOpacity={0.8}
                  />
                </div>
              )}
              {/* Neural Particles on Leading Loader */}
              {showNeuralOnLeading && (
                <div className="absolute inset-[-12px] pointer-events-none overflow-visible z-0">
                  <AuroraParticleMesh
                    isDark={isDark}
                    density={config.auroraParticleDensity ?? 4}
                    speed={config.auroraParticleSpeed ?? 1}
                    size={config.auroraParticleSize ?? 1}
                  />
                </div>
              )}

              {(!config.loaderIconType || config.loaderIconType === 'spark') && (
                <div className="relative flex-shrink-0 w-8 h-8 flex items-center justify-center">
                  {/* Animated Rotating Progress Ring when in_progress */}
                  {isInProgress && (
                    <div 
                      className="absolute inset-0 rounded-full animate-spin pointer-events-none" 
                      style={{
                        background: 'conic-gradient(from 0deg, #346bf1 0%, #3186ff 40%, #a9a8ff 70%, transparent 95%)',
                        maskImage: 'radial-gradient(circle at center, transparent 58%, black 63%)',
                        WebkitMaskImage: 'radial-gradient(circle at center, transparent 58%, black 63%)',
                        animationDuration: '1.2s'
                      }} 
                    />
                  )}
                  <SparkIcon />
                </div>
              )}

              {(config.loaderIconType === 'dots' || config.loaderIconType === 'glowing_dots' || config.loaderIconType === 'thinking_dots') && (
                <div className="relative flex-shrink-0 flex items-center justify-center min-w-[28px] h-8 px-1">
                  <div className="flex items-center gap-[4px]">
                    <span className={`w-1 h-1 rounded-full ${isDark ? 'bg-[#e3e2e6]' : 'bg-[#1f1f1f]'} ${isInProgress ? 'animate-dot-bounce' : ''}`} style={{ animationDelay: '0s' }} />
                    <span className={`w-1 h-1 rounded-full ${isDark ? 'bg-[#e3e2e6]' : 'bg-[#1f1f1f]'} ${isInProgress ? 'animate-dot-bounce' : ''}`} style={{ animationDelay: '0.15s' }} />
                    <span className={`w-1 h-1 rounded-full ${isDark ? 'bg-[#e3e2e6]' : 'bg-[#1f1f1f]'} ${isInProgress ? 'animate-dot-bounce' : ''}`} style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Streaming String Text / Pixel Drift Title */}
          <div className="flex items-center gap-2 min-w-0 flex-1 overflow-visible">
            {showTitle && (
              config.statusTextEffect === 'pixel_drift' ? (
                (() => {
                  const colorsMap: Record<string, string[]> = {
                    monochrome: isDark ? ["#FFFFFF", "#E3E2E6"] : ["#1F1F1F", "#444746"],
                    aurora: isDark ? ["#60A5FA", "#A78BFA", "#F472B6", "#FFFFFF"] : ["#3186FF", "#8B5CF6", "#EC4899", "#1F1F1F"],
                    cyber: ["#00FFCC", "#FF007F", "#7F00FF", "#007FFF"],
                    sunset: ["#FF5E62", "#FF9966", "#FFD166", "#EF476F"],
                    emerald: ["#10B981", "#34D399", "#A7F3D0", "#059669"],
                  };
                  const resolvedColors = colorsMap[config.particleColorsPreset || 'monochrome'] || (isDark ? ["#FFFFFF", "#FFFFFF"] : ["#1f1f1f", "#1f1f1f"]);
                  return (
                    <div className="relative flex-1 h-[40px] overflow-visible min-w-[220px] flex items-center">
                      <ParticleText 
                        text={config.statusText || "Synthesizing research..."} 
                        colors={resolvedColors} 
                        particleCount={config.particleCount ?? 70}
                        particleSize={config.particleSize ?? 9} 
                        mouseRadius={config.mouseRadius ?? 45}
                        mouseForce={config.mouseForce ?? 6} 
                        fontSize={config.particleFontSize ?? 20} 
                        autoFit={config.particleAutoFit ?? false} 
                        animateIn={config.particleAnimateIn ?? false}
                        style={{ minWidth: 0, minHeight: 0, width: "100%", height: "100%" }} 
                      />
                    </div>
                  );
                })()
              ) : (
                <span 
                  className={`relative z-10 text-[14px] font-medium leading-[20px] font-display overflow-visible ${showTextGlow ? 'whitespace-nowrap overflow-visible py-1 px-1 -my-1 -mx-1 inline-block' : 'truncate'} ${
                    isDark ? 'text-[#ffffff]' : 'text-[#1f1f1f]'
                  }`}
                  style={{
                    ...titleStyle,
                    ...(showTextGlow && isDark ? {
                      textShadow: `0 0 ${config.textGlowBlur ?? 16}px rgba(255,255,255, ${config.textGlowOpacity ?? 0.9}), 0 0 ${(config.textGlowBlur ?? 16) * 1.8}px ${glowPalette === 'violet_aurora' ? 'rgba(236,72,153,0.75)' : glowPalette === 'emerald_aurora' ? 'rgba(52,211,153,0.75)' : 'rgba(96,165,250,0.75)'}`,
                      mixBlendMode: (config.textBlendMode as any) || 'plus-lighter'
                    } : {})
                  }}
                >
                  {config.statusText}
                </span>
              )
            )}

            {/* Product Badges (if enabled) with reserved min-width container to prevent title text shifting */}
            {showBadges && (
              <div className="flex-shrink-0 flex items-center ml-3 min-w-[72px]">
                {(() => {
                  const isAnimated = config.animateBadges && isInProgress;
                  const activeTop3 = animatedActiveIcons.slice(0, 3);
                  
                  // Compute active state and active index among visible items
                  let activeCountSoFar = 0;

                  return config.selectedProductIcons.map((icon) => {
                    const isActive = isAnimated ? activeTop3.includes(icon) : visibleIcons.includes(icon);
                    const isFirstActive = isActive && activeCountSoFar === 0;
                    if (isActive) {
                      activeCountSoFar++;
                    }

                    return (
                      <div 
                        key={icon} 
                        className={`h-6 rounded-full flex items-center justify-center border shadow-xs overflow-hidden transition-all duration-700 ease-in-out transform ${
                          isDark 
                            ? 'bg-[#2b2d31] border-[#1e1f22]' 
                            : 'bg-[#f0f4f9] border-white'
                        } ${
                          isActive 
                            ? `w-6 max-w-[24px] opacity-100 scale-100 p-0.5 pointer-events-auto ${isFirstActive ? 'ml-0' : '-ml-1.5'}` 
                            : 'w-0 max-w-0 opacity-0 scale-50 p-0 border-0 shadow-none pointer-events-none ml-0'
                        }`}
                      >
                        <div className="w-3.5 h-3.5 flex-shrink-0 flex items-center justify-center">
                          <ProductIcon type={icon} />
                        </div>
                      </div>
                    );
                  });
                })()}

                {/* Badge Count Pill with Smooth Fade In/Out */}
                {(() => {
                  const animatedExtra = animatedActiveIcons.length > 3 ? animatedActiveIcons.length - 3 : 0;
                  const staticExtra = config.badgeCount === '4+' || extraCount > 0 ? (extraCount > 0 ? extraCount : 2) : 0;
                  const extraNum = config.animateBadges && isInProgress ? animatedExtra : staticExtra;
                  const isExtraActive = extraNum > 0;

                  return (
                    <div className={`h-6 rounded-full flex items-center justify-center text-[10px] font-medium border transition-all duration-700 ease-in-out transform ${
                      isDark
                        ? 'bg-[#2b2d31] border-[#1e1f22] text-[#c4c7c5]'
                        : 'bg-[#f0f4f9] border-white text-[#444746]'
                    } ${
                      isExtraActive
                        ? 'px-1.5 max-w-[40px] opacity-100 scale-100 pointer-events-auto -ml-1.5'
                        : 'max-w-0 opacity-0 scale-50 p-0 border-0 pointer-events-none ml-0'
                    }`}>
                      +{extraNum}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Right Side Header Controls Container: Timer, Stop Icon, Chevron */}
        <div className="flex items-center gap-2 shrink-0 ml-auto z-10">
          {/* Simple Timer Display matching title typography style (no icon, no containment) */}
          {showTimer && (
            <span 
              className={`relative z-10 text-[14px] font-medium leading-[20px] font-display shrink-0 opacity-70 ${
                isDark ? 'text-[#ffffff]' : 'text-[#1f1f1f]'
              }`}
              style={titleStyle}
            >
              {formatTimer(elapsedSeconds)}
            </span>
          )}

          {/* Stop / Play Action Icon */}
          {showStopIcon && (
            <button
              onClick={() => {
                // If callback or parent handler is provided or state update
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                isDark 
                  ? 'hover:bg-[#2b2d31] text-[#c4c7c5]' 
                  : 'hover:bg-[#f0f4f9] text-[#444746]'
              }`}
              title={isInProgress ? "Stop Loading" : "Start Loading"}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isInProgress ? 'stop' : 'play_arrow'}
              </span>
            </button>
          )}

          {/* Expand/Collapse Chevron Button */}
          {showChevron && (
            <button
              onClick={onToggleExpand}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                isDark 
                  ? 'hover:bg-[#2b2d31] text-[#c4c7c5]' 
                  : 'hover:bg-[#f0f4f9] text-[#444746]'
              }`}
              title={config.isExpanded ? "Collapse Details" : "Expand Details"}
            >
              <span className={`material-symbols-outlined text-[20px] transition-transform duration-300 ${
                config.isExpanded ? 'rotate-180' : 'rotate-0'
              }`}>
                keyboard_arrow_down
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Expanded Status Detail Box */}
      {(() => {
        const isLuminous = config.loaderIconType === 'dots';
        const isHybrid = config.loaderIconType === 'glowing_dots';
        const ruleVariant = config.ruleVariant || 'dashed';
        const isCarousel = config.expandedStyle === 'carousel_stack' || config.carouselMode === true;
        let borderClasses = 'border-t-0';
        if (config.isExpanded && !isCarousel && ruleVariant === 'dashed') {
          borderClasses = `border-t border-dashed ${
            isLuminous
              ? (isDark ? 'border-[var(--on-surface)]/30' : 'border-[var(--on-surface)]/35')
              : isHybrid
                ? (isDark ? 'border-[var(--on-surface-variant)]/45' : 'border-[var(--on-surface-variant)]/50')
                : (isDark ? 'border-[var(--outline-variant)]/60' : 'border-[var(--outline-variant)]')
          }`;
        } else if (config.isExpanded && ruleVariant === 'solid') {
          borderClasses = `border-t border-solid ${
            isLuminous
              ? 'border-[var(--on-surface)]/50'
              : isHybrid
                ? 'border-[var(--on-surface-variant)]/70'
                : 'border-[var(--outline)]'
          }`;
        }

        const detailGap = config.detailListGap ?? 12;
        const listGap = config.listDensity ?? 8;

        return (
          <div 
            className={`grid transition-all duration-300 ease-in-out overflow-visible ${
              config.isExpanded ? `grid-rows-[1fr] opacity-100 pt-0 ${borderClasses}` : 'grid-rows-[0fr] opacity-0 pt-0 border-t-0'
            }`}
            style={{ marginTop: config.isExpanded ? `${detailGap}px` : '0px' }}
          >
            <div className={`${(config.expandedStyle === 'title_list_aurora' || config.expandedStyle === 'title_list_determinate_aurora' || config.expandedStyle === 'title_list_neural' || config.expandedStyle === 'title_list_determinate_neural' || config.expandedStyle === 'title_list_neural_particles' || config.expandedStyle === 'title_list_determinate_neural_particles' || isCarousel) ? 'overflow-visible' : 'overflow-hidden'} space-y-0 pt-0`}>
              {config.isExpanded && ruleVariant === 'squiggly' && (
                <div className="w-full h-3 mb-2.5 pt-0 flex items-center overflow-visible">
                  <svg className={`w-full h-3 ${
                    isLuminous 
                      ? 'text-[var(--on-surface)]' 
                      : isHybrid 
                        ? 'text-[var(--on-surface-variant)]' 
                        : 'text-[var(--primary)]'
                  } opacity-85 overflow-visible`} xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="squiggly-rule-pattern" width="16" height="12" patternUnits="userSpaceOnUse">
                        <path d="M 0 6 Q 4 2.5, 8 6 T 16 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="12" fill="url(#squiggly-rule-pattern)" />
                  </svg>
                </div>
              )}
          {(() => {
            const count = config.detailItemCount || 1;
            const availableItems = (config.detailItems && config.detailItems.length > 0)
              ? config.detailItems.map((it, i) => it || { title: `Step ${i + 1}`, body: '' })
              : [{ title: config.statusDetailTitle || "Processing...", body: config.statusDetailBody || "" }];
            
            const visibleItems = availableItems.slice(0, count).map((it, i) => it || { title: `Step ${i + 1}`, body: '' });

            if (isCarousel) {
              return (
                <AuroraYAxisCarousel
                  items={visibleItems}
                  activeStepIndex={activeStepIndex}
                  isInProgress={isInProgress}
                  isDark={isDark}
                  onSelectStep={(idx) => setActiveStepIndex(idx)}
                  titleStyle={titleStyle}
                  bodyStyle={bodyStyle}
                  config={config}
                />
              );
            }

            if (config.expandedStyle === 'product_orbit_suction' || config.expandedStyle === 'product_orbit_flat' || config.preset === 'labs_product_orbit_suction' || config.preset === 'labs_product_orbit_flat') {
              const isFlat = config.expandedStyle === 'product_orbit_flat' || config.preset === 'labs_product_orbit_flat';
              return (
                <div className="w-full pt-1 pb-1 overflow-visible">
                  <ProductOrbitVortex
                    isDark={isDark}
                    icons={config.selectedProductIcons}
                    isInProgress={isInProgress}
                    starCount={config.orbitStarCount ?? (isFlat ? 0 : 35)}
                    speedMultiplier={config.orbitSpeed ?? (isFlat ? 0.8 : 0.7)}
                    hasContainment={config.orbitIconContainment !== false}
                    spiralMotion={config.orbitSpiralParticles !== false}
                    randomZSpace={config.orbitRandomZSpace ?? false}
                    cameraPitch={config.orbitCameraPitch ?? (isFlat ? 0 : 15)}
                    isFlat2D={isFlat}
                    steppedMotion={config.orbitSteppedMotion ?? (isFlat ? true : false)}
                    particleDiameter={config.orbitParticleDiameter ?? 3.5}
                  />
                </div>
              );
            }

            if (config.expandedStyle === 'title_list') {
              let leftPaddingClass = 'pl-0';
              if (!config.loaderIconType || config.loaderIconType === 'spark') {
                leftPaddingClass = 'pl-[44px]';
              } else if (config.loaderIconType === 'dots' || config.loaderIconType === 'thinking_dots') {
                leftPaddingClass = 'pl-[40px]';
              } else if (config.loaderIconType === 'glowing_dots') {
                leftPaddingClass = 'pl-[60px]';
              }

              return (
                <div className={`flex flex-col w-full pt-0 pb-0 ${leftPaddingClass}`} style={{ gap: `${listGap}px` }}>
                  {visibleItems.map((item, idx) => {
                    const isVisible = !isInProgress || idx <= activeStepIndex;
                    if (!isVisible) return null;

                    const isCurrentlyActive = isInProgress && idx === activeStepIndex;
                    const isCompleted = isInProgress && idx < activeStepIndex;

                    return (
                      <div
                        key={idx}
                        onClick={() => setActiveStepIndex(idx)}
                        className={`flex items-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer select-none py-0.5 animate-soft-item-reveal ${
                          isCurrentlyActive
                            ? (isDark ? 'text-[#e3e2e6]' : 'text-[#1f1f1f]')
                            : isCompleted
                              ? (isDark ? 'text-[#8e918f]' : 'text-[#747775]')
                              : (isDark ? 'text-[#a8abb0] opacity-85 hover:opacity-100' : 'text-[#444746] opacity-85 hover:opacity-100')
                        }`}
                      >
                        <h4
                          className="text-[14px] leading-[20px] font-display transition-colors"
                          style={titleStyle}
                        >
                          {item.title}
                        </h4>
                      </div>
                    );
                  })}
                </div>
              );
            }

            if (config.expandedStyle === 'title_list_aurora' || config.expandedStyle === 'title_list_neural' || config.expandedStyle === 'title_list_neural_particles') {
              let leftPaddingClass = 'pl-0';
              if (!config.loaderIconType || config.loaderIconType === 'spark') {
                leftPaddingClass = 'pl-[44px]';
              } else if (config.loaderIconType === 'dots' || config.loaderIconType === 'thinking_dots') {
                leftPaddingClass = 'pl-[40px]';
              } else if (config.loaderIconType === 'glowing_dots') {
                leftPaddingClass = 'pl-[60px]';
              }

              const revealedCount = Math.min(visibleItems.length, activeStepIndex + 1);
              const stepH = 28 + listGap;
              let containerHeight = stepH;
              if (revealedCount === 2) containerHeight = stepH * 2;
              else if (revealedCount >= 3) containerHeight = stepH * 3;

              return (
                <div className={`relative w-full overflow-visible transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${leftPaddingClass}`} style={{ height: `${containerHeight}px` }}>
                  {visibleItems.map((item, idx) => {
                    const isVisible = !isInProgress || idx <= activeStepIndex;
                    if (!isVisible) return null;

                    const isCurrentlyActive = isInProgress && idx === activeStepIndex;
                    const isCompleted = isInProgress && idx < activeStepIndex;
                    const distance = isInProgress ? (activeStepIndex - idx) : 0;

                    let yOffset = 0;
                    let scaleVal = 1;
                    let opacityVal = 1;
                    if (distance === 1) {
                      yOffset = stepH;
                      scaleVal = 0.94;
                      opacityVal = 0.72;
                    } else if (distance === 2) {
                      yOffset = stepH * 2;
                      scaleVal = 0.88;
                      opacityVal = 0.45;
                    } else if (distance >= 3) {
                      yOffset = stepH * 2.8;
                      scaleVal = 0.82;
                      opacityVal = 0.2;
                    }

                    return (
                      <div
                        key={idx}
                        onClick={() => setActiveStepIndex(idx)}
                        className={`absolute left-0 right-0 flex items-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer select-none origin-top-left ${isCurrentlyActive ? 'animate-soft-item-reveal' : ''}`}
                        style={{
                          transform: `translate3d(0, ${yOffset}px, 0) scale(${scaleVal})`,
                          opacity: opacityVal,
                          zIndex: 20 - distance,
                        }}
                      >
                        <div className={`relative w-full overflow-visible ${isCurrentlyActive ? '-my-10 -mx-10 py-10 px-10 animate-mask-swipe-reveal' : 'py-1'}`}>
                          {/* Aurora Glow right inside 40px padded wrapper so zero top/left/bottom blur clipping occurs */}
                          {isCurrentlyActive && (
                            <div className="absolute inset-x-6 inset-y-6 rounded-full pointer-events-none overflow-visible z-0">
                              {showAuroraOnExplanation && (
                                <AuroraGlowBehavior 
                                  glowPos={glowPos || 'border_halo'}
                                  auroraBg={auroraBg}
                                  glowRadius={glowRadius}
                                  glowBlur={glowBlur}
                                  glowOpacity={glowOpacity}
                                />
                              )}
                              {showNeuralOnExplanation && (
                                <AuroraParticleMesh 
                                  isDark={isDark} 
                                  density={config.auroraParticleDensity} 
                                  speed={config.auroraParticleSpeed} 
                                  size={config.auroraParticleSize} 
                                />
                              )}
                            </div>
                          )}

                          <h4
                            className={`relative z-10 text-[14px] leading-[20px] font-display transition-colors ${
                              isCurrentlyActive
                                ? (isDark ? 'text-[#e3e2e6] font-semibold' : 'text-[#1f1f1f] font-semibold')
                                : isCompleted
                                  ? (isDark ? 'text-[#8e918f]' : 'text-[#747775]')
                                  : (isDark ? 'text-[#a8abb0] hover:opacity-95' : 'text-[#444746] hover:opacity-95')
                            }`}
                            style={titleStyle}
                          >
                            {item.title}
                          </h4>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            }

            if (config.expandedStyle === 'title_list_determinate') {
              let leftPaddingClass = 'pl-0';
              if (!config.loaderIconType || config.loaderIconType === 'spark') {
                leftPaddingClass = 'pl-[44px]';
              } else if (config.loaderIconType === 'dots' || config.loaderIconType === 'thinking_dots') {
                leftPaddingClass = 'pl-[40px]';
              } else if (config.loaderIconType === 'glowing_dots') {
                leftPaddingClass = 'pl-[60px]';
              }

              return (
                <div className={`flex flex-col w-full pt-1 pb-1 ${leftPaddingClass}`} style={{ gap: `${listGap}px` }}>
                  {visibleItems.map((item, idx) => {
                    const isCompleted = isInProgress && idx < activeStepIndex;
                    const isCurrentlyActive = isInProgress && idx === activeStepIndex;

                    return (
                      <div
                        key={idx}
                        onClick={() => setActiveStepIndex(idx)}
                        className={`flex items-center gap-2.5 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer select-none py-1 animate-soft-item-reveal ${
                          isCurrentlyActive
                            ? (isDark ? 'text-[#e3e2e6]' : 'text-[#1f1f1f]')
                            : isCompleted
                              ? (isDark ? 'text-[#8e918f]' : 'text-[#747775]')
                              : (isDark ? 'text-[#6c7075] opacity-50 hover:opacity-75' : 'text-[#a0a4a8] opacity-55 hover:opacity-75')
                        }`}
                      >
                        {/* Status completion circle badge */}
                        <div className={`flex-shrink-0 w-5.5 h-5.5 rounded-full flex items-center justify-center transition-all duration-500 ${
                          isCompleted
                            ? (isDark ? 'bg-[#8e918f]/20 border border-[#8e918f] text-[#8e918f] shadow-xs scale-100' : 'bg-[#747775]/15 border border-[#747775] text-[#747775] shadow-xs scale-100')
                            : isCurrentlyActive
                              ? (isDark ? 'bg-[#3b82f6] shadow-xs ring-2 ring-[#3b82f6]/40 scale-105' : 'bg-[#3186ff] shadow-xs ring-2 ring-[#3186ff]/35 scale-105')
                              : (isDark ? 'bg-[#2b2d31] border border-[#383a3f]' : 'bg-[#eaf0f5] border border-[#d0d4d8]')
                        }`}>
                          {isCompleted ? (
                            <span className="material-symbols-outlined text-[13px] font-bold">check</span>
                          ) : null}
                        </div>

                        {/* Title text with persistent number */}
                        <h4
                          className={`text-[14px] leading-[20px] font-display transition-colors flex items-center gap-1.5 ${
                            isCurrentlyActive ? 'font-semibold' : 'font-normal'
                          }`}
                          style={titleStyle}
                        >
                          <span className="font-mono opacity-65">{idx + 1}.</span>
                          <span>{item.title}</span>
                        </h4>
                      </div>
                    );
                  })}
                </div>
              );
            }

            if (config.expandedStyle === 'title_list_determinate_aurora' || config.expandedStyle === 'title_list_determinate_neural' || config.expandedStyle === 'title_list_determinate_neural_particles') {
              let leftPaddingClass = 'pl-0';
              if (!config.loaderIconType || config.loaderIconType === 'spark') {
                leftPaddingClass = 'pl-[44px]';
              } else if (config.loaderIconType === 'dots' || config.loaderIconType === 'thinking_dots') {
                leftPaddingClass = 'pl-[40px]';
              } else if (config.loaderIconType === 'glowing_dots') {
                leftPaddingClass = 'pl-[60px]';
              }

              return (
                <div className={`flex flex-col w-full pt-1 pb-1 ${leftPaddingClass}`} style={{ gap: `${listGap}px` }}>
                  {visibleItems.map((item, idx) => {
                    const isCompleted = isInProgress && idx < activeStepIndex;
                    const isCurrentlyActive = isInProgress && idx === activeStepIndex;

                    return (
                      <div
                        key={idx}
                        onClick={() => setActiveStepIndex(idx)}
                        className={`relative flex items-center gap-2.5 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer select-none ${
                          isCurrentlyActive ? '-my-7 -mx-7 py-7 px-7 overflow-visible animate-mask-swipe-reveal animate-soft-item-reveal z-10' : 'py-1 z-0'
                        }`}
                      >
                        {/* Neural Aurora Glow background behind currently active step */}
                        {isCurrentlyActive && (
                          <div className="absolute inset-x-5 inset-y-5 rounded-full pointer-events-none overflow-visible z-0">
                            {showAuroraOnExplanation && (
                              <AuroraGlowBehavior 
                                glowPos={glowPos || 'border_halo'}
                                auroraBg={auroraBg}
                                glowRadius={glowRadius}
                                glowBlur={glowBlur}
                                glowOpacity={glowOpacity}
                              />
                            )}
                            {showNeuralOnExplanation && (
                              <AuroraParticleMesh 
                                isDark={isDark} 
                                density={config.auroraParticleDensity} 
                                speed={config.auroraParticleSpeed} 
                                size={config.auroraParticleSize} 
                              />
                            )}
                          </div>
                        )}

                        {/* Status circle badge */}
                        <div className={`relative z-10 flex-shrink-0 w-5.5 h-5.5 rounded-full flex items-center justify-center transition-all duration-500 ${
                          isCompleted
                            ? (isDark ? 'bg-[#8e918f]/20 border border-[#8e918f] text-[#8e918f] shadow-xs scale-100' : 'bg-[#747775]/15 border border-[#747775] text-[#747775] shadow-xs scale-100')
                            : isCurrentlyActive
                              ? (isDark ? 'bg-[#3b82f6] shadow-xs ring-2 ring-[#60a5fa] scale-105' : 'bg-[#3186ff] shadow-xs ring-2 ring-[#73a8f4] scale-105')
                              : (isDark ? 'bg-[#2b2d31] border border-[#383a3f]' : 'bg-[#eaf0f5] border border-[#d0d4d8]')
                        }`}>
                          {isCompleted ? (
                            <span className="material-symbols-outlined text-[13px] font-bold">check</span>
                          ) : null}
                        </div>

                        {/* Title text with persistent number */}
                        <h4
                          className={`relative z-10 text-[14px] leading-[20px] font-display transition-colors duration-500 flex items-center gap-1.5 ${
                            isCurrentlyActive
                              ? (isDark ? 'text-[#e3e2e6] font-semibold' : 'text-[#1f1f1f] font-semibold')
                              : isCompleted
                                ? (isDark ? 'text-[#8e918f]' : 'text-[#747775]')
                                : (isDark ? 'text-[#6c7075] opacity-50 hover:opacity-75' : 'text-[#a0a4a8] opacity-55 hover:opacity-75')
                          }`}
                          style={titleStyle}
                        >
                          <span className="font-mono text-[12px] opacity-75">{idx + 1}.</span>
                          <span>{item.title}</span>
                        </h4>
                      </div>
                    );
                  })}
                </div>
              );
            }

            if (config.showStepper || count >= 4) {
              const isLuminous = config.loaderIconType === 'dots';
              const isHybrid = config.loaderIconType === 'glowing_dots';

              return visibleItems.map((item, idx) => {
                const isVisible = !isInProgress || idx <= activeStepIndex;
                const isActive = isInProgress ? idx === activeStepIndex : true;
                const isFinished = isInProgress ? idx < activeStepIndex : false;
                const isNewlyActive = isInProgress && idx === activeStepIndex;

                return (
                  <div 
                    key={idx} 
                    className={`grid transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isVisible ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className={`flex items-start gap-3.5 transition-all duration-500 ${isNewlyActive ? 'animate-blur-crispen' : ''}`}>
                        {/* Left Stepper Indicator Rail */}
                        {(() => {
                          const icons = config.stepperIcons || ['description', 'filter_none', 'schedule', 'short_text'];
                          const iconName = icons[idx % icons.length];
                          const showLines = config.showStepperLines !== undefined ? config.showStepperLines : (config.stepperStyle === 'symbols' || config.stepperStyle === 'lines');

                          // Symbol Size & Weight calculation (1=Small, 2=Medium, 3=Large, 4=XL)
                          const symSize = config.stepperSymbolSize ?? 2;
                          let inactiveText = 'text-[18px]';
                          let activeText = 'text-[20px]';
                          let inactiveWght = 400;
                          let activeWght = 600;
                          if (symSize === 1) {
                            inactiveText = 'text-[16px]'; activeText = 'text-[18px]'; inactiveWght = 300; activeWght = 500;
                          } else if (symSize === 3) {
                            inactiveText = 'text-[22px]'; activeText = 'text-[24px]'; inactiveWght = 500; activeWght = 700;
                          } else if (symSize === 4) {
                            inactiveText = 'text-[26px]'; activeText = 'text-[28px]'; inactiveWght = 600; activeWght = 800;
                          }

                          // Pill & Circle Width calculation (1=1px, 2=2px, 3=4px, 4=6px, 5=10px, 6=14px)
                          const pillTier = config.stepperPillWidth ?? 4;
                          let activePillClass = 'w-1.5 h-10';
                          let circleClass = 'w-2.5 h-2.5';
                          let railWidthClass = 'w-3.5';
                          let lineClass = 'w-0.5';
                          if (pillTier === 1) {
                            activePillClass = 'w-[1px] h-10'; circleClass = 'w-[4px] h-[4px]'; railWidthClass = 'w-3'; lineClass = 'w-[1px]';
                          } else if (pillTier === 2) {
                            activePillClass = 'w-[2px] h-10'; circleClass = 'w-[5px] h-[5px]'; railWidthClass = 'w-3'; lineClass = 'w-[2px]';
                          } else if (pillTier === 3) {
                            activePillClass = 'w-1 h-10'; circleClass = 'w-2 h-2'; railWidthClass = 'w-3.5';
                          } else if (pillTier === 5) {
                            activePillClass = 'w-2.5 h-10'; circleClass = 'w-3 h-3'; railWidthClass = 'w-4';
                          } else if (pillTier === 6) {
                            activePillClass = 'w-3.5 h-10'; circleClass = 'w-3.5 h-3.5'; railWidthClass = 'w-4.5';
                          }

                          return config.stepperStyle === 'symbols' ? (
                            <div className="flex flex-col items-center flex-shrink-0 pt-0.5 relative w-7">
                              <span 
                                className={`material-symbols-outlined transition-all duration-500 select-none flex items-center justify-center ${
                                  isActive 
                                    ? `${activeText} ${isLuminous ? 'text-[var(--on-surface)]' : isHybrid ? 'text-[var(--on-surface-variant)]' : 'text-[var(--on-surface)] dark:text-[var(--on-surface)]'} font-bold` 
                                    : `${inactiveText} text-[#b0b4b8] dark:text-[#6c7075] font-normal`
                                }`}
                                style={{ fontVariationSettings: isActive ? `'FILL' 0, 'wght' ${activeWght}` : `'FILL' 0, 'wght' ${inactiveWght}` }}
                              >
                                {iconName}
                              </span>
                              {showLines && idx < visibleItems.length - 1 && (
                                <div className={`w-0.5 mt-1.5 transition-colors duration-500 ${
                                  isFinished ? 'bg-[#d0d4d8] dark:bg-[#4e5156]' : 'bg-[var(--outline-variant)]/20'
                                }`} style={{ minHeight: isActive ? '32px' : '22px' }} />
                              )}
                            </div>
                          ) : config.stepperStyle === 'lines' ? (
                            <div className={`flex flex-col items-center flex-shrink-0 pt-1 relative ${railWidthClass}`}>
                              <div 
                                className={`rounded-full transition-all duration-500 ease-out flex-shrink-0 ${
                                  isActive 
                                    ? `${activePillClass} ${isLuminous ? 'bg-[var(--on-surface)]' : isHybrid ? 'bg-[var(--on-surface-variant)]' : 'bg-[var(--primary)]'} shadow-xs` 
                                    : `${lineClass} ${isFinished ? 'h-10 bg-[#d0d4d8] dark:bg-[#4e5156]' : 'h-6 bg-[#b0b4b8]/50 dark:bg-[#6c7075]/50'}`
                                }`}
                              />
                              {showLines && idx < visibleItems.length - 1 && (
                                <div className={`${lineClass} mt-1 transition-colors duration-500 ${
                                  isFinished ? 'bg-[#d0d4d8] dark:bg-[#4e5156]' : 'bg-[var(--outline-variant)]/20'
                                }`} style={{ minHeight: isActive ? '24px' : '16px' }} />
                              )}
                            </div>
                          ) : (
                            <div className={`flex flex-col items-center flex-shrink-0 pt-1 relative ${railWidthClass}`}>
                              <div 
                                className={`rounded-full transition-all duration-500 ease-out flex items-center justify-center flex-shrink-0 ${
                                  isActive 
                                    ? `${activePillClass} ${isLuminous ? 'bg-[var(--on-surface)]' : isHybrid ? 'bg-[var(--on-surface-variant)]' : 'bg-[var(--primary)]'} shadow-xs` 
                                    : `${circleClass} bg-[#b0b4b8] dark:bg-[#6c7075]`
                                }`}
                              />
                              {showLines && idx < visibleItems.length - 1 && (
                                <div className={`${lineClass} mt-1 transition-colors duration-500 ${
                                  isFinished ? 'bg-[#d0d4d8] dark:bg-[#4e5156]' : 'bg-[var(--outline-variant)]/20'
                                }`} style={{ minHeight: isActive ? '24px' : '16px' }} />
                              )}
                            </div>
                          );
                        })()}

                        {/* Paragraph Content */}
                        <div className={`flex-1 min-w-0 pb-3 transition-all duration-500 ${
                          isActive 
                            ? 'opacity-100' 
                            : isFinished 
                              ? 'opacity-40 text-[var(--on-surface-variant)]' 
                              : 'opacity-35 text-[var(--on-surface-variant)]'
                        }`}>
                          <h4 
                            className="text-[14px] leading-[20px] transition-colors duration-500 font-display font-medium"
                            style={titleStyle}
                          >
                            {item.title}
                          </h4>
                          <p 
                            className={`text-[12px] leading-relaxed mt-0.5 transition-colors duration-500 font-display ${
                              isActive 
                                ? (isDark ? 'text-[#a8abb0]' : 'text-[#444746]') 
                                : 'text-inherit'
                            }`}
                            style={bodyStyle}
                          >
                            {item.body}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              });
            }

            if (!isInProgress || count <= 1) {
              return visibleItems.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <h4 
                    className={`text-[14px] leading-[20px] font-display font-medium ${
                      isDark ? 'text-[#e3e2e6]' : 'text-[#1f1f1f]'
                    }`}
                    style={titleStyle}
                  >
                    {item.title}
                  </h4>
                  <p 
                    className={`text-[12px] leading-relaxed font-display ${
                      isDark ? 'text-[#a8abb0]' : 'text-[#444746]'
                    }`}
                    style={bodyStyle}
                  >
                    {item.body}
                  </p>
                </div>
              ));
            }

            if (count === 2) {
              // Medium explanation: alternate between paragraph 0 and paragraph 1 with smooth height transition
              return visibleItems.map((item, idx) => {
                const isVisible = idx === activeStepIndex;
                return (
                  <div 
                    key={idx} 
                    className={`grid transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isVisible ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className={`space-y-1 ${isVisible ? 'animate-blur-crispen' : ''}`}>
                        <h4 
                          className={`text-[14px] leading-[20px] font-display font-medium ${
                            isDark ? 'text-[#e3e2e6]' : 'text-[#1f1f1f]'
                          }`}
                          style={titleStyle}
                        >
                          {item.title}
                        </h4>
                        <p 
                          className={`text-[12px] leading-relaxed font-display ${
                            isDark ? 'text-[#a8abb0]' : 'text-[#444746]'
                          }`}
                          style={bodyStyle}
                        >
                          {item.body}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              });
            }

            // count >= 3 (More explanation without stepper): progressively reveal with smooth height transition
            return visibleItems.map((item, idx) => {
              const isVisible = idx <= activeStepIndex;
              const isNewlyRevealed = idx === activeStepIndex;
              return (
                <div 
                  key={idx} 
                  className={`grid transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isVisible ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className={`space-y-1 ${isNewlyRevealed ? 'animate-blur-crispen' : ''}`}>
                      <h4 
                        className={`text-[14px] leading-[20px] font-display font-medium ${
                          isDark ? 'text-[#e3e2e6]' : 'text-[#1f1f1f]'
                        }`}
                        style={titleStyle}
                      >
                        {item.title}
                      </h4>
                      <p 
                        className={`text-[12px] leading-relaxed font-display ${
                          isDark ? 'text-[#a8abb0]' : 'text-[#444746]'
                        }`}
                        style={bodyStyle}
                      >
                        {item.body}
                      </p>
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>
    );
  })()}
    </div>
  );
};
