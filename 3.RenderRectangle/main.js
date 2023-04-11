var utils = new WebGLUtils();
var canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var gl = utils.getGLContext(canvas);

//Step1: Writing Shaders
var vertexShader = `
precision mediump float;
in vec2 position;
void main () {
    gl_Position = vec4(position, 0.0, 1.0);
}`;
var fragmentShader = `
precision highp float;
      #define MAX_RADIUS 2
      #define DOUBLE_HASH 0
      #define HASHSCALE1 .1031
      #define HASHSCALE3 vec3(.1031, .1030, .0973)
  
      uniform float  RANSIZE; 
      uniform float RAINSPEED; 
      uniform float iTime;
      uniform sampler2D uTexture;
      
      varying vec2 vTexCoord;
  
      float hash12(vec2 p)
      {
        vec3 p3  = fract(vec3(p.xyx) * HASHSCALE1);
        p3 += dot(p3, p3.yzx + 19.19);
        return fract((p3.x + p3.y) * p3.z);
      }
  
      vec2 hash22(vec2 p)
      {
        vec3 p3 = fract(vec3(p.xyx) * HASHSCALE3);
        p3 += dot(p3, p3.yzx+19.19);
        return fract((p3.xx+p3.yz)*p3.zy);
  
      }
  
      void main(){
  
      vec3 iResolution; 
      iResolution = vec3(1200, 700, 1.0); 
      float resolution = 10. * exp2(-3.*RANSIZE);
      vec2 uv = gl_FragCoord.xy / iResolution.y * resolution;
      vec2 uv2 = gl_FragCoord.xy / iResolution.xy* resolution;
      vec2 p0 = floor(uv);
  
  vec2 circles = vec2(0.);
  for (int j = -MAX_RADIUS; j <= MAX_RADIUS; ++j)
  {
  for (int i = -MAX_RADIUS; i <= MAX_RADIUS; ++i)
  {
  vec2 pi = p0 + vec2(i, j);
  #if DOUBLE_HASH
  vec2 hsh = hash22(pi);
  #else
  vec2 hsh = pi;
  #endif
  vec2 p = pi + hash22(hsh);
  
  float t = fract(RAINSPEED*iTime + hash12(hsh));
  vec2 v = p - uv;
  float d = length(v) - (float(MAX_RADIUS) + 1.)*t;
  
  float h = 1e-3;
  float d1 = d - h;
  float d2 = d + h;
  float p1 = sin(31.*d1) * smoothstep(-0.6, -0.3, d1) * smoothstep(0., -0.3, d1);
  float p2 = sin(31.*d2) * smoothstep(-0.6, -0.3, d2) * smoothstep(0., -0.3, d2);
  circles += 0.5 * normalize(v) * ((p2 - p1) / (2. * h) * (1. - t) * (1. - t));
  }
  }
  circles /= float((MAX_RADIUS*2+1)*(MAX_RADIUS*2+1));
  
  float intensity = mix(0.01, 0.15, smoothstep(0.1, 0.6, abs(fract(0.05*iTime + 0.5)*2.-1.)));
  vec3 n = vec3(circles, sqrt(1. - dot(circles, circles)));
  vec3 color = texture2D(uTexture, uv2/resolution - intensity*n.xy).rgb + 5.*pow(clamp(dot(n, normalize(vec3(1., 0.7, 0.5))), 0., 1.), 6.);
  gl_FragColor = vec4(color, 1.0);
  }`;

//Step 2 : Creating Program
var program = utils.getProgram(gl, vertexShader, fragmentShader);
//Step3 : Creating buffers
var data = new Float32Array([-0.7, -0.7, 0.7, 0.7, -0.7, 0.7,
                            -0.7, -0.7, 0.7, 0.7, 0.7, -0.7]);
var buffer = utils.createAndBindBuffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW, data);

//Step4 : LInking of CPU and GPU
gl.useProgram(program);
var position = utils.linkGPUAndCPU({
    program : program,
    gpuVariable : 'position',
    channel : gl.ARRAY_BUFFER,
    buffer : buffer,
    dims : 2,
    dataType : gl.FLOAT,
    normalize : gl.FALSE,
    stride : 0, 
    offset : 0
},
gl);

//Step 5 : Render the rectangle
gl.drawArrays(gl.TRIANGLES, 0, 6);