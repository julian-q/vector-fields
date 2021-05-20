let xStepSize = 100;
let yStepSize = 100;
let vLength = 15;
let scale = 2;

var canvas;
var fInput;
var gInput;
var eqRenderer;

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

	field = createVector(0, 0);
  updateField(fInput.value(), gInput.value());

  origin = createVector(width/2, height/2);
}

function draw() {
  background(0);

	if (mouseIsPressed) {
    updateOrigin();
  }

	stroke(255);
	line(origin.x, 0, origin.x, height);
	line(0, origin.y, width, origin.y);

	if (validEq) {
		drawField(field);
	}

  stroke(0);
  fill(255);
  textFont("Courier New");
  textStyle(BOLD);
  text("f(x, y) = ", 5, 15);
  text("g(x, y) = ", 5, 38);
}

function drawField(field) {
	let left = origin.x;
	let right = width - origin.x;
	let top = origin.y;
	let bottom = height - origin.y;

	push();
	translate(origin.x, origin.y);

	let xStart = -left + (left % xStepSize);
	let xStop = right - (right % xStepSize);
	let yStart = -top + (top % yStepSize);
	let yStop = bottom - (bottom % yStepSize);

  for (let i = xStart; i <= right; i += xStepSize) {
    for (let j = yStart; j <= bottom; j += yStepSize) {
			let scope = {
        x: i * scale,
        y: j * scale
      };
      let v = createVector(
        field.x.evaluate(scope),
        field.y.evaluate(scope)
      );
      let colorDeg = map(v.mag(), 0, 1000, 180, 0, true);
      v.normalize();
      v.mult(vLength);

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
      // Draw line and arrowhead using calculated points.
      colorMode(HSB, 360);
      stroke(colorDeg, 360, 360);
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

	// stroke(255);
	// fill(255);
	// rect(-left, -top, width - 100, height - 100);

	pop();
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
  origin.x = mouseX;
  origin.y = mouseY;
}

function keyPressed() {
  if (keyCode == ENTER) {
    updateField(fInput.value(), gInput.value());
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
