// level2.js

function startLevel2() {
  console.log("Starting Level 2...");
  currentLevel=2
  // Update Level Indicator
  const levelIndicator = document.getElementById("levelindicator");
  if (levelIndicator) {
    levelIndicator.textContent = "Level 2";  // Update to Level 2
  }

  // Clear old level data
  solidRegions.length = 0;
  spikes.length = 0;

  // Add new platforms
  solidRegions.push(
    { x: -1.0, y: -0.8, width: 2.0, height: 0.1 }, // ground
    { x: -0.2, y: -0.4, width: 0.4, height: 0.05 }, // center platform
    { x: -0.7, y: -0.2, width: 0.3, height: 0.05 }, // left floating
    { x: 0.5, y: -0.1, width: 0.3, height: 0.05 }  // right floating
  );

  // Add new spikes
 spikes.push({ x: -0.4, y: -0.7, dir: "up" },
  { x: 0.3, y: -0.7, dir: "up" },
  { x: 0.75, y: -0.05, dir: "up" },
  { x: 0.15, y: -0.35, dir: "up" });

  // ⚡ Swap roles:
  // Set new "Button" where the original goal was
// Update button to where the old goal was
button.x = 0.94;
button.y = 0.2;
button.width = 0.03;
button.height = 0.35;

// Update goal to where the old button was
goal.x = -0.625;
goal.y = -0.15;
goal.width = 0.15;
goal.height = 0.05;


  // Reset player
  player.x = -0.8;
  player.y = -0.7;
  player.vx = 0;
  player.vy = 0;

  // Reset gameplay state
  goalActivated = false;
  levelPassed = false;
  document.getElementById("levelPassedMsg").style.display = "none";
  currentHint = "Look carefully: appearances can deceive";
  document.getElementById("hintBox").textContent = "Press H to reveal Hint";
 
}
