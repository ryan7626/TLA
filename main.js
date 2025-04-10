"use strict";

let gl;
let program;

let player = {
  x: -0.8,
  y: -0.7,
  width: 0.05,
  height: 0.1,
  vx: 0,
  vy: 0,
  onGround: false
};

const gravity = -0.002;
const jumpStrength = 0.05;
const moveSpeed = 0.01;
const solidRegions = [
    // Ground
    { x: -1.0, y: -0.8, width: 2.0, height: 0.1 },
    // Platform 1 (center)
    { x: -0.2, y: -0.4, width: 0.4, height: 0.05 },
    // Platform 2 (left floating)
    { x: -0.7, y: -0.2, width: 0.3, height: 0.05 },
    // Platform 3 (right floating)
    { x: 0.5, y: -0.1, width: 0.3, height: 0.05 }
  ];
  
  const spikes = [
    // Bottom spikes
    { x: -0.4, y: -0.7, dir: "up" },
    { x: 0.3, y: -0.7, dir: "up" },
    // Top spikes
    { x: -0.2, y: 1, dir: "down" },
    { x: 0.4, y: 1, dir: "down" }
  ];
  
  const greenGoal = { x: 0.95, y: -0.4, width: 0.03, height: 0.15 };

const keys = {};

window.onload = function init() {
  const canvas = document.getElementById("gl-canvas");
  gl = canvas.getContext("webgl2");
  if (!gl) {
    alert("WebGL 2.0 isn't available");
    return;
  }

  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);
  gl.clearColor(0.1, 0.1, 0.1, 1.0);

  // Input handling
  document.addEventListener("keydown", e => keys[e.key] = true);
  document.addEventListener("keyup", e => keys[e.key] = false);

  document.getElementById("resetLevel").addEventListener("click", () => {
    player.x = -0.8;
    player.y = -0.7;
    player.vx = 0;
    player.vy = 0;
  });
  

  requestAnimationFrame(render);
};

  function updatePlayer() {
    const prevX = player.x;
    const prevY = player.y;

    // Ground collision
    if (player.y <= -0.7) {
        player.y = -0.7;
        player.vy = 0;
        player.onGround = true;
    }

    // Wall collision (right wall incomplete)
    if (player.x <= -1) {
    player.x = -1;
    player.vx = 0;
    player.onGround = true;
    }
    if (player.x >= 1) {
        player.x = 1;
        player.vx = 1;
        player.onGround = true;
        }
  
    // Movement input
    if (keys["ArrowRight"]) player.vx = moveSpeed;
    else if (keys["ArrowLeft"]) player.vx = -moveSpeed;
    else player.vx = 0;
  
    // Jump
    if (keys[" "] && player.onGround) {
      player.vy = jumpStrength;
      player.onGround = false;
    }
  
    // Gravity
    player.vy += gravity;
  
    // Predict next position
    const nextX = player.x + player.vx;
    const nextY = player.y + player.vy;
  
    // Try X move
    player.x = nextX;
    let collided = solidRegions.some(region => intersects(player, region));
    if (collided) player.x = prevX;
  
    // Try Y move
    player.y = nextY;
    collided = solidRegions.some(region => intersects(player, region));
    if (collided) {
      if (player.vy < 0) player.onGround = true;
      player.vy = 0;
      player.y = prevY;
    }
  }
  

function drawRect(x, y, width, height, color) {
  const x1 = x;
  const y1 = y;
  const x2 = x + width;
  const y2 = y + height;

  const vertices = new Float32Array([
    x1, y1, 0,
    x2, y1, 0,
    x2, y2, 0,
    x1, y2, 0
  ]);

  const colors = new Float32Array([
    ...color, ...color, ...color, ...color
  ]);

  const vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  const aPosition = gl.getAttribLocation(program, "aPosition");
  gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aPosition);

  const cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
  const aColor = gl.getAttribLocation(program, "aColor");
  gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aColor);

  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

function drawSpike(x, y, direction) {
    let vertices;
    if (direction === "up") {
      vertices = new Float32Array([
        x, y, 0,
        x + 0.05, y, 0,
        x + 0.025, y + 0.05, 0
      ]);
    } else {
      vertices = new Float32Array([
        x, y, 0,
        x + 0.05, y, 0,
        x + 0.025, y - 0.05, 0
      ]);
    }
  
    const colors = new Float32Array([
      1, 0, 0, 1,
      1, 0, 0, 1,
      1, 0, 0, 1
    ]);
  
    const vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    const aPosition = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);
  
    const cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    const aColor = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aColor);
  
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  

function render() {
  updatePlayer();
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Floor
  drawRect(-1, -0.8, 2, 0.1, [0.5, 0.5, 0.5, 1]);

  // Platform (static example)
  drawRect(-0.2, -0.4, 0.4, 0.05, [0.3, 0.7, 0.3, 1]);

  // Button
  drawRect(0.6, -0.8, 0.05, 0.05, [1, 0.6, 0, 1]);

  // Door
  drawRect(-0.05, -0.8, 0.1, 0.2, [0.2, 0.5, 1, 1]);

  // Player
  drawRect(player.x, player.y, player.width, player.height, [1, 1, 1, 1]);

  // Draw solid platforms
solidRegions.forEach(r =>
    drawRect(r.x, r.y, r.width, r.height, [0.4, 0.4, 0.4, 1])
  );
  
  // Draw triangular spikes
  spikes.forEach(spike => drawSpike(spike.x, spike.y, spike.dir));
  
  // Draw green goal section on the wall
  drawRect(greenGoal.x, greenGoal.y, greenGoal.width, greenGoal.height, [0, 1, 0, 1]);  

  // Hint
  document.getElementById("hintBox").textContent = "Hint: Use ← → to move, SPACE to jump";

  requestAnimationFrame(render);
}

function intersects(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }
  