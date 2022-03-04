# State Machine Generator

### If you are here to use the program [Click This](/machine-gen/machine-gen/machine-gen)

I have written a python library that allows you to take a class with methods and model it as a finite state machine. Each method represents a state
and python annotations are used to determine which states can be accessed from which other states. This effectively allows you to only allow
for calling methods after certain other methods have been called. To read more about this library and how to use it
you can find a detailed description [on Github](https://github.com/elunico/Python-Finite-State-Machine) and [on PyPI](https://pypi.org/project/statemachine-elunico/)

This program is a [p5.js](https://p5js.org) sketch that lets you visually create the states for your finite state machine and then can generate a
python file containing a class that implements the state machine as described.

This is currently a program that I put together for fun and it could use a little more polish. I use `prompt` and `confirm` a bit to avoid having to
create web based or canvas based modals. I would like to clean this up in the future, but the program is nonetheless functional

You can see the example from PyPI implemented below

![An example image from the pypi page](https://github.com/elunico/machine-gen/raw/main/sketch.png)

This also generated the following python code

```python
@Machine(init_state='stop')
class Player:
    def __init__(self):
        pass

    @allows_access(to_states=["start"]):
    def stop:
        pass

    @allows_access(to_states=["pause", "rewind", "stop"]):
    def start:
        pass

    @allows_access(to_states=["start", "stop", "rewind"]):
    def pause:
        pass

    @allows_access(to_states=["start", "stop", "pause"]):
    def rewind:
        pass
```
