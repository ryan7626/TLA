// main.js
"use strict";

let gl;
let program;
let currentLevel = 1;
// Player state
let player = {
  x: -0.8,
  y: -0.7,
  width: 0.05,
  height: 0.1,
  vx: 0,
  vy: 0,
  onGround: false
};
let currentHint = "Hint: Press the button to activate the goal";  


// Game constants
const gravity = -0.002;
const jumpStrength = 0.05;
const moveSpeed = 0.01;

// Level geometry
const solidRegions = [
  { x: -1.0, y: -0.8, width: 2.0, height: 0.1 }, // ground
  { x: -0.2, y: -0.4, width: 0.4, height: 0.05 }, // center platform
  { x: -0.7, y: -0.2, width: 0.3, height: 0.05 }, // left floating
  { x: 0.5, y: -0.1, width: 0.3, height: 0.05 }  // right floating
];

// Hazardous spikes
const spikes = [
  { x: -0.4, y: -0.7, dir: "up" },
  { x: 0.3, y: -0.7, dir: "up" },
  { x: 0.75, y: -0.05, dir: "up" },
  { x: 0.15, y: -0.35, dir: "up" }
];

// Interactive button and goal
const button = { x: -0.625, y: -0.15, width: 0.15, height: 0.05 };
const goal = { x: 0.94, y: 0.2, width: 0.03, height: 0.35 };
let goalActivated = false;
let levelPassed = false;

// Input tracking
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

  document.addEventListener("keydown", e => {
    keys[e.key] = true;
  
    // Show hint when 'h' is pressed
    if (e.key === "h" || e.key === "H") {
      const hintBox = document.getElementById("hintBox");
      document.getElementById("hintBox").textContent = currentHint;
    }});
  
  

  // Reset button handler
  document.getElementById("resetLevel").addEventListener("click", () => {
    player.x = -0.8;
    player.y = -0.7;
    player.vx = 0;
    player.vy = 0;
    goalActivated = false;
    levelPassed = false;
    document.getElementById("levelPassedMsg").style.display = "none";
    document.getElementById("levelPassedMsg").style.display = "none";
    document.getElementById("hintBox").textContent = "Press H to reveal Hint"

    
  });
  

  
  document.getElementById("nextLevel").addEventListener("click", () => {
    if (currentLevel === 1) {
      loadNextScript("level2.js");
    } else if (currentLevel === 2) {
      loadNextScript("level3.js");
    }
  });
  
  document.getElementById("restartGame").addEventListener("click", () => {
    restartGame();
  });
  requestAnimationFrame(render);

};
function restartGame() {
  console.log("Restarting Game to Level 1...");

  // Set back to Level 1
  currentLevel = 1;

  // Reset player
  player.x = -0.8;
  player.y = -0.7;
  player.vx = 0;
  player.vy = 0;

  // Reset Level Geometry
  solidRegions.length = 0;
  solidRegions.push(
    { x: -1.0, y: -0.8, width: 2.0, height: 0.1 },
    { x: -0.2, y: -0.4, width: 0.4, height: 0.05 },
    { x: -0.7, y: -0.2, width: 0.3, height: 0.05 },
    { x: 0.5, y: -0.1, width: 0.3, height: 0.05 }
  );

  spikes.length = 0;
  spikes.push(
    { x: -0.4, y: -0.7, dir: "up" },
    { x: 0.3, y: -0.7, dir: "up" },
    { x: 0.75, y: -0.05, dir: "up" },
    { x: 0.15, y: -0.35, dir: "up" }
  );

  // Reset button and goal positions
  button.x = -0.625;
  button.y = -0.15;
  button.width = 0.15;
  button.height = 0.05;

  goal.x = 0.94;
  goal.y = 0.2;
  goal.width = 0.03;
  goal.height = 0.35;

  // Reset game state
  goalActivated = false;
  levelPassed = false;
  document.getElementById("levelPassedMsg").style.display = "none";

  // Reset hint
  currentHint = "Hint: Press the button to activate the goal";
  document.getElementById("hintBox").textContent = "Press H to reveal Hint";

  // Update level indicator
  document.getElementById("levelindicator").textContent = "Level 1";
}


function loadNextScript(src) {
  const script = document.createElement('script');
  script.src = src;
  script.onload = () => {
    console.log(src + " loaded!");

    if (src === "level2.js" && typeof startLevel2 === "function") {
      startLevel2();
    } else if (src === "level3.js" && typeof startLevel3 === "function") {
      startLevel3();
    }
  };
  document.body.appendChild(script);
}


function updatePlayer() {
  const prevX = player.x;
  const prevY = player.y;

  // Movement input
  if (keys["ArrowRight"]) player.vx = moveSpeed;
  else if (keys["ArrowLeft"]) player.vx = -moveSpeed;
  else player.vx = 0;

  // Jumping
  if ((currentLevel === 1 || currentLevel === 2) && (keys[" "] && player.onGround || (keys["ArrowUp"]) && player.onGround)) {
    player.vy = jumpStrength;
    player.onGround = false;
  }
  // 🚫 No jumping allowed in Level 3
  

  // Gravity
  player.vy += gravity;

  // Predict next position
  const nextX = player.x + player.vx;
  const nextY = player.y + player.vy;

  // Horizontal collision
  player.x = nextX;
  let collided = solidRegions.some(region => intersects(player, region));
  if (collided) player.x = prevX;

  // Vertical collision
  player.y = nextY;
  collided = solidRegions.some(region => intersects(player, region));
  if (collided) {
    if (player.vy < 0) player.onGround = true;
    player.vy = 0;
    player.y = prevY;
  }

  // Ground clamp
  if (player.y <= -0.7) {
    player.y = -0.7;
    player.vy = 0;
    player.onGround = true;
  }

  // Wall clamp
  if (player.x <= -1) player.x = -1;
  if (player.x >= 0.95) player.x = 0.95;

  // Spike reset
  spikes.forEach(spike => {
    const spikeBox = { x: spike.x, y: spike.y, width: 0.05, height: 0.05 };
    if (intersects(player, spikeBox)) {
      if (currentLevel === 3) {
        // In Level 3: Spike makes player bounce!
        player.vy = 0.05;  // 💥 strong upward jump
        player.onGround = false;
      } else {
        // In other levels: spike kills
        player.x = -0.8;
        player.y = -0.7;
        player.vx = 0;
        player.vy = 0;
        goalActivated = false;
        levelPassed = false;
        document.getElementById("levelPassedMsg").style.display = "none";
       //document.getElementById("hintBox").textContent = "Press H to reveal Hint";
      }
    }
  });
  

  // Button press triggers goal
  if (intersects(player, button)) goalActivated = true;

  // Goal reached
  if (goalActivated && intersects(player, goal)) {
    levelPassed = true;
    document.getElementById("levelPassedMsg").style.display = "block";
  }
}

function render() {
  updatePlayer();
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw level platforms
  solidRegions.forEach(r => drawRect(r.x, r.y, r.width, r.height, [0.4, 0.4, 0.4, 1]));

  if (currentLevel === 1||3) {
    // Normal Level 1 colors
    drawRect(button.x, button.y, button.width, button.height, [0.2, 0.7, 1, 1]);  // blue button
    const goalColor = goalActivated ? [0, 1, 0, 1] : [1, 1, 0, 1];  // green if activated, else yellow
    drawRect(goal.x, goal.y, goal.width, goal.height, goalColor);
  } else if (currentLevel === 2) {
    drawRect(button.x, button.y, button.width, button.height, [1, 1, 0, 1]);  // blue button
    const goalColor = goalActivated ? [0, 1, 0, 1] : [0.2, 0.7, 1, 1];  // green if activated, else yellow
    drawRect(goal.x, goal.y, goal.width, goal.height, goalColor);
  }

  // Draw spikes
  spikes.forEach(spike => drawSpike(spike.x, spike.y, spike.dir));

  // Draw player
  drawRect(player.x, player.y, player.width, player.height, [1, 1, 1, 1]);

  requestAnimationFrame(render);
}

function drawRect(x, y, width, height, color) {
  const vertices = new Float32Array([
    x, y, 0,
    x + width, y, 0,
    x + width, y + height, 0,
    x, y + height, 0
  ]);

  const colors = new Float32Array(new Array(4).fill(color).flat());

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
  const vertices = direction === "up"
    ? [x, y, 0, x + 0.05, y, 0, x + 0.025, y + 0.05, 0]
    : [x, y, 0, x + 0.05, y, 0, x + 0.025, y - 0.05, 0];

  const vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  const aPosition = gl.getAttribLocation(program, "aPosition");
  gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aPosition);

  const red = new Float32Array([
    1, 0, 0, 1,
    1, 0, 0, 1,
    1, 0, 0, 1
  ]);

  const cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, red, gl.STATIC_DRAW);
  const aColor = gl.getAttribLocation(program, "aColor");
  gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aColor);

  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function intersects(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}