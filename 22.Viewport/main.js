var utils = new WebGLUtils();
var canvas = document.getElementById('canvas');
canvas.width = window.innerWidth * 0.80;
canvas.height = window.innerHeight * 0.80;
var gl = utils.getGLContext(canvas);

//Step1: Writing Shaders
var vertexShader = `#version 300 es
precision mediump float;
in vec2 position;
void main () {
    gl_Position = vec4(position, 0.0, 1.0);
}`;
var fragmentShader = `#version 300 es
precision mediump float;
out vec4 color;
uniform vec3 randomColor;
void main () {
    color = vec4(randomColor, 1.0);
}`;

//Step 2 : Creating Program
var program = utils.getProgram(gl, vertexShader, fragmentShader);
//Step3 : Creating buffers
var data = new Float32Array(utils.prepareRectVec2(-1.0, -1.0, 1.0, 1.0));
var buffer = utils.createAndBindBuffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW, data);

//Step4 : LInking of CPU and GPU
gl.useProgram(program);
var position = utils.linkGPUAndCPU({
    program : program,
    gpuVariable : 'position',
    buffer : buffer,
    dims : 2
}, gl);

//Step 5 : Render the rectangle
var randomColor = gl.getUniformLocation(program, 'randomColor');
gl.uniform3fv(randomColor, [Math.random(), Math.random(), Math.random()]);
gl.viewport(0, 0, gl.canvas.width/2, gl.canvas.height/2);
gl.drawArrays(gl.TRIANGLES, 0, 6);

gl.uniform3fv(randomColor, [Math.random(), Math.random(), Math.random()]);
gl.viewport(gl.canvas.width/2, 0, gl.canvas.width/2, gl.canvas.height/2);
gl.drawArrays(gl.TRIANGLES, 0, 6);

gl.uniform3fv(randomColor, [Math.random(), Math.random(), Math.random()]);
gl.viewport(0, gl.canvas.height/2, gl.canvas.width/2, gl.canvas.height/2);
gl.drawArrays(gl.TRIANGLES, 0, 6);
console.log(gl.getParameter(gl.VIEWPORT));

gl.uniform3fv(randomColor, [Math.random(), Math.random(), Math.random()]);
gl.viewport(gl.canvas.width/2, gl.canvas.height/2, gl.canvas.width/2, gl.canvas.height/2);
gl.drawArrays(gl.TRIANGLES, 0, 6);

console.log(gl.getParameter(gl.VIEWPORT));



var getDiff = (startX, startY, endX, endY) => {
    var obj = {
        startX : startX, startY : startY, endX : endX, endY
    };
    var v = utils.getGPUCoords(obj); //-1 to +1
    v = utils.getGPUCoords0To2(v); //0 to 2
    var diffX = v.endX - v.startX;
    var diffY = v.endY - v.startY;
    return {
        x : diffX, y : diffY
    };  
};

 initializeEvents(gl, (startX, startY, endX, endY) => {
    var diff = getDiff(startX, startY, endX, endY);
    currSX += diff.x; currSY += diff.y;
    currEX += diff.x; currEY += diff.y;
    vertices = utils.prepareRectVec2(currSX, currSY, currEX, currEY);
    buffer = utils.createAndBindBuffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW, new Float32Array(vertices));
    render(0, 0, gl.canvas.width, gl.canvas.height);;
    currSX = lastSX; currSY = lastSY; currEX = lastEX; currEY = lastEY;
}, (startX, startY, endX, endY) => {
    var diff = getDiff(startX, startY, endX, endY);
    lastSX += diff.x; lastSY += diff.y;
    lastEX += diff.x; lastEY += diff.y;
    currSX = lastSX; currSY = lastSY; currEX = lastEX; currEY = lastEY;
}); 

































