export const predefinedShaders = {
  'Rainbow Wave': `#version 300 es
precision highp float;

in vec2 v_texCoord;
out vec4 fragColor;
uniform float u_time;
uniform vec2 u_resolution;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec3 color = vec3(
    sin(uv.x * 6.0 + u_time) * 0.5 + 0.5,
    sin(uv.y * 6.0 + u_time * 1.2) * 0.5 + 0.5,
    sin((uv.x + uv.y) * 6.0 + u_time * 0.8) * 0.5 + 0.5
  );
  fragColor = vec4(color, 1.0);
}`,
  'Plasma': `#version 300 es
precision highp float;

in vec2 v_texCoord;
out vec4 fragColor;
uniform float u_time;
uniform vec2 u_resolution;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float v = sin(uv.x * 10.0 + u_time);
  v += sin(uv.y * 10.0 + u_time);
  v += sin((uv.x + uv.y) * 10.0 + u_time);
  v += sin(sqrt(uv.x * uv.x + uv.y * uv.y) * 10.0 + u_time);
  vec3 color = vec3(v * 0.5 + 0.5, v * 0.3 + 0.7, v * 0.8 + 0.2);
  fragColor = vec4(color, 1.0);
}`,
  'Mandelbrot': `#version 300 es
precision highp float;

in vec2 v_texCoord;
out vec4 fragColor;
uniform vec2 u_resolution;

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
  vec2 z = vec2(0.0);
  vec2 c = uv * 2.0;
  
  int iterations = 0;
  for (int i = 0; i < 100; i++) {
    if (dot(z, z) > 4.0) break;
    z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
    iterations++;
  }
  
  float color = float(iterations) / 100.0;
  fragColor = vec4(color, color * 0.5, 1.0 - color, 1.0);
}`,
  'Rotating Cube': `#version 300 es
precision highp float;

in vec2 v_texCoord;
out vec4 fragColor;
uniform vec2 u_resolution;
uniform float u_time;

mat3 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    return mat3(oc * axis.x * axis.x + c, oc * axis.x * axis.y - axis.z * s, oc * axis.z * axis.x + axis.y * s,
                oc * axis.x * axis.y + axis.z * s, oc * axis.y * axis.y + c, oc * axis.y * axis.z - axis.x * s,
                oc * axis.z * axis.x - axis.y * s, oc * axis.y * axis.z + axis.x * s, oc * axis.z * axis.z + c);
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    vec3 color = vec3(0.0);

    vec3 rotAxis = vec3(1.0, 1.0, 1.0);
    mat3 rot = rotationMatrix(rotAxis, u_time);

    vec3 pos = vec3(uv, 1.0);
    pos = rot * pos;

    float dist = length(pos) - 0.5;
    float cube = step(0.0, dist) * step(dist, 0.1);
    color += vec3(0.2, 0.8, 0.2) * cube;

    vec2 bgUV = uv * 2.0 - 1.0;
    float bg = length(bgUV);
    color = mix(color, vec3(bg, bg * 0.5, 0.0), 1.0 - cube);

    fragColor = vec4(color, 1.0);
}`,
  'Colorful Gradient': `#version 300 es
precision highp float;

in vec2 v_texCoord;
out vec4 fragColor;
uniform vec2 u_resolution;
uniform float u_time;

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float hue = uv.x + u_time * 0.1;
    float saturation = 0.8;
    float value = 0.5 + 0.5 * sin(uv.y * 3.14159 + u_time);
    
    vec3 color = hsv2rgb(vec3(hue, saturation, value));
    fragColor = vec4(color, 1.0);
}`
}; 