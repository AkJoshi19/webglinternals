/* var canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var gl = canvas.getContext('webgl2');
//0.0 -> 1.0
gl.clearColor(1.0, 0.0, 0.0, 1.0);
gl.clear(gl.DEPTH_BUFFER_BIT|gl.COLOR_BUFFER_BIT);
console.log(gl);
 */

function getVideoElement(url) {
    const video1 = document.createElement('video');
    video1.width = 1200;
    video1.height = 800;
    video1.muted = true;
    //videoE.crossOrigin = "anonymous";
    var source = document.createElement('source');
    source.src = url;
    source.type = 'video/mp4';
    video1.appendChild(source);
    return video1;
}
var canvas = new fabric.Canvas('c');
var url_mp4 = './media/pexels.mp4';

var videoE = getVideoElement(url_mp4);
var fab_video = new fabric.Image(videoE, {left: 0,   top: 0});
canvas.add(fab_video);

var text = 'This is a demo of text on a path. This text should be small enough to fit in what you drawn.';
var fontSize =  20; //2.5 * pathLength / text.length;
var text = new fabric.Text(text, { fontSize: fontSize, top: 30, left: 30 });
canvas.add(text);

fab_video.getElement().play();
//canvas.renderAll();
fabric.util.requestAnimFrame(function render() {
   canvas.renderAll();
   fabric.util.requestAnimFrame(render);
});
