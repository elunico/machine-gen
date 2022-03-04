let states = [];

let classTemplate;
let methodTemplate;

const stateSize = 120;
const padding = 150;

const INITIAL_STATE = Symbol('INITIAL_STATE');
const SELECTED_START_STATE = Symbol('SELECTED_START_STATE');
const SELECTED_END_STATE = Symbol('SELECTED_END_STATE');

const statuses = {
  [INITIAL_STATE]: 'Click a state to select it as the start state',
  [SELECTED_START_STATE]: 'Click a state to select it as the end state',
  [SELECTED_END_STATE]: 'Press enter to confirm the transition or escape to cancel',
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

function drawArrow(base, vec, myColor, arrowSize = 14) {
  push();
  let diff = p5.Vector.sub(vec, base);
  stroke(myColor);
  strokeWeight(3);
  fill(myColor);
  translate(base.x, base.y);
  line(0, 0, vec.x - base.x, vec.y - base.y);
  rotate(diff.heading());
  translate(diff.mag() - arrowSize - stateSize / 2, 0);
  triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
  pop();
}



function setup() {
  createCanvas(windowWidth, windowHeight);
  states = [new State('A'), new State('B'), new State('C'), new State('D')];
  // let texts = prompt("Enter the states you want to draw separated by commas").split(/[, ]+/g).map(s => s.toLowerCase());
  // for (let state of texts) {
  // states.push(new State(state));
  // }
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

function keyPressed() {
  if (key == 'Enter') {
    if (selectedEndState && selectedStartState) {
      currentState = INITIAL_STATE;
      selectedStartState.transitions.push(selectedEndState);
      selectedEndState = null;
      selectedStartState = null;
    }
  } else if (key == 'Escape') {
    currentState = INITIAL_STATE;
    selectedStartState = null;
    selectedEndState = null;
  } else if (key == 'e') {
    save('sketch.png');
  } else if (key == ' ') {
    if (selectedStartState)
      selectedStartState.isInitial = true;
  } else if (key == 'p') {
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

    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(classBody));
    element.setAttribute('download', `${className}.py`);
    element.setAttribute('style', 'display: none');
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
}

function draw() {
  background(51);

  let da = TWO_PI / states.length;
  for (let state of states) {
    for (let transition of state.transitions) {
      stroke(255);
      strokeWeight(3);
      drawArrow(state.location, transition.location, color(255));
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

  text(statuses[currentState], width / 2, 50);
  text("Press SPACE to designate an initial state", width / 2, height - 70);

  text("Press 'e' to save as a png. Press 'p' to generate code", width / 2, height - 40);

  // let v = createVector(0, 0);
  // drawArrow(createVector(width / 2, height / 2), createVector(mouseX, mouseY), color(255));

}
