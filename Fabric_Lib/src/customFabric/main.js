const canvas = new fabric.Canvas("c");
canvas.setHeight(400);
canvas.setWidth(700);

const videoView = document.createElement("video");
const source = document.createElement("source");
const url_mp4 = "./media/pexels.mp4";

let fabricElement;

async function getVideoElement(url) {
  return new Promise((resolve, reject) => {
    source.src = url;
    source.type = "video/mp4";
    videoView.appendChild(source);
    //videoView.muted = true;

    // Load the video and show it
    videoView.load();
    //videoView.style.display = "inline";

    // Load metadata of the video to get video duration and dimensions
    videoView.addEventListener("loadedmetadata", function () {
      var video_duration = videoView.duration;

      resolve(videoView);
    });

    //videoE.crossOrigin = "anonymous";
  });
}

async function init() {
  var videoE = await getVideoElement(url_mp4);
  // Set canvas dimensions same as video dimensions
  videoE.width = videoE.videoWidth; //2000;
  videoE.height = videoE.videoHeight; //900;

  //canvas.width = videoE.videoWidth;
  //canvas.height = videoE.videoHeight;

  fabricElement = new fabric.Image(videoE);
  //fabricElement.setWidth(600);
  //fabricElement.setHeight(400);

  fabricElement.scaleToWidth(600);
  //fabricElement.scaleToHeight(300)

  canvas.add(fabricElement);
  videoE.load();

  initAnimation();
}

init();

function initAnimation() {
  canvas.renderAll();
  fabric.util.requestAnimFrame(function render() {
    canvas.renderAll();
    fabric.util.requestAnimFrame(render);
  });
}

const replayBttn = document.getElementById("btn-play");
replayBttn.addEventListener("click", function () {
  fabricElement.getElement().play();
  initAnimation();
});

const rainDropEffectBttn = document.getElementById("btn-rainDrop-effect");
rainDropEffectBttn.addEventListener("click", function () {
  var filter = new fabric.Image.filters.BlendColor({
    color: "red",
    mode: "tint",
    alpha: 0.5,
  });
  videoE.filters = [filter];
  initAnimation();
});
