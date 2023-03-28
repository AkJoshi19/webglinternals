var canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var gl = canvas.getContext('webgl2');
gl.clearColor(1.0, 1.0, 1.0, 1.0);
gl.clear(gl.DEPTH_BUFFER_BIT|gl.COLOR_BUFFER_BIT);


var triangleCoords = [0.0, -1.0, 0.0, 1.0, 1.0, -1.0];
//Step1 : Write shaders
var vertexShader = `#version 300 es
precision mediump float;
in vec2 position;
void main () {
    gl_Position = vec4(position.x, position.y, 0.0, 1.0); //x, y, z, w
}`;
var fragmentShader = `#version 300 es
precision mediump float;
out vec4 color;
void main () {
    color = vec4(0.0, 0.0, 1.0, 1.0); //r, g , b, a
}
`;
//Step2 : Create Program from shaders
var vs = gl.createShader(gl.VERTEX_SHADER);
var fs = gl.createShader(gl.FRAGMENT_SHADER);

gl.shaderSource(vs, vertexShader);
gl.shaderSource(fs,fragmentShader);

gl.compileShader(vs);
gl.compileShader(fs);


if(!gl.getShaderParameter(vs, gl.COMPILE_STATUS)){
   console.error(gl.getShaderInfoLog(vs)) 
}

if(!gl.getShaderParameter(fs, gl.COMPILE_STATUS)){
    console.error(gl.getShaderInfoLog(fs)) 
 }

var program = gl.createProgram();
gl.attachShader(program, vs);
gl.attachShader(program, fs);

gl.linkProgram(program);

if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
     console.error(gl.getProgramInfoLog(program));
}

console.log(program)

//Step3 : Create Buffers
var buffer =  gl.createBuffer();  // Allocate some memory in the GPU
gl.bindBuffer(gl.ARRAY_BUFFER, buffer); // Bind a channel between GPU and Array_Buffer
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleCoords), gl.STATIC_DRAW);
gl.bindBuffer(gl.ARRAY_BUFFER, null);


//Step4 : Link GPU variable to CPU and sending data
gl.useProgram(program);
var position =  gl.getAttribLocation(program, 'position');
gl.enableVertexAttribArray(position);
gl.bindBuffer(gl.ARRAY_BUFFER, buffer); // Bind a channel between GPU and Array_Buffer
gl.vertexAttribPointer(position, 2, gl.FLOAT, gl.FALSE, 0, 0)


//Step5 : Render Triangle
gl.drawArrays(gl.TRIANGLES, 0, 3);