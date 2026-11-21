
// CITY BOY - Game Controls and City System

const canvas = document.getElementById("game");
const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);

scene.clearColor = new BABYLON.Color4(0.48, 0.68, 0.79, 1);

// CAMERA
const camera = new BABYLON.ArcRotateCamera(
  "camera",
  -Math.PI / 2,
  1.12,
  25,
  new BABYLON.Vector3(0, 1, 0),
  scene
);
camera.attachControl(canvas, true);
camera.lowerRadiusLimit = 12;
camera.upperRadiusLimit = 32;
camera.wheelPrecision = 60;

// LIGHTING
const light = new BABYLON.HemisphericLight(
  "light",
  new BABYLON.Vector3(0, 1, 0),
  scene
);
light.intensity = 0.9;

const sun = new BABYLON.DirectionalLight(
  "sun",
  new BABYLON.Vector3(-0.4, -1, 0.5),
  scene
);
sun.intensity = 0.6;

// MATERIALS
function makeMaterial(name, color) {
  const material = new BABYLON.StandardMaterial(name, scene);
  material.diffuseColor = BABYLON.Color3.FromHexString(color);
  return material;
}

const grass = makeMaterial("grass", "#668d70");
const road = makeMaterial("road", "#303b49");
const pavement = makeMaterial("pavement", "#b9c2c7");

// CITY ENVIRONMENT
const ground = BABYLON.MeshBuilder.CreateGround(
  "ground",
  { width: 100, height: 100 },
  scene
);
ground.material = grass;

function makeBuilding(name, x, z, width, depth, height, color) {
  const building = BABYLON.MeshBuilder.CreateBox(
    name,
    { width, depth, height },
    scene
  );
  building.position.set(x, height / 2, z);
  building.material = makeMaterial(name + "Material", color);
}

function makeBlock(name, x, z, width, depth, height, material) {
  const block = BABYLON.MeshBuilder.CreateBox(
    name,
    { width, depth, height },
    scene
  );
  block.position.set(x, height / 2, z);
  block.material = material;
}

makeBlock("mainRoad", 0, 0, 12, 70, 0.08, road);
makeBlock("leftWalk", -7, 0, 2, 70, 0.12, pavement);
makeBlock("rightWalk", 7, 0, 2, 70, 0.12, pavement);

for (let z = -27; z <= 28; z += 9) {
  makeBuilding("leftBuilding", -12, z, 7, 6, 12, "#73869a");
  makeBuilding("rightBuilding", 12, z, 7, 6, 15, "#526b83");
}

for (let z = -30; z <= 30; z += 5) {
  makeBlock("roadMarking", 0, z, 0.16, 2, 0.025,
    makeMaterial("marking" + z, "#f3d978"));
}

// PLAYER
const player = BABYLON.MeshBuilder.CreateCapsule(
  "player",
  { height: 2, radius: 0.42 },
  scene
);
player.position.set(0, 1, 0);
player.material = makeMaterial("playerMaterial", "#35a9e8");

const head = BABYLON.MeshBuilder.CreateSphere(
  "playerHead",
  { diameter: 0.62 },
  scene
);
head.position.y = 1.25;
head.parent = player;
head.material = makeMaterial("skin", "#9a6245");

// CONTROL SETTINGS
const keys = {};
const touch = {};
let sprinting = false;
let jumping = false;
let jumpVelocity = 0;
let jumpHeight = 0;

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  keys[key] = true;

  if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)) {
    event.preventDefault();
  }

  if (key === " " && !jumping) {
    jumping = true;
    jumpVelocity = 7;
  }

  if (key === "shift") sprinting = true;
});

window.addEventListener("keyup", (event) => {
  const key = event.key.toLowerCase();
  keys[key] = false;

  if (key === "shift") sprinting = false;
});

// EXISTING MOBILE DIRECTION BUTTONS
document.querySelectorAll("[data-move]").forEach((button) => {
  const direction = button.dataset.move;

  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    touch[direction] = true;
  });

  ["pointerup", "pointerleave", "pointercancel"].forEach((eventName) => {
    button.addEventListener(eventName, () => {
      touch[direction] = false;
    });
  });
});

// ADD EXTRA MOBILE ACTION BUTTONS
const mobileControls = document.querySelector(".mobile-controls");

if (mobileControls) {
  const actionPanel = document.createElement("div");
  actionPanel.style.cssText =
    "display:flex;flex-direction:column;gap:7px;align-items:center;";

  actionPanel.innerHTML = `
    <button id="sprintControl" style="background:#315d83;color:white;padding:10px;">SPRINT</button>
    <button id="jumpControl" style="background:#43c5ff;color:#06111c;padding:10px;">JUMP</button>
    <button id="interactControl" style="background:#e8b94e;color:#211707;padding:10px;">INTERACT</button>
  `;

  mobileControls.appendChild(actionPanel);

  const sprintButton = document.getElementById("sprintControl");

  sprintButton.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    sprinting = true;
  });

  ["pointerup", "pointerleave", "pointercancel"].forEach((eventName) => {
    sprintButton.addEventListener(eventName, () => {
      sprinting = false;
    });
  });

  document.getElementById("jumpControl").addEventListener("click", () => {
    if (!jumping) {
      jumping = true;
      jumpVelocity = 7;
    }
  });

  document.getElementById("interactControl").addEventListener("click", showInteraction);
}

// INTERACTION MESSAGE
function showInteraction() {
  const message = document.getElementById("shopMessage");
  if (message) {
    message.textContent = "Welcome to CITY BOY! Explore the city and visit the Style Shop.";
  }
}

window.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "e") {
    showInteraction();
  }
});

// GAME MOVEMENT
scene.onBeforeRenderObservable.add(() => {
  const delta = Math.min(engine.getDeltaTime() / 1000, 0.05);

  let forward =
    keys.w || keys.arrowup || touch.forward ? 1 : 0;

  let backward =
    keys.s || keys.arrowdown || touch.back ? 1 : 0;

  let left =
    keys.a || keys.arrowleft || touch.left ? 1 : 0;

  let right =
    keys.d || keys.arrowright || touch.right ? 1 : 0;

  let moveX = right - left;
  let moveZ = backward - forward;

  const length = Math.hypot(moveX, moveZ);

  if (length > 0) {
    moveX /= length;
    moveZ /= length;

    const speed = sprinting ? 9 : 5;
    player.position.x += moveX * speed * delta;
    player.position.z += moveZ * speed * delta;

    player.rotation.y = Math.atan2(moveX, moveZ);
  }

  // KEEP PLAYER INSIDE THE CITY AREA
  player.position.x = BABYLON.Scalar.Clamp(
    player.position.x, -5.2, 5.2
  );
  player.position.z = BABYLON.Scalar.Clamp(
    player.position.z, -32, 32
  );

  // SIMPLE JUMP
  if (jumping) {
    jumpHeight += jumpVelocity * delta;
    jumpVelocity -= 18 * delta;

    if (jumpHeight <= 0) {
      jumpHeight = 0;
      jumpVelocity = 0;
      jumping = false;
    }
  }

  player.position.y = 1 + jumpHeight;

  // SMOOTH FOLLOW CAMERA
  camera.target.x += (player.position.x - camera.target.x) * 0.08;
  camera.target.z += (player.position.z - camera.target.z) * 0.08;
});

// CITY CASH
let cash = Number(localStorage.getItem("cityCash") || 250);
let owned = JSON.parse(
  localStorage.getItem("cityOwned") || '["default"]'
);

const cashElement = document.getElementById("cash");

function updateCash() {
  cashElement.textContent = cash;
  localStorage.setItem("cityCash", cash);
}

updateCash();

// CITY SHIFT REWARD
document.getElementById("shiftBtn").onclick = () => {
  cash += 50;
  updateCash();

  document.getElementById("shopMessage").textContent =
    "Great work! You earned 50 City Cash.";
};

// ENTER CITY
document.getElementById("enterBtn").onclick = () => {
  document.querySelector(".game-wrap").scrollIntoView({
    behavior: "smooth"
  });
  canvas.focus();
};

// STYLE SHOP
const shop = document.getElementById("shop");

document.getElementById("shopBtn").onclick = () => {
  shop.classList.remove("hidden");
};

document.getElementById("closeShop").onclick = () => {
  shop.classList.add("hidden");
};

// OUTFIT SHOP
const outfits = {
  blue: "#35a9e8",
  gold: "#d7a83e",
  violet: "#9b72d8"
};

document.querySelectorAll("[data-buy]").forEach((button) => {
  button.onclick = () => {
    const id = button.dataset.buy;
    const cost = Number(button.dataset.cost);
    const message = document.getElementById("shopMessage");

    if (owned.includes(id)) {
      player.material.diffuseColor =
        BABYLON.Color3.FromHexString(outfits[id]);
      message.textContent = "Outfit equipped!";
      return;
    }

    if (cash < cost) {
      message.textContent = "Not enough City Cash. Complete a City Shift first.";
      return;
    }

    cash -= cost;
    owned.push(id);

    localStorage.setItem("cityOwned", JSON.stringify(owned));
    updateCash();

    player.material.diffuseColor =
      BABYLON.Color3.FromHexString(outfits[id]);

    message.textContent = "New outfit purchased and equipped!";
    button.textContent = "OWNED · EQUIP";
  };
});

// START GAME
engine.runRenderLoop(() => {
  scene.render();
});

window.addEventListener("resize", () => {
  engine.resize();
});
