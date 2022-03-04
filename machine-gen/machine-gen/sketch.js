let states = [];

let classTemplate;
let methodTemplate;

const stateSize = 120;
const padding = 150;

const INITIAL_STATE = Symbol('INITIAL_STATE');
const SELECTED_START_STATE = Symbol('SELECTED_START_STATE');
const SELECTED_END_STATE = Symbol('SELECTED_END_STATE');
const NO_TEXT_STATE = Symbol('NO_TEXT_STATE');

const statuses = {
  [INITIAL_STATE]: 'Click a state to select it as the start state',
  [SELECTED_START_STATE]: 'Click a state to select it as the end state',
  [SELECTED_END_STATE]: 'Press enter to confirm the transition or escape to cancel',
  [NO_TEXT_STATE]: ''
};

let currentState = INITIAL_STATE;
let selectedStartState = null;
let selectedEndState = null;

fetch('template-class.py').then(t => t.text()).then(s => classTemplate = s);
fetch('template-method.py').then(t => t.text()).then(s => methodTemplate = s);

function renderTemplate(template, data) {
  return template.replace(/\$(\w+)\$/g, (match, term) => {
    return data[term];
  });
}

function drawArrow(base, vec, fillC, strokeC, weight, arrowSize = 20) {
  push();
  let diff = p5.Vector.sub(vec, base);
  translate(base.x, base.y);
  strokeWeight(weight);
  stroke(fillC);
  line(0, 0, vec.x - base.x, vec.y - base.y);
  stroke(strokeC);
  strokeWeight(weight / 2);
  line(0, 0, vec.x - base.x, vec.y - base.y);
  fill(fillC);
  rotate(diff.heading());
  translate(diff.mag() - arrowSize - stateSize / 2, 0);
  triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
  pop();
}



function setup() {
  createCanvas(min(windowHeight, windowWidth), min(windowHeight, windowWidth));
  states = [];
  let texts = prompt("Enter the states you want to draw separated by commas").split(/[, ]+/g).map(s => s.toLowerCase().replace(/[^a-z0-9_]/g, ''));
  for (let state of texts) {
    states.push(new State(state));
  }
}

function mousePressed() {
  for (let state of states) {
    if (state.location.dist(createVector(mouseX, mouseY)) < stateSize / 2 && currentState === INITIAL_STATE) {
      currentState = SELECTED_START_STATE;
      selectedStartState = state;
      return;
    } else if (state.location.dist(createVector(mouseX, mouseY)) < stateSize / 2 && currentState === SELECTED_START_STATE) {
      currentState = SELECTED_END_STATE;
      selectedEndState = state;
      return;
    }
  }
}

function clearState() {
  currentState = INITIAL_STATE;
  selectedEndState = null;
  selectedStartState = null;
}

function generateClassCode() {
  let className = prompt("Enter the name of the class");
  let classBody = renderTemplate(classTemplate, {
    INIT_STATE: states.filter(i => i.isInitial)[0]?.name,
    CLASS_NAME: className
  });

  for (let state of states) {
    classBody += '\n' + renderTemplate(methodTemplate, {
      STATE_STRINGS: state.transitions.map(v => `"${v.name}"`).join(', '),
      METHOD_NAME: state.name
    });
  }

  return {
    className, classBody
  };
}

function downloadText(filename, content) {
  let element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
  element.setAttribute('download', `${filename}`);
  element.setAttribute('style', 'display: none');
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function keyPressed() {
  if (key == 'Enter') {
    if (selectedEndState && selectedStartState) {
      selectedStartState.transitions.push(selectedEndState);
      clearState();
    }
  } else if (key == 'Escape') {
    clearState();
  } else if (key == 'e') {
    noLoop();
    let oldState = currentState;
    currentState = NO_TEXT_STATE;
    redraw();
    save('sketch.png');
    currentState = oldState;
    loop();
  } else if (key == ' ') {
    if (selectedStartState) {
      selectedStartState.isInitial = !selectedStartState.isInitial;
    }
  } else if (key == 'p') {
    if (!states.some(state => state.isInitial)) {
      alert("No initial state selected. Click a state and press 'SPACE' to designate it as the initial state.");
      return;
    }

    let { className, classBody } = generateClassCode();
    downloadText(`${className}.py`, classBody);
  }
}

function draw() {
  background(51);

  let da = TWO_PI / states.length;
  for (let state of states) {
    for (let transition of state.transitions) {
      drawArrow(state.location, transition.location, color(0, 255, 255), color(0), 4);
    }
  }
  for (let state of states) {
    let v = p5.Vector.fromAngle(da * states.indexOf(state)).mult(min(width / 2, height / 2) - padding);
    v.add(createVector(width / 2, height / 2));
    state.location = v;
    fill(255);
    if (state === selectedStartState) {
      strokeWeight(3);
      fill(0, 255, 0);
    } else if (state === selectedEndState) {
      strokeWeight(3);
      fill(255, 0, 0);
    } else {
      strokeWeight(1);
      stroke(0, 255, 0);
    }
    if (state.isInitial) {
      circle(v.x, v.y, stateSize * 1.15);
      stroke(0);
    }
    circle(v.x, v.y, stateSize);
    textAlign(CENTER, CENTER);
    fill(0);
    stroke(255);
    textSize(24);
    text(state.name, v.x, v.y);
  }

  fill(255);
  stroke(0);

  if (currentState != NO_TEXT_STATE) {
    text(statuses[currentState], width / 2, 50);
    text("Press SPACE to designate an initial state", width / 2, height - 70);
    text("Press 'e' to save as a png. Press 'p' to generate code", width / 2, height - 40);
  }
}
