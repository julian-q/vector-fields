const N_STEP = 10;
const V_LEN = 15;
const SCALE = 0.1;

var canvas;
var fInput;
var gInput;
let field = [
	math.parse("x"),
	math.parse("y")
];
field[0].compile();
field[1].compile();
let origin;

var MQ = MathQuill.getInterface(2);
var fMathField;
var gMathField;

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
	canvas.position(0, 0);

	fInput = createSpan("");
	fInput.position(80, 2);
	fInput.style("color", "white");
	fMathField = MQ.MathField(fInput.elt);

	gInput = createSpan("");
	gInput.position(80, 2);
	gInput.style("color", "white");
	gMathField = MQ.MathField(gInput.elt);

  // updateField(fInput.latex(), gInput.latex());

  origin = createVector(width/2, height/2);
}

function draw() {
  background(0);

  drawField(field);

  stroke(0);
  fill(0);
  rect(0, 0, 290, 50);

  stroke(0);
  fill(255);
  textFont("Courier New");
  textStyle(BOLD);
  text("f(x, y) = ", 5, 15);
  text("g(x, y) = ", 5, 38);

  if (mouseIsPressed) {
    updateOrigin();
  }
}

function drawField(field) {
  let xStepSize = width/N_STEP;
  let yStepSize = height/N_STEP;

  for (let i = xStepSize; i < width; i += xStepSize) {
    for (let j = yStepSize; j < height; j += yStepSize) {
      let scope = {
        x: (i - origin.x) * SCALE,
        y: (j - origin.y) * SCALE
      };
      let v = createVector(
        field[0].evaluate(scope),
        field[1].evaluate(scope)
      );
      let colorDeg = map(v.mag(), 0, 1000, 180, 0, true);
      v.normalize();
      v.mult(V_LEN);

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
}

function updateField(e1, e2) {
  field = [
    math.parse(e1),
    math.parse(e2)
  ];
  field[0].compile();
  field[1].compile();
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
	console.log("windowWidth: " + windowWidth + " windowHeight: " + windowHeight);
  resizeCanvas(windowWidth, windowHeight);
}
