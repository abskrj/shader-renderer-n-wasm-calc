export const predefinedShaders = {
    'Rainbow Wave': `
uniform float time;
uniform vec2 resolution;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec3 color = vec3(
    sin(uv.x * 6.0 + time) * 0.5 + 0.5,
    sin(uv.y * 6.0 + time * 1.2) * 0.5 + 0.5,
    sin((uv.x + uv.y) * 6.0 + time * 0.8) * 0.5 + 0.5
  );
  gl_FragColor = vec4(color, 1.0);
}`,
    'Plasma': `
uniform float time;
uniform vec2 resolution;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  float v = sin(uv.x * 10.0 + time);
  v += sin(uv.y * 10.0 + time);
  v += sin((uv.x + uv.y) * 10.0 + time);
  v += sin(sqrt(uv.x * uv.x + uv.y * uv.y) * 10.0 + time);
  vec3 color = vec3(v * 0.5 + 0.5, v * 0.3 + 0.7, v * 0.8 + 0.2);
  gl_FragColor = vec4(color, 1.0);
}`,
    'Mandelbrot': `
uniform vec2 resolution;

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / resolution.y;
  vec2 z = vec2(0.0);
  vec2 c = uv * 2.0;
  
  int iterations = 0;
  for (int i = 0; i < 100; i++) {
    if (dot(z, z) > 4.0) break;
    z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
    iterations++;
  }
  
  float color = float(iterations) / 100.0;
  gl_FragColor = vec4(color, color * 0.5, 1.0 - color, 1.0);
}`
}; 