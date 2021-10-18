/*
Vector Field Plotter
by Julian Quevedo
*/

var canvas;
var fInput;
var gInput;
var eqRenderer;
let link;

let promptPosition;
let eqPosition;
let eqSize;
let stepSize;
let coordStepSize;
let scaleIndex;
let pixelScale;
let field;
let trajectories;
let origin;
let validEq;

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0, 0);

  promptPosition = createVector(50, 50);
  eqPosition = createVector(50, 200);
  eqSize = createVector(0, 0);

  fInput = createInput("-x");
  fInput.class("asciimath");
  fInput.position(promptPosition.x + 135, promptPosition.y + 2);

  gInput = createInput("y");
  gInput.class("asciimath");
  gInput.position(promptPosition.x + 135, promptPosition.y + 22);

  eqRenderer = createSpan("");
  eqRenderer.position(100, 100);
  eqRenderer.position(eqPosition.x, eqPosition.y);

  link = createA("http://asciimath.org/", "<img src='img/info_white_24dp.svg' width=15px>");
  link.position(promptPosition.x + 90, promptPosition.y + 2);

  origin = createVector(width/2, height/2);
  pixelStepSize = 173;
  coordStepSize = 16.0;
  vLength = 15;
  scaleIndex = 0.045;
  pixelScale = scaleIndex;
  field = createVector(0, 0);
  trajectories = [];
  updateField(fInput.value(), gInput.value());
  validEq = true;
}

function draw() {
  background(0);
  drawPlot();
  drawPrompt();
  drawLaTeX();
  drawTrajectories();
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
  strokeWeight(1);
	line(origin.x, 0, origin.x, height);
	line(0, origin.y, width, origin.y);
}

function drawField(field) {
  let start = createVector(
    (origin.x % pixelStepSize) - pixelStepSize,
    (origin.y % pixelStepSize) - pixelStepSize
  );
  let stop = createVector(
    width + pixelStepSize,
    height + pixelStepSize
  );
  colorMode(HSB);
  for (let i = start.x; i < stop.x; i += pixelStepSize) {
    strokeWeight(1);
    stroke(210, 360, 180, 50);
    for (let c = i; c < i + pixelStepSize; c += pixelStepSize / 4) {
      line(c, 0, c, height);
      stroke(210, 360, 30, 50);
    }
    for (let j = start.y; j < stop.y; j += pixelStepSize) {
      noStroke();
      fill("white");
      textSize(16);
      textFont("Helvetica");
      if ((i >= origin.x - 10 && i <= origin.x + 10 && j != origin.y) && !(j > origin.y - pixelStepSize && j < origin.y + pixelStepSize)) {
        let graphY = (-j + origin.y) * pixelScale;
        let yString = Math.abs(Math.floor(Math.log10(Math.abs(graphY)))) < 3 ? "" + Math.floor(graphY) : graphY.toExponential(1)
        text("" + yString, i, j);
      }
      if ((j >= origin.y - 10 && j <= origin.y + 10 && i != origin.x) && !(i > origin.x - pixelStepSize && i < origin.x + pixelStepSize)) {
        let graphX = (i - origin.x) * pixelScale;
        let xString = Math.abs(Math.floor(Math.log10(Math.abs(graphX)))) < 3 ? "" + Math.floor(graphX) : graphX.toExponential(1)
        text("" + xString, i, j);
      }

      strokeWeight(1);
      stroke(210, 360, 180, 50);
      for (let r = j; r < j + pixelStepSize; r += pixelStepSize / 4) {
        line(0, r, width, r);
        stroke(210, 360, 30, 50);
      }
			let scope = {
        x: (i - origin.x) * pixelScale,
        y: (-j + origin.y) * pixelScale
      };
      let v = createVector(
        field.x.evaluate(scope),
        field.y.evaluate(scope)
      );
      // Map the magnitude to a color of corresponding "warmth."
      let colorDeg = map(v.mag(), 0, 200, 180, 0, true);
      v.mult(0.1 / pixelScale);
      // Compute the verticies of the triangle that will make up the arrowhead.
      let trianglePoints = [
        createVector(
          i + v.x,
          j - v.y
        ),
        createVector(
          i + 0.75*v.x + 0.2*v.y,
          j - 0.75*v.y + 0.2*v.x
        ),
        createVector(
          i + 0.75*v.x - 0.2*v.y,
          j - 0.75*v.y - 0.2*v.x
        )
      ];
      // Draw line and arrowhead using calculated color and points.
      stroke(colorDeg, 360, 360);
      strokeWeight(0.1 * v.mag());
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

function drawPrompt() {
  stroke(255, 50);
  strokeWeight(1);
  fill(0, 180);
  rect(promptPosition.x, promptPosition.y, 365, 75);
  rect(promptPosition.x, promptPosition.y + 250, 180, 20);

  noStroke();
  fill(255);
  textFont("Helvetica");
  textSize(12);
  textStyle(NORMAL);
  text("AsciiMath Input", promptPosition.x + 5, promptPosition.y + 14);
  text("Double-click to add a trajectory", promptPosition.x + 5, promptPosition.y + 264);
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
  stroke(255, 50);
  strokeWeight(1)
  fill(0, 180);
  rect(eqPosition.x, eqPosition.y, eqSize.x - 3, eqSize.y + 6);
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
			x: 1,
			y: 1
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

  let elhg;
  let elwg;
  let checkEx = setInterval(function () {
    var wrap = eqRenderer.elt;
    var text = wrap.getElementsByClassName('MathJax')[0];
    if (text) {
      elHeight = wrap.getBoundingClientRect().height;
      elWidth = wrap.getBoundingClientRect().width;

      if (elhg === elHeight && elwg === elWidth) {
          clearInterval(checkEx);
      }

      elhg = elHeight;
      elwg = elWidth;

      eqSize.x = elWidth;
      eqSize.y = elHeight;
    }
  }, 100);

  trajectories = [];
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
  let delta = event.delta;
  if (delta > 50) {
    delta = 50;
  } else if (delta < -50) {
    delta = -50;
  }

  let exp = Math.exp(delta * 0.01);

  scaleIndex *= exp;
  pixelScale = scaleIndex;
  
  if (pixelStepSize < 64) {
    coordStepSize *= 2;
  }
  if (pixelStepSize > 256) {
    coordStepSize /= 2;
  }
  pixelStepSize = (coordStepSize / pixelScale);
  pixelStepSize = (coordStepSize / pixelScale);

  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function doubleClicked() {
  let x = (mouseX - origin.x) * pixelScale;
  let y = (-mouseY + origin.y) * pixelScale;

  let trajectory = [createVector(x, y)];

  for (let i = 0; i < 1000; i++) {
    let scope = {
      x: trajectory[trajectory.length - 1].x,
      y: trajectory[trajectory.length - 1].y
    }
    let delta = createVector(
      field.x.evaluate(scope),
      field.y.evaluate(scope)
    );
    delta.mult(0.01);
    trajectory.push(p5.Vector.add(trajectory[trajectory.length - 1], delta));
  }

  trajectories.push(trajectory);
}

function drawTrajectories() {
  for (let trajectory of trajectories) {
    if (trajectory.length > 1) {
      stroke(255);
      strokeWeight(2);
      for (let i = 1; i < trajectory.length; i++) {
        let start = createVector(
          (trajectory[i - 1].x /  pixelScale) + origin.x,
          (trajectory[i - 1].y / -pixelScale) + origin.y
        );
        let stop = createVector(
          (trajectory[i].x /  pixelScale) + origin.x,
          (trajectory[i].y / -pixelScale) + origin.y
        );
        line(start.x, start.y, stop.x, stop.y);
      }
    }
  }
}

function graphToPixel(graphCoord) {
  return createVector(
    (graphCoord.x /  pixelScale) + origin.x,
    (graphCoord.y / -pixelScale) + origin.y
  );
}

function pixelToGraph(pixelCoord) {
  return createVector(
    (pixelCoord.x - origin.x) * pixelScale,
    (-pixelCoord.y + origin.y) * pixelScale
  );
}
