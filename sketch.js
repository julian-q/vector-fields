let infoImage;

function preload() {
  infoImage = loadImage("img/baseline_info_white_24dp.png");
}

var canvas;
var fInput;
var gInput;
var eqRenderer;

let promptPosition;
let eqPosition
let stepSize;
let vLength;
let scale;
let field;
let origin;
let validEq;

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0, 0);

  promptPosition = createVector(50, 50);
  eqPosition = createVector(50, 200);

  fInput = createInput("-y");
  fInput.class("asciimath");
  fInput.position(promptPosition.x + 135, promptPosition.y + 2);

  gInput = createInput("x");
  gInput.class("asciimath");
  gInput.position(promptPosition.x + 135, promptPosition.y + 22);

  eqRenderer = createSpan("");
  eqRenderer.position(100, 100);
  eqRenderer.position(eqPosition.x, eqPosition.y);

  stepSize = createVector(50, 50);
  vLength = 15;
  scale = 2;
  field = createVector(0, 0);
  updateField(fInput.value(), gInput.value());
  origin = createVector(width/2, height/2);
  validEq = true;
}

function draw() {
  background(0);;
  drawPlot();
  drawPrompt();
  drawLaTeX();
}

function drawPlot() {
  if (mouseIsPressed) {
    updateOrigin();
  }

	if (validEq) {
		drawField(field);
	}

  drawAxes();
}

function drawAxes() {
  stroke(255);
  strokeWeight(4);
	line(origin.x, 0, origin.x, height);
	line(0, origin.y, width, origin.y);
}

function drawField(field) {
	push();
	translate(origin.x, origin.y);

  let start = createVector(
    -origin.x + (origin.x % stepSize.x),
    -origin.y + (origin.y % stepSize.y)
  );

  for (let i = start.x; i < width; i += stepSize.x) {
    for (let j = start.y; j < height; j += stepSize.y) {
			let scope = {
        x: i * scale,
        y: j * scale
      };
      let v = createVector(
        field.x.evaluate(scope),
        field.y.evaluate(scope)
      );
      // Map the magnitude to a color of corresponding "warmth."
      let colorDeg = map(v.mag(), 0, 1000, 180, 0, true);
      // Normalize for drawing purposes.
      v.normalize();
      v.mult(vLength);
      // Compute the verticies of the triangle that will make up the arrowhead.
      let trianglePoints = [
        createVector(
          i + v.x,
          j + v.y
        ),
        createVector(
          i + 0.75*v.x - 0.2*v.y,
          j + 0.75*v.y + 0.2*v.x
        ),
        createVector(
          i + 0.75*v.x + 0.2*v.y,
          j + 0.75*v.y - 0.2*v.x
        )
      ];
      // Draw line and arrowhead using calculated color and points.
      colorMode(HSB, 360);
      stroke(colorDeg, 360, 360);
      strokeWeight(2);
      fill(colorDeg, 360, 360);
      line(
        i, j,
        trianglePoints[0].x, trianglePoints[0].y
      );
      triangle(
        trianglePoints[0].x, trianglePoints[0].y,
        trianglePoints[1].x, trianglePoints[1].y,
        trianglePoints[2].x, trianglePoints[2].y
      );
    }
  }

	pop();
}

function drawPrompt() {
  stroke(255, 100);
  strokeWeight(1)
  fill(0, 180);
  rect(promptPosition.x, promptPosition.y, 365, 75);

  noStroke();
  fill(255);
  textFont("Helvetica");
  textSize(12);
  textStyle(NORMAL);
  text("AsciiMath Input", promptPosition.x + 5, promptPosition.y + 14);
  image(infoImage, promptPosition.x + 90, promptPosition.y + 2);
  textFont("Courier New");
  textSize(16);
  textStyle(BOLD);
  text("f(x,y)   =   ", promptPosition.x + 15, promptPosition.y + 36);
  text("g(x,y)   =   ", promptPosition.x + 15, promptPosition.y + 60);

  stroke(255);
  strokeWeight(1.2);
  drawBracket(promptPosition.x + 5, promptPosition.y + 20, 5, 50, true);
  drawBracket(promptPosition.x + 80, promptPosition.y + 20, 5, 50, false);
  drawBracket(promptPosition.x + 130, promptPosition.y + 20, 5, 50, true);
  drawBracket(promptPosition.x + 360, promptPosition.y + 20, 5, 50, false);

  fInput.position(promptPosition.x + 140, promptPosition.y + 22);
  gInput.position(promptPosition.x + 140, promptPosition.y + 42);
}

function drawLaTeX() {
  // var elhg;
  // var elwg;

  // var checkEx = setInterval(function () {
  //   let wrap = eqRenderer.elt;
  //   var text = wrap.getElementsByClassName('MathJax')[0];
  //   if (text) {
  //     elHeight = wrap.getBoundingClientRect().height;
  //     elWidth = wrap.getBoundingClientRect().width;
  //
  //     if (elhg === elHeight && elwg === elWidth) {
  //         console.log(elHeight, elWidth);
  //         clearInterval(checkEx);
  //     }
  //
  //     elhg = elHeight;
  //     elwg = elWidth;
  //
  //     stroke(255, 100);
  //     strokeWeight(1)
  //     fill(0, 180);
  //     rect(eqPosition.x, eqPosition.y, elwg, elhg);
  //   }
  // }, 100);

  noStroke();
  fill(255);
  textFont("Helvetica");
  textSize(12);
  textStyle(NORMAL);

  eqRenderer.position(eqPosition.x - 2, eqPosition.y + 3);
}

function drawBracket(x, y, w, h, opening) {
  if (!opening) {
    w *= -1;
  }

  line(x, y, x, y + h);
  line(x, y, x + w, y);
  line(x, y + h, x + w, y + h);
}

function updateField(e1, e2) {
	field.x = math.parse(e1);
	field.y = math.parse(e2);
  field.x.compile();
  field.y.compile();

	validEq = true;

	try {
		let scope = {
			x: 0,
			y: 0
		};
		field.x.evaluate(scope);
		field.y.evaluate(scope);
	} catch(error) {
		validEq = false;
	}

	if (validEq) {
		eqRenderer.html(
			"`[[f(x,y)], [g(x,y)]] = [[" + e1 + "], [" + e2 + "]]`"
		);
	} else {
		eqRenderer.html(
			"`[[f(x,y)], [g(x,y)]] = ` syntax error"
		);
	}
	MathJax.typesetPromise();
}

function updateOrigin() {
  origin.x += mouseX - pmouseX;
  origin.y += mouseY - pmouseY;
}

function keyPressed() {
  if (keyCode == ENTER) {
    updateField(fInput.value(), gInput.value());
  }
}

function mouseWheel(event) {
  scale -= event.delta * 0.01;

  if (scale > 0) {
    scale = 0;
  }

  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
