function startLevel3() {
  console.log("Starting Level 3...");
  currentLevel = 3;

  const levelIndicator = document.getElementById("levelindicator");
  if (levelIndicator) {
    levelIndicator.textContent = "Level 3";
  }

  // Clear old level data
  solidRegions.length = 0;
  spikes.length = 0;


  solidRegions.push(
    { x: -1.0, y: -0.8, width: 2.0, height: 0.1 }, // ground
    { x: -0.2, y: -0.4, width: 0.4, height: 0.05 }, // center platform
    { x: -0.7, y: -0.2, width: 0.3, height: 0.05 }, // left floating
    { x: 0.5, y: -0.1, width: 0.3, height: 0.05 } // right floating
  );


  spikes.push(
    { x: -0.4, y: -0.7, dir: "up" },
    { x: 0.3, y: -0.7, dir: "up" },
    { x: 0.75, y: -0.05, dir: "up" },
    { x: 0.15, y: -0.35, dir: "up" }
  );

  goal.x = 0.94;
  goal.y = 0.2;
  goal.width = 0.03;
  goal.height = 0.35;

  button.x = -0.625;
  button.y = -0.15;
  button.width = 0.15;
  button.height = 0.05;

  // Reset player
  player.x = -0.8;
  player.y = -0.7;
  player.vx = 0;
  player.vy = 0;
  // Reset gameplay state
  goalActivated = false;
  levelPassed = false;
  document.getElementById("levelPassedMsg").style.display = "none";

  // New hint for Level 3
  currentHint = "Hint: You can’t jump... but something else can make you.";
  document.getElementById("hintBox").textContent = "Press H to reveal Hint";
}
