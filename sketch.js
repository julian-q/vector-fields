var canvas;
var fInput;
var gInput;
var eqRenderer;
let link;

let promptPosition;
let eqPosition;
let eqSize;
let stepSize;
let vScale;
let pixelScale;
let field;
let origin;
let validEq;

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0, 0);

  promptPosition = createVector(50, 50);
  eqPosition = createVector(50, 200);
  eqSize = createVector(0, 0);

  fInput = createInput("-y");
  fInput.class("asciimath");
  fInput.position(promptPosition.x + 135, promptPosition.y + 2);

  gInput = createInput("x");
  gInput.class("asciimath");
  gInput.position(promptPosition.x + 135, promptPosition.y + 22);

  eqRenderer = createSpan("");
  eqRenderer.position(100, 100);
  eqRenderer.position(eqPosition.x, eqPosition.y);

  link = createA("http://asciimath.org/", "<img src='img/info_white_24dp.svg' width=15px>");
  link.position(promptPosition.x + 90, promptPosition.y + 2);

  origin = createVector(width/2, height/2);
  stepSize = createVector(50, 50);
  vLength = 15;
  pixelScale = 2;
  field = createVector(0, 0);
  updateField(fInput.value(), gInput.value());
  validEq = true;
}

let fps = 0;

function draw() {
  background(0);
  drawPlot();
  drawPrompt();
  drawLaTeX();
  drawTrajectories();
  // if (frameCount % 30 == 0) {
  //   fps = frameRate();
  // }
  // noStroke();
  // fill(255);
  // textFont("Courier New");
  // textSize(24);
  // text("" + fps, width - 70, 20);
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
  let pixelStart = createVector(
    (origin.x % stepSize.x) - stepSize.x,
    (origin.y % stepSize.y) - stepSize.y
  );
  let pixelStop = createVector(
    width + stepSize.x,
    height + stepSize.y
  );
  let graphStart = pixelToGraph(pixelStart);
  let graphStop = pixelToGraph(pixelStop);
  colorMode(HSB);
  for (let i = start.x; i <= stop.x; i += stepSize.x) {
    strokeWeight(1);
    stroke(210, 360, 180, 50);
    for (let c = i; c < i + stepSize.x; c += stepSize.x / 4) {
      line(c, 0, c, height);
      stroke(210, 360, 30, 50);
    }
    for (let j = start.y; j <= stop.y; j += stepSize.y) {
      strokeWeight(1);
      stroke(210, 360, 180, 50);
      for (let r = j; r < j + stepSize.y; r += stepSize.y / 4) {
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
      let colorDeg = map(v.mag(), 0, 1000, 180, 0, true);
      // Normalize for drawing purposes.
      // v.normalize();
      v.mult(vScale);
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
  strokeWeight(1)
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
			x: 0,
			y: 0
		};
		let originMagnitude = createVector(
      field.x.evaluate(scope),
		  field.y.evaluate(scope)
    ).mag();
    scope = {
      x: (width - origin.x) * pixelScale,
      y: (-height + origin.y) * pixelScale
    };
    let distantMagnitude = createVector(
      field.x.evaluate(scope),
		  field.y.evaluate(scope)
    ).mag();
    vScale = 50.0 / Math.max(originMagnitude, distantMagnitude);
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
  pixelScale -= event.delta * 0.01;

  if (pixelScale < 0) {
    pixelScale = 0;
  }

  let sign = event.delta < 0 ? 1 : -1;

  stepSize.x -= Math.pow(Math.abs(event.delta) * 0.01, 2) * sign;
  stepSize.y -= Math.pow(Math.abs(event.delta) * 0.01, 2) * sign;

  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

let trajectories = [];

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


// 0.5x * (1 - (x + 0.5y) / 200)
// 0.5y * (1 - (y - 0.5x) / 200)

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
