class State {
  constructor(name) {
    this.name = name;
    this.transitions = [];
    this.location = null;
    this.isInitial = false;
  }
}
