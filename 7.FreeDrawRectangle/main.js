var canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var gl = canvas.getContext('webgl2');
//0.0 -> 1.0
gl.clearColor(1.0, 1.0, 1.0, 1.0);
gl.clear(gl.DEPTH_BUFFER_BIT|gl.COLOR_BUFFER_BIT);

initializeEvents(gl);

//Step1: shaders
var vertexShader = `#version 300 es
precision mediump float;
in vec2 position;
uniform float flipY;
void main() {
    gl_Position = vec4(position.x, position.y * flipY, 0.0, 1.0);
}`;
var fragmentShader = `#version 300 es
precision mediump float;
out vec4 color;
uniform vec4 inputColor;
void main () {
    color = inputColor;
}`;


const createAndBindBuffer = (bufferType, typeOfDrawing, data) => {
    var buffer = gl.createBuffer(); // Allocate some memory in GPU
    gl.bindBuffer(bufferType, buffer); // Bind that memory with 'bufferType' Channel eg:    gl.Array_Buffer
    gl.bufferData(bufferType, data, typeOfDrawing); // use 'bufferType' channel and send 'data' to GPU 
    gl.bindBuffer(bufferType, null); // GPU memory will be disallocated
    return buffer;
}

// link GPU variable to CPU and then sending Data
const linkGPUAndCPU = (obj, gl) => {
    var position = gl.getAttribLocation(obj.program, obj.gpuVariable); // 'gpuVariable' position that is currently used in main vertex shader program
    gl.enableVertexAttribArray(position);
    gl.bindBuffer(obj.channel || gl.ARRAY_BUFFER, obj.buffer);
    gl.vertexAttribPointer(position, obj.dims, obj.dataType || gl.FLOAT, 
        obj.normalize || gl.FALSE, obj.stride || 0, obj.offset || 0);
    return position;
}

const getShader = (gl, shaderSource, shaderType) => {
    var shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
    }
    return shader;
}

const getProgram = (gl, vertexShaderSource, fragmentShaderSource) => {
    var vs = getShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    var fs = getShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);        
    var program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
    }
    return program;
}

//Step2:
var program = getProgram(gl, vertexShader, fragmentShader);

const getGPUCoords = (obj) =>{
    return {
        startX : -1.0 + obj.startX/gl.canvas.width * 2,
        startY : -1.0 +  obj.startY/gl.canvas.height * 2,
        endX :  -1.0 +  obj.endX/gl.canvas.width * 2,
        endY :  -1.0 + obj.endY/gl.canvas.height* 2
    }
}

const getTextureColor = (obj) => {
    return {
        red : obj.startX/gl.canvas.width,
        green : obj.startY/gl.canvas.height,
        blue : obj.endX/gl.canvas.width,
        alpha : obj.endY/gl.canvas.height
    };
};

updateRectangle = () => {

    // Step3

    var vInit = getGPUCoords({startX:startX, startY:startY, endX:endX, endY:endY})

    var vertices = [vInit.startX, vInit.startY, vInit.endX, vInit.startY, vInit.startX, vInit.endY,
        vInit.startX, vInit.endY, vInit.endX, vInit.endY, vInit.endX,vInit.startY ]

    console.log('vertices ',vertices)
    var data = new Float32Array(vertices);
    var buffer = createAndBindBuffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW, data)
    
    // Step4 : getting position from
    gl.useProgram(program);
    var position = linkGPUAndCPU({program: program, buffer: buffer, gpuVariable:'position', dims: 2}, gl)

    var location = gl.getUniformLocation(program,'flipY');
    gl.uniform1f(location, -1.0)

    var color = getTextureColor(vertices);
    var inputColor = gl.getUniformLocation(program, 'inputColor')
    gl.uniform4fv(inputColor, [Math.random(), Math.random(), Math.random(), 1])
    // Step5 : drawing
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length/2 )
}
