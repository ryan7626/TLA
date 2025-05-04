
"use strict";

let gl;
let program;
let currentLevel = 1;
let isPaused = false;
let fxCanvas, fxCtx;
let bloodParticles = [];
let confettiParticles = [];
let tempPlatforms = [];
let initPlatforms = [];
// Player state
let player = {
  x: -0.8,
  y: -0.7,
  width: 0.05,
  height: 0.1,
  vx: 0,
  vy: 0,
  onGround: false,
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
  { x: 0.5, y: -0.1, width: 0.3, height: 0.05 }, // right floating
];

// Hazardous spikes
const spikes = [
  { x: -0.4, y: -0.7, dir: "up" },
  { x: 0.3, y: -0.7, dir: "up" },
  { x: 0.75, y: -0.05, dir: "up" },
  { x: 0.15, y: -0.35, dir: "up" },
];

// Interactive button and goal
const button = { x: -0.625, y: -0.15, width: 0.15, height: 0.05 };
const goal = { x: 0.94, y: 0.2, width: 0.03, height: 0.35 };
let goalActivated = false;
let levelPassed = false;

// Input tracking
const keys = {};
initPlatforms.push(
  { x: -0.2, y: -0.4, width: 0.4, height: 0.05 }, // center platform
  { x: -0.7, y: -0.2, width: 0.3, height: 0.05 }, // left floating
  { x: 0.5, y: -0.1, width: 0.3, height: 0.05 } // right floating
  );
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
  document.addEventListener("keydown", (e) => (keys[e.key] = true));
  document.addEventListener("keyup", (e) => (keys[e.key] = false));

  document.addEventListener("keydown", (e) => {
    keys[e.key] = true;

    // Show hint when 'h' is pressed
    if (e.key === "h" || e.key === "H") {
      const hintBox = document.getElementById("hintBox");
      document.getElementById("hintBox").textContent = currentHint;
    }
  });

  // Reset button handler
  document.getElementById("resetLevel").addEventListener("click", () => {
    isPaused = false;
    player.x = -0.8;
    player.y = -0.7;
    player.vx = 0;
    player.vy = 0;
    goalActivated = false;
    levelPassed = false;
    tempPlatforms = initPlatforms.map(p => ({ ...p }));
    document.getElementById("levelPassedMsg").style.display = "none";
    
    document.getElementById("hintBox").textContent = "Press H to reveal Hint";
  });

  document.getElementById("nextLevel").addEventListener("click", () => {
    isPaused = false;
    if (currentLevel === 1) {
      loadNextScript("level2.js");
    } else if (currentLevel === 2) {
      loadNextScript("level3.js");
    }else if (currentLevel === 3) {
      loadNextScript("level4.js");
    }else if (currentLevel === 4) {
      loadNextScript("level5.js");
    }
    
  });

  document.getElementById("restartGame").addEventListener("click", () => {
    isPaused = false;
    tempPlatforms = initPlatforms.map(p => ({ ...p }));
    restartGame();
  });
  const bgMusic = document.getElementById("bgMusic");
  bgMusic.volume = 0.1;
  bgMusic.play().catch((e) => {
    console.warn("Music play blocked until user interaction.");
  });

  requestAnimationFrame(render);
  fxCanvas = document.getElementById("fx-canvas");
  fxCtx = fxCanvas.getContext("2d");

};
function restartGame() {
  console.log("Restarting Game to Level 1...");

  // Set back to Level 1
  currentLevel = 1;


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
  const script = document.createElement("script");
  script.src = src;
  script.onload = () => {
    console.log(src + " loaded!");

    if (src === "level2.js" && typeof startLevel2 === "function") {
      startLevel2();
    } else if (src === "level3.js" && typeof startLevel3 === "function") {
      startLevel3();
    }else if (src === "level4.js" && typeof startLevel4 === "function") {
      startLevel4();
    }else if (src === "level5.js" && typeof startLevel5 === "function") {
      startLevel5();
    }
    
  };
  document.body.appendChild(script);
}

function updatePlayer() {
  const prevX = player.x;
  const prevY = player.y;

  // Movement input
  if (currentLevel == 4) {
    // Flipped control scheme
    if (keys["ArrowRight"]) player.vx = -moveSpeed;  // Right = Left
    else if (keys["ArrowUp"]) player.vx = moveSpeed; // Up = Right
    else player.vx = 0;
  
    if (keys["ArrowLeft"] && player.onGround) {      // Left = Jump
      player.vy = jumpStrength;
      player.onGround = false;
  
      const jumpSound = document.getElementById("jumpSound");
      jumpSound.volume = 0.4;
      jumpSound.currentTime = 0;
      jumpSound.play();
    }
  } else {
    // Normal controls
    if (keys["ArrowRight"]) player.vx = moveSpeed;
    else if (keys["ArrowLeft"]) player.vx = -moveSpeed;
    else player.vx = 0;
  
    if ((keys[" "] && player.onGround) || (keys["ArrowUp"] && player.onGround) && (currentLevel == 1 || currentLevel==2||currentLevel ==5)) {
      player.vy = jumpStrength;
      player.onGround = false;
  
      const jumpSound = document.getElementById("jumpSound");
      jumpSound.volume = 0.4;
      jumpSound.currentTime = 0;
      jumpSound.play();
    }
  }
  




  // Gravity
  player.vy += gravity;

  // Predict next position
  const nextX = player.x + player.vx;
  const nextY = player.y + player.vy;



  


// Horizontal collision
  player.x = nextX;
  let allPlatforms = solidRegions.concat(tempPlatforms)
  let collided = allPlatforms.some((region) => intersects(player, region));
  if (collided) player.x = prevX;

  // Vertical collision
  player.y = nextY;
  collided = allPlatforms.some((region) => intersects(player, region));
  if (collided) {
    if (player.vy < 0) player.onGround = true;
    player.vy = 0;
    player.y = prevY;
  }


 
 

 
  if (player.y <= -0.7) {
    player.y = -0.7;
    player.vy = 0;
    player.onGround = true;
  }

  
  if (player.x <= -1) player.x = -1;
  if (player.x >= 0.95) player.x = 0.95;

  // Spike reset
  spikes.forEach((spike) => {
    const spikeBox = { x: spike.x, y: spike.y, width: 0.05, height: 0.05 };
    if (intersects(player, spikeBox)) {
      if (currentLevel === 3) {
        const jumpSound = document.getElementById("jumpSound");
        jumpSound.volume = 1;
        jumpSound.currentTime = 0;
        jumpSound.play();
        player.vy = 0.05; 
        player.onGround = false;
      } else {
        // In other levels: spike kills
        const deathSound = document.getElementById("deathSound");
        deathSound.currentTime = 0;
        deathSound.volume =1
        deathSound.play();
        isPaused = true;
        player.vx = 0;
        player.vy = 0;
        tempPlatforms = initPlatforms.map(p => ({ ...p }));
        spawnBlood(player.x * 400 + 400, (1 - player.y) * 300); 
        setTimeout(() => {
          player.x = -0.8;
          player.y = -0.7;
          player.vx = 0;
          player.vy = 0;
          goalActivated = false;
          levelPassed = false;
          tempPlatforms = initPlatforms.map(p => ({ ...p }));
          document.getElementById("levelPassedMsg").style.display = "none";
          isPaused = false;
        }, 1000); 
          
      }
    }
  });

  // Button press triggers goal
  if (intersects(player, button)) goalActivated = true;
  if (
    (currentLevel === 1 || currentLevel === 2) &&
    ((keys[" "] && player.onGround) || (keys["ArrowUp"] && player.onGround))
  ) {
    player.vy = jumpStrength;
    player.onGround = false;
  
    const jumpSound = document.getElementById("jumpSound");
    jumpSound.volume = 0.4;
    jumpSound.currentTime = 0;
    jumpSound.play();
  }
  // Goal reached
  if (goalActivated && intersects(player, goal)) {
    if (!levelPassed) {
      levelPassed = true;
      isPaused = true; 
      document.getElementById("levelPassedMsg").style.display = "block";
      spawnConfetti();
      const goalSound = document.getElementById("goalSound");
      goalSound.volume = 0.4;
      tempPlatforms = initPlatforms;
      goalSound.play();
  
      
      
    }
  }
  tempPlatforms.forEach((platform) => {
    if (!platform.touched) {
      // Check if the player is standing on or overlapping
      const extendedBox = {
        x: platform.x - 0.01,
        y: platform.y - 0.01,
        width: platform.width + 0.02,
        height: platform.height + 0.02
      };
      if (intersects(player, extendedBox)) {
        platform.touched = true;
        setTimeout(() => {
          platform.removed = true;
        }, 400);
      }
    }
  });
  
  tempPlatforms = tempPlatforms.filter(p => !p.removed);

}
function spawnBlood(x, y) {
  for (let i = 0; i < 20; i++) {
    bloodParticles.push({
      x, y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      alpha: 1,
    });
  }
}
function spawnConfetti() {
  for (let i = 0; i < 40; i++) {
    confettiParticles.push({
      x: Math.random() * 800,
      y: Math.random() * 600,
      vx: (Math.random() - 0.5) * 1,
      vy: Math.random() * -3,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`,
      angle: Math.random() * Math.PI * 2,
    });
  }
}

function render() {
  if (!isPaused) {
    updatePlayer();
  }
  gl.clear(gl.COLOR_BUFFER_BIT);
  

  // Draw level platforms
  solidRegions.forEach((r) =>
    drawRect(r.x, r.y, r.width, r.height, [0.4, 0.4, 0.4, 1])
  );
  tempPlatforms.forEach((r) =>
    drawRect(r.x, r.y, r.width, r.height, [0.4, 0.4, 0.4, 1]) // orange-ish
  );
  

  if (currentLevel === 1 ||currentLevel=== 3|| currentLevel===4 ||currentLevel ===5) {
    // Normal Level 1 colors
    drawRect(button.x, button.y, button.width, button.height, [0.2, 0.7, 1, 1]); // blue button
    const goalColor = goalActivated ? [0, 1, 0, 1] : [1, 1, 0, 1]; // green if activated, else yellow
    drawRect(goal.x, goal.y, goal.width, goal.height, goalColor);
  } else if (currentLevel === 2) {
    drawRect(button.x, button.y, button.width, button.height, [1, 1, 0, 1]); 
    const goalColor = goalActivated ? [0, 1, 0, 1] : [0.2, 0.7, 1, 1]; // green if activated, else blue
    drawRect(goal.x, goal.y, goal.width, goal.height, goalColor);
  }

  // Draw spikes
  spikes.forEach((spike) => drawSpike(spike.x, spike.y, spike.dir));

  // Draw player
  drawRect(player.x, player.y, player.width, player.height, [1, 1, 1, 1]);

  fxCtx.clearRect(0, 0, 800, 600);

  // Blood particles
  bloodParticles.forEach((p) => {
    fxCtx.fillStyle = `rgba(255, 0, 0, ${p.alpha})`;
    fxCtx.beginPath();
    fxCtx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    fxCtx.fill();
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.1;
    p.alpha -= 0.02;
  });
  bloodParticles = bloodParticles.filter(p => p.alpha > 0);

  // Confetti
  confettiParticles.forEach((p) => {
    fxCtx.fillStyle = p.color;
    fxCtx.fillRect(p.x, p.y, 4, 8);
    p.y += 2;
    p.x += p.vx;
  });
  confettiParticles = confettiParticles.filter(p => p.y < 600);

  requestAnimationFrame(render);
}

function drawRect(x, y, width, height, color) {
  const vertices = new Float32Array([
    x,y,0,x + width,y,0,x + width,y + height,0,x,y + height,0,
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
  const vertices =
    direction === "up"
      ? [x, y, 0, x + 0.05, y, 0, x + 0.025, y + 0.05, 0]
      : [x, y, 0, x + 0.05, y, 0, x + 0.025, y - 0.05, 0];

  const vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  const aPosition = gl.getAttribLocation(program, "aPosition");
  gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aPosition);

  const red = new Float32Array([1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1]);

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
