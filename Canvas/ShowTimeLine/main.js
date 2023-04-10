var canvas = document.getElementById("timeline");
var ctx = canvas.getContext("2d");

var image = new Image();
image.src = "https://i.stack.imgur.com/gOk5s.jpg";
image.onload = function() {
  for (let i = 0; i < 6; i++)
    ctx.drawImage(
      image,
      0, 80 * i, 1420, 80,
      710 * i, 0, 710, 40
    );
};