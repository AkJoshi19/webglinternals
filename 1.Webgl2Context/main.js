var canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var gl = canvas.getContext("webgl2");
//0.0 -> 1.0
gl.clearColor(1.0, 0.0, 0.0, 1.0);
gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
console.log(gl);

const objects = [{ SId: "11" }, { SId: "22" }, { SId: "33" }];
const clip = { id: "11" };

const isClipExist = (clip, objects) => {
  let status = false;
  objects.forEach((element) => {
    if (clip.id == element.SId) {
      status = true;
    }
  });

  return status;
};

console.log("isClipExist ", isClipExist(clip, objects));
