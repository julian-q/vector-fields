var canvas;
var fInput;
var gInput;
var eqRenderer;

let minAspectRatio;
let promptPosition;
let plotPosition;
let plotSize;
let stepSize;
let vLength;
let scale;
let field;
let origin;

let validEq = true;

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0, 0);

  fInput = createInput("-y");
  fInput.class("asciimath");
  fInput.position(80, 2);

  gInput = createInput("x");
  gInput.class("asciimath");
  gInput.position(80, 26);

  eqRenderer = createSpan("");
  eqRenderer.position(100, 100);

  minAspectRatio = 4/3;
  promptPosition = createVector(0, 0);
  plotPosition = createVector(0, 0);
  plotSize = createVector(0, 0);
  updateLayout();
  stepSize = createVector(50, 50);
  vLength = 15;
  scale = 2;
  field = createVector(0, 0);
  updateField(fInput.value(), gInput.value());
  origin = createVector(width/2, height/2);
}

function draw() {
  background(0);
  drawPlot();
  drawPrompt();
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
  noFill();
  rect(plotPosition.x, plotPosition.y, plotSize.x, plotSize.y);
	line(origin.x, plotPosition.y, origin.x, plotPosition.y + plotSize.y);
	line(plotPosition.x, origin.y, plotPosition.x + plotSize.x, origin.y);
}

function drawField(field) {
	push();
	translate(origin.x, origin.y);

  let left = origin.x - plotPosition.x;
  let right = plotPosition.x + plotSize.x - origin.x;
  let top = origin.y - plotPosition.y;
  let bottom = plotPosition.y + plotSize.y - origin.y;
  let start = createVector(
    -left + (left % stepSize.x),
    -top + (top % stepSize.y)
  );

  for (let i = start.x; i <= right; i += stepSize.x) {
    for (let j = start.y; j <= bottom; j += stepSize.y) {
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
  noStroke();
  fill(255);
  textFont("Helvetica");
  textSize(24);
  textStyle(NORMAL);
  text("AsciiMath Input", promptPosition.x, promptPosition.y - 20);
  text("LaTeX Output", promptPosition.x + 405, promptPosition.y - 20)
  text("Config", promptPosition.x + 600, promptPosition.y - 20)
  textFont("Courier New");
  textSize(16);
  textStyle(BOLD);
  text("f(x,y)   =   ", promptPosition.x + 10, promptPosition.y + 16);
  text("g(x,y)   =   ", promptPosition.x + 10, promptPosition.y + 40);

  stroke(255);
  strokeWeight(1.2);
  drawBracket(promptPosition.x, promptPosition.y, 5, 50, true);
  drawBracket(promptPosition.x + 75, promptPosition.y, 5, 50, false);
  drawBracket(promptPosition.x + 125, promptPosition.y, 5, 50, true);
  drawBracket(promptPosition.x + 355, promptPosition.y, 5, 50, false);
}

function drawBracket(x, y, w, h, opening) {
  if (!opening) {
    w *= -1;
  }

  line(x, y, x, y + h);
  line(x, y, x + w, y);
  line(x, y + h, x + w, y + h);
}

function updateLayout() {
  if (width/height >= minAspectRatio) {
    plotPosition.x = 300;
    plotPosition.y = 40;
    promptPosition.x = 20;
    promptPosition.y = 60;
  } else {
    plotPosition.x = 40;
    plotPosition.y = 150;
    promptPosition.x = 50;
    promptPosition.y = 70;
    eqRenderer.position(promptPosition.x + 400, promptPosition.y - 5);
  }

  fInput.position(promptPosition.x + 135, promptPosition.y + 2);
  gInput.position(promptPosition.x + 135, promptPosition.y + 22);
  plotSize.x = width - plotPosition.x - 40;
  plotSize.y = height - plotPosition.y - 40;
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
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateLayout();
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
