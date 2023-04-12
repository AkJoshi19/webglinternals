var utils = new WebGLUtils();
var canvas = document.getElementById('canvas');
canvas.width = 300; //  window.innerWidth;
canvas.height = 300; //window.innerHeight;
var gl = utils.getGLContext(canvas);
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

//Step1:
var vertexShader = `#version 300 es
precision mediump float;
in vec2 position;//vertices : WebGL vertex coordinates
in vec2 texCoords;// Texture coordinates
out vec2 textureCoords; //Take input from vertex shader and serve to fragment shader
void main () {
    gl_Position = vec4(position, 0.0, 1.0);
    textureCoords = texCoords;
}`;

var fragmentShader = `#version 300 es
precision mediump float;
uniform float RAINSPEED;
uniform float RANSIZE;
uniform float iTime;
uniform float x1, y1, x2, y2, w, h;
uniform vec2 sourceOffset;
uniform sampler2D uImage, uCurrentImage; 

      vec2 getCurrentImageCoords() {
        vec2 uv = gl_FragCoord.xy / iResolution; 
        uv.x -= sourceOffset.x; 
        uv.y += sourceOffset.y - 1.0 + h / iResolution.y; 
        uv *= iResolution / vec2(w, h);
        return uv;
      }


      void renderTextureConditionally(vec3 color) {
        vec2 uv = gl_FragCoord.xy / iResolution;
        vec2 iuv = getCurrentImageCoords();
        vec4 dest = texture2D(uCurrentImage, iuv);
        bool isRangeInsideMediaSourceLayer = 1.0 - uv.y >= y1 && 1.0 - uv.y <= y2 && uv.x >= x1 && uv.x <= x2;
        float pixelLen = length(dest);
        if (isRangeInsideMediaSourceLayer && pixelLen > 0.0) {
          gl_FragColor.rgb = color;
          gl_FragColor.a = 1.0; 
        } else { 
          gl_FragColor = texture2D(iTexture, uv);
        }
      } 


      void renderTextureConditionallyWhenImageMoves(vec2 uv, vec2 iuv) {
        vec2 canvasCoords = gl_FragCoord.xy / iResolution;
        vec4 dest = texture2D(uCurrentImage, iuv);
        vec4 pixel = texture2D(iTexture, uv);
        float pixelLen = length(dest);
        if (pixelLen > 0.0)
        {
          gl_FragColor.rgb = pixel.rgb;
          gl_FragColor.a = 1.0;
        } else {
          bool isRangeInsideMediaSourceLayer = 1.0 - canvasCoords.y >= y1 && 1.0 - canvasCoords.y <= y2 && canvasCoords.x >= x1 && canvasCoords.x <= x2;
          if (isRangeInsideMediaSourceLayer) {
            gl_FragColor = texture2D(uImage, vec2(canvasCoords.x, 1.0 - canvasCoords.y));
          } else {
            gl_FragColor = texture2D(iTexture, canvasCoords);
          }
        }
      }

      void renderSwirlTextureConditionallyWhenImageMoves(vec2 uv, vec2 iuv) {
        vec2 canvasCoords = gl_FragCoord.xy / iResolution;
        vec4 dest = texture2D(uCurrentImage, iuv);
        vec4 pixel = texture2D(iTexture, uv);
        float pixelLen = length(dest);
        if (pixelLen > 0.0)
        {
          gl_FragColor.rgb = pixel.rgb;
          gl_FragColor.a = 1.0;
        } else {
          bool isRangeInsideMediaSourceLayer = 1.0 - canvasCoords.y >= y1 && 1.0 - canvasCoords.y <= y2 && canvasCoords.x >= x1 && canvasCoords.x <= x2;
          if (isRangeInsideMediaSourceLayer) {
            gl_FragColor = texture2D(uImage, vec2(canvasCoords.x, 1.0 - canvasCoords.y));
          } else {
            gl_FragColor = texture2D(iTexture, canvasCoords);
          }
        }
      }

      vec2 getSwirlCoords(vec2 p, vec2 iOffset, float iRadius, float iAngle) {
        vec2 offset = vec2(iOffset.x + 0.5, 0.5 - iOffset.y);
        p -= offset;
        float dist = length(p);  
        if (dist < iRadius) {
          float percent = (iRadius - dist) / iRadius;
          float theta = percent * percent * iAngle * 8.0;
          float s = sin(theta);
          float c = cos(theta);
          p = vec2(dot(p, vec2(c, -s)), dot(p, vec2(s, c)));
        }
        p += offset;
        return p;
      }
      
      
#define MAX_RADIUS 2
 #define DOUBLE_HASH 0
 #define HASHSCALE1 .1031
 #define HASHSCALE3 vec3(.1031, .1030, .0973)
 
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
 float resolution = 10. * exp2(-3.*RANSIZE);
 vec2 p3 = gl_FragCoord.xy / iResolution;
 vec2 uv = gl_FragCoord.xy / h * resolution;
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
 vec3 color = texture2D(iTexture, uv2/resolution - intensity*n.xy).rgb + 5.*pow(clamp(dot(n, normalize(vec3(1., 0.7, 0.5))), 0., 1.), 6.);
 
 renderTextureConditionally(color); }`;

//Step2
var program = utils.getProgram(gl, vertexShader, fragmentShader);
//Step3
var vertices = utils.prepareRectVec2(-1.0, 1.0, 1.0, -1.0);
var textureCoordinates = utils.prepareRectVec2(0.0, 0.0, 1.0, 1.0);

const buffer = utils.createAndBindBuffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW, new Float32Array(vertices));
const texBuffer = utils.createAndBindBuffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW, new Float32Array(textureCoordinates));

gl.useProgram(program);

var codeTexture, uImageTexture;

const codeImage = new Image();
codeImage.src = './media/Tiger-PNG-HD.png';
codeImage.onload = () => {
    codeTexture = utils.createAndBindTexture(gl, codeImage);
};

const image = new Image();
image.src = './media/courselogo.jpeg';
image.onload = () => {
    uImageTexture = utils.createAndBindTexture(gl, image);
};

var uImage = gl.getUniformLocation(program, 'uImage');
var uCode = gl.getUniformLocation(program, 'uCode');
gl.uniform1i(uImage, 0);
gl.uniform1i(uCode, 1);

var render = () => {
    //Step4
    utils.linkGPUAndCPU({program : program, buffer : buffer, dims : 2, gpuVariable : 'position'}, gl);
    utils.linkGPUAndCPU({program : program, buffer : texBuffer, dims : 2, gpuVariable : 'texCoords'}, gl);
    gl.activeTexture(gl.TEXTURE0 + 0);
    gl.bindTexture(gl.TEXTURE_2D, uImageTexture);
    gl.activeTexture(gl.TEXTURE0 + 1);
    gl.bindTexture(gl.TEXTURE_2D, codeTexture);
    //Step5
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length/2);
};

setTimeout(() => {
    render();    
}, 200);
