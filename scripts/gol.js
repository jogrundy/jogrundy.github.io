// from https://codereview.stackexchange.com/questions/159317/javascript-implementation-of-conways-game-of-life-with-html5-canvas
// rewritten to give step button and wrap button

class World {
    constructor(width, height, wrap) {
	this.width = width;
	this.height = height;
	this.cells = new Array(width * height);
	this.acc = new Array(3 * width);
	this.wrap = wrap
  }
  randomize(density = 0.5) {
    let cells = this.cells,
        random = Math.random;
    
    for (let i = 0, length = cells.length; i < length; ++i) {
      cells[i] = random() + density | 0;
    }
  }
  clear() {
    let cells = this.cells;
    
    for (let i = 0, length = cells.length; i < length; ++i) {
      cells[i] = 0;
    }
  }
  step() {
    let cells = this.cells,
        height = this.height,
        width = this.width,
        acc = this.acc,
        accLength = acc.length;

    // Initialize first two accumulator rows with zero:
    for (let x = 0; x < width + width; ++x) {
      acc[x] = 0;
    }

    // Initialize third accumulator row with top cell row:
    acc[width + width] = cells[0] + cells[1];
    acc[width + width + width - 1] = cells[width - 2] + cells[width - 1];
    for (let x = 1; x < width - 1; ++x) {
      let sum = cells[x] + cells[x - 1] + cells[x + 1];
      acc[x + width + width] = sum;
    }

    // Iterate up to the second last cell row:
    for (let y = 0, end = height * width - width; y < end; y += width) {

      // Update accumulator rows:
      acc[y % accLength] = cells[y + width] + cells[1 + y + width];
      acc[(width - 1 + y) % accLength] = cells[width - 2 + y + width] + cells[width - 1 + y + width];
      for (let x = 1; x < width - 1; ++x) {
        let i = x + y + width;
        acc[(x + y) % accLength] = cells[i] + cells[i - 1] + cells[i + 1];
      }

      // Update cells:
      for (let x = 0; x < width; ++x) {
        let sum = acc[x] + acc[x + width] + acc[x + width + width] - cells[x + y];
        if (sum == 3) cells[x + y] = 1;
        else if (sum != 2) cells[x + y] = 0;
      }
    }

    // Update last cell row:
    let y = height * width - width;
    for (let x = 0; x < width; ++x) {
      let sum = acc[(x + y - width) % accLength] + acc[(x + y) % accLength] - cells[x + y];
      if (sum == 3) cells[x + y] = 1;
      else if (sum != 2) cells[x + y] = 0;
    }
  }
}

class Game {
  constructor(canvas, size = 10) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.initialize(size);
    this.interval = undefined;
  }
    initialize(size, wrap) {
    let cellSize = this.canvas.clientWidth / size;

	this.world = new World(size, size, wrap);
    this.world.randomize();
    
    this.canvas.width = size;
    this.canvas.height = size;
    //this.canvas.style.backgroundImage = "repeating-linear-gradient(0deg, #cbb, transparent " + cellSize + "px),repeating-linear-gradient(-90deg, #cbb, transparent " + cellSize + "px)";
    
    this.draw(this.context);
  }
  update() {
    this.world.step();
    this.draw(this.context);
  }
  start(speed = 25) {
    clearInterval(this.interval);
    this.interval = setInterval(this.update.bind(this), speed);
  }
  stop() {
    clearInterval(this.interval);
    this.interval = undefined;
  }
  running() {
    return !!this.interval;
  }
  draw(context) {
    let imageData = context.getImageData(0, 0, this.world.width, this.world.height),
        data = imageData.data,
        cells = this.world.cells;
    
    for (let i = 0, length = data.length; i < length; i += 4) {
      if (cells[i >> 2]) {
        data[i    ] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = 200;
      } else {
        data[i + 3] = 0;
      }
    }
    context.putImageData(imageData, 0, 0);
  }
}

let canvas = document.getElementById('canvas'),
    game = new Game(canvas),
    startBtn = document.getElementById("btn-start"),
    stepBtn = document.getElementById("btn-step"),
    generateBtn = document.getElementById("btn-generate"),
    sizeBtn = document.getElementById("btn-size"),
    wrapBtn = document.getElementById("btn-wrap");

startBtn.addEventListener("click", function(event) {
  if (game.running()) {
    game.stop();
    startBtn.value = "Start";
  } else {
    game.start();
    startBtn.value = "Stop";
  }
});

stepBtn.addEventListener("click", function(event) {
    if (game.running()) {
	game.stop();
	startBtn.value="Start";
	game.update();
    } else {
	game.update();
    }
});

wrapBtn.addEventListener("change", function(event) {
    game.initialize(+sizeBtn.value, wrapBtn.value)
});
	

generateBtn.addEventListener("click", function(event) {
    game.initialize(+sizeBtn.value, wrapBtn.value);
});

sizeBtn.addEventListener("change", function(event) {
    game.initialize(+sizeBtn.value, wrapBtn.value);
});

game.initialize(+sizeBtn.value, wrapBtn.value);
