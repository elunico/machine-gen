let states = [];

function arrowFromTo(from, to) {
	push();
	translate(from.location.x, from.location.y);
	fill(255);
	stroke(0);
	strokeWeight(3);
	circle(0, 0, stateSize / 5);
	beginShape(LINES);
	curveVertex(0, 0);
	curveVertex(to.location.x - from.location.x, to.location.y - from.location.y);
	curveVertex(0, 0);
	endShape();

	translate(to.location.x - from.location.x, to.location.y - from.location.y);
	rotate(atan2(to.location.y - from.location.y, to.location.x - from.location.x) + HALF_PI);
	translate(0, stateSize);
	triangle(-stateSize / 2, 0, stateSize / 2, 0, 0, -stateSize / 2);
	pop();
}

class State {
	constructor(name) {
		this.name = name;
		this.transitions = [];
		this.location = null;
		this.isInitial = false;
	}
}

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

function setup() {
	createCanvas(windowWidth, windowHeight);
	states = [

	];
	let texts = prompt("Enter the states you want to draw separated by commas").split(/[, ]+/g).map(s => s.toLowerCase());
	for (let state of texts) {
		states.push(new State(state));
	}


}

function mousePressed() {
	for (let state of states) {
		if (state.location.dist(createVector(mouseX - width / 2, mouseY - height / 2)) < stateSize / 2 && currentState === INITIAL_STATE) {
			currentState = SELECTED_START_STATE;
			selectedStartState = state;

			return;
		} else if (state.location.dist(createVector(mouseX - width / 2, mouseY - height / 2)) < stateSize / 2 && currentState === SELECTED_START_STATE) {
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
	} else if (key == 'p') {
		function formatMethod(state) {
			return `
		@allows_access(to_states=[${state.transitions.map(s => '"' + s.name + '"').join(', ')}])
		def ${state.name}(self):
			pass`;
		}

		let classBody = `
    @Machine(initial_state="${states.filter(s => s.isInitial)[0]?.name ?? 'None'}")
	class $ClassName$(object):
		def __init__(self):
			pass

			${states.map(formatMethod).join('\n\n')}	`;

		let className = prompt("Enter the name of the class");
		classBody = classBody.replace(/\$ClassName\$/g, className);

		let element = document.createElement('a');
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(classBody));
		element.setAttribute('download', `${className}.py`);
		element.setAttribute('style', 'display: none');
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);


		console.log(classBody);
	}
}

function draw() {
	background(51);
	translate(width / 2, height / 2);
	let da = TWO_PI / states.length;
	for (let state of states) {
		let v = p5.Vector.fromAngle(da * states.indexOf(state)).mult(width / 2 - padding);
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
		circle(v.x, v.y, stateSize);
		textAlign(CENTER, CENTER);
		fill(0);
		stroke(255);
		textSize(24);
		text(state.name, v.x, v.y);
		for (let transition of state.transitions) {
			stroke(255);
			strokeWeight(3);
			arrowFromTo(state, transition);
		}
	}
	fill(255);
	stroke(0);

	text(statuses[currentState], 0, -height / 2 + 50);
	text("Press 'e' to save as a png. Press 'p' to generate code", 0, height / 2 - 50);
}
