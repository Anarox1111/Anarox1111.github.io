/**
 * Game made by Anarox.
 * 
 * Dragon Repeller Mini-RPG               

 * 
 * Author:    Anarox
 * Created:   11.05.2009
 **/

import {
  healthPotion,
  commonCrate,
  rareCrate,
  legendaryCrate,
  blueScepter,
  gravityBlade,
  dragonTrident
} from './constants.js';

let currentEnemy = null;

const gameBoard = document.querySelector("#game");
const button1 = document.querySelector("#button1");
const button2 = document.querySelector("#button2");
const button3 = document.querySelector("#button3");
const allMainButtons = [button1, button2, button3];

const buttonUsernameSubmit = document.createElement("button");
const text = document.querySelector("#text");
const xpText = document.querySelector("#xpText");
const healthText = document.querySelector("#healthText");
const healthCap = document.querySelector('#health-cap')
const goldText = document.querySelector("#goldText");
const monsterStats = document.querySelector("#monsterStats");
const monsterName = document.querySelector("#monsterName");
const monsterHealth = document.querySelector("#monsterHealth");
const monsterIcon = document.querySelector("#monsterIcon");
const weaponEquipped = document.querySelector("#weaponEquipped");
const playernameInput = document.createElement("input");
const usernameField = document.querySelector("#usernameSubmit");

const tooltips = document.querySelectorAll(".tooltip .tooltiptext")
const weaponEquippedTooltip = document.querySelector("#weaponEquippedTooltip");
const weaponDmgTooltip = document.querySelector("#weaponDmgTooltip");

const backpackButton = document.getElementById('backpackTitle')
const backpackMenu = document.getElementById('backpackMenu')

let uniqueIdCounter = 0;


function randomPercentage() {
  return 0.7 + Math.random() * 0.3;
}

// Weapons
const weapons = [
  { name: "Chopsticks", type: "weapon", power: 10, icon: "🥢", xpRequired: 0, price: 0 },
  { name: "Dagger", type: "weapon", power: 30, icon: "🗡️", xpRequired: 50, price: 50 },
  { name: "Axe", type: "weapon", power: 50, icon: "🪓", xpRequired: 300, price: 150 },
  { name: "Bow", type: "weapon", power: 100, icon: "🏹", xpRequired: 800, price: 450 },
  { name: "Double sword", type: "weapon", power: 200, icon: "⚔️", xpRequired: 2500, price: 800 },
  { name: "OP Pickaxe", type: "weapon", power: 300, icon: "⛏️", xpRequired: 5000, price: 1500 },
];

let inventory = [ weapons[0] ];

// Shop prices
const prices = {
  health: 10
}

// Generating uniqueID
function generateUniqueId() {
  return ++uniqueIdCounter;
}

// Items that can be found in crates, gifts or boxes. 🧪🍎🍵🔮✨ 🍊🧃🥤
const items = [
  { name: "Apple Juice", type: "consumables", id: generateUniqueId(), healthRegain: 10, icon: "🧃", xpGain: 5},
  { name: "Apple", type: "consumables", id: generateUniqueId(), healthRegain: 20, icon: "🍎", xpGain: 10},
  { name: "Health potion", type: "consumables", id: generateUniqueId(), healthRegain: 30, icon: healthPotion, xpGain: 30},
];

// Foundables that can found after winning a combat.
const foundables = [
  { name: "Dusty box", type: "foundable", description: "Might contain something", icon: "📦", open: "openLoot", rarity: 5},
  { name: "Gift", type: "foundable", description: "Hope you have deserved it", icon: "🎁", open: "openLoot"},
  { name: "Key", type: "foundable", description: "Can open special crates.", icon: "🗝️", rarity: 15},
  { name: "Common Crate", type: "foundable", description: "Commonly uncommon..", icon: commonCrate, open: "openLoot", rarity: 20},
  { name: "Rare Crate", type: "foundable", description: "Uncommonly rare..", icon: rareCrate, open: "openLoot", rarity: 30 },
];

// Player
const player = {
  name: "",
  health: 100,
  maxHealth: 200,
  gold: 50,
  currentWeapon: weapons[0],
  xp: 0,
};
addGold(0);
// buyMaxHealth();

// Introduces playername setup if the player hasn't set a name yet.
if (player.name === "") {
  lockScreen(true)
  backpackButton.classList.add("hidden");
  playernameInput.placeholder = "Enter playername..";
  text.innerHTML = "Hello fellow player 👋 Choose a playername for your character:"
  usernameField.append(playernameInput);

  usernameField.append(buttonUsernameSubmit);
  buttonUsernameSubmit.innerText = "Apply ✅";
  buttonUsernameSubmit.onclick = submitPlayer;

  window.onload = function() {
    playernameInput.focus()
  }
} else {
  lockScreen(false)
  updateBackpackUI()
  backpackButton.classList.remove("hidden");
  text.innerText = `Welcome, ${player.name}! to Dragon Repeller. You must defeat ` +
      `the dragon that is preventing people from leaving the town. You are in ` +
      `the town square. Where do you want to go? Use the buttons above.`
}

function submitPlayer() {
  const playerName = playernameInput.value.trim(); // Trim removes excessive spaces

  if (playerName === "" || playerName.includes(" ")) {
    text.innerText = "Playername cannot contain spaces or be left blank.";
  } else if (playerName.length < 6 || playerName.length > 12) {
    text.innerText = "Playername must contain at least 6 characters and at most 12.";
  } else {
    player.name = playerName;
    text.innerText = `Welcome, ${player.name}! to Dragon Repeller. You must defeat ` +
        `the dragon that is preventing people from leaving the town. You are in ` +
        `the town square. Where do you want to go? Use the buttons above.`;
    toggleButtons(true, button1, button2, button3);
    updateBackpackUI()
    usernameField.remove()
  backpackButton.classList.remove("hidden");

  }
}

// Location "page"
const locations = [
  {
    name: "town square",
    "button text": ["Go to store 🏦", "Go to cave 🕯️", "Fight dragon 🐉"],
    "button functions": [goStore, goCave, fightDragon],
    text: "You are in the town square 🏙️",
  },
  {
    name: "store",
    "button text": [
      "Buy 10 health ❤️ (10 gold)",
      `Buy weapon 🗡️ (${weapons[1].price} gold)`,
      "Go to town square 🏙️",
    ],
    "button functions": [buyHealth, buyWeapon, goTown],
    text: "You entered the store 🏦",
  },
  {
    name: "cave",
    "button text": ["Fight snake 🐍", "Fight beast 🐊", "Go to town square 🏙️"],
    "button functions": [fightSnake, fightBeast, goTown],
    text: "You enter the cave 🐀  You see some monsters 🐉🕯️ ",
  },
];
// Enemies in caves
const caveEnemies = [
  {
    name: "Snake",
    power: 8,
    health: 100,
    defaultHealth: 100,
    "button text": ["Attack 🤺", "Run 🏃"],
    "button functions": [attackSnake, runAway],
    text: "🐍 sss.. The snake hisses aggressively..",
    icon: "🐍",
    lootXp: 50,
    lootGold: 75
  },
  {
    name: "Beast",
    power: 17,
    health: 200,
    defaultHealth: 200,
    "button text": ["Attack 🤺", "Run 🏃"],
    "button functions": [attackBeast, runAway],
    text: "ARGGGHHHH! WROOOOHA 🐊",
    icon: "🐊",
    lootXp: 100,
    lootGold: 150
  },
];

// initialize buttons
button1.onclick = goStore;
button2.onclick = goCave;
button3.onclick = fightDragon;
backpackButton.onclick = toggleBackpack;


// Updates values to the correct buttons based on location "page".
function update(location) {
  button1.innerText = location["button text"][0];
  button2.innerText = location["button text"][1];
  button3.innerText = location["button text"][2];
  button1.onclick = location["button functions"][0];
  button2.onclick = location["button functions"][1];
  button3.onclick = location["button functions"][2];
  text.innerText = location.text;

  // mod
  if (location.name == 'store') {
    button1.addEventListener('contextmenu', buyMaxHealth, { once: true });
  }
}

// Updates "page" with content based on which enemy is presented.
function updateCaveEnemies(enemy) {
  enemy.health = enemy.defaultHealth
  button1.innerText = enemy["button text"][0];
  button1.onclick = enemy["button functions"][0];

  button2.innerText = enemy["button text"][1];
  button2.onclick = enemy["button functions"][1];
  text.innerText = enemy.text;
  button3.style.visibility = "hidden";
}

// Resets visibility to "go to town square" button.
function resetTownButtonVisibility() {
  button3.style.visibility = "visible";
}

function resetAllButtonVisibility() {
  allMainButtons.forEach(button => {
    button.style.visibility = "visible";
  })
}

// Visibility switcher-function that can take as many buttons as wanted. Remaining buttons that not are called will apply the opposite.
function toggleButtons(toggle, ...buttons) {
  console.log(toggle);
  buttons.forEach(button => {
      button.style.visibility = toggle ? "visible" : "hidden";
    });

    allMainButtons.forEach(button => {
      if (!buttons.includes(button)) {
        button.style.visibility = toggle ? "hidden" : "visible";
      }
    })
  
}

// Locks all UI when set to true.
function lockScreen(isLocked) {
  if(isLocked) {
    toggleButtons(false, button1, button2, button3);
    // TODO: Make tooltips hidden when in this state
  } else {
    toggleButtons(true, button1, button2, button3)
  }
}

// goFunctions for visitng the selected location.
function goTown() {
  resetAllButtonVisibility();
  update(locations[0]);
}

function goStore() {
  resetTownButtonVisibility();
  update(locations[1]);
}

function goCave() {
  resetTownButtonVisibility();
  update(locations[2]);
}

// Boss fight!
function fightDragon() {
  if  (player.xp >= 10000) {
    text.innerText = "You won over a dragon that does not exist yet!"
  } else {
    text.innerText = "You are unfortunately not strong enough to fight the boss yet.. You need 10K ✨ "
  }
}

// Buy health from shop.
function buyHealth() {
  if (player.gold >= prices.health && player.health < player.maxHealth) {
    addGold(-prices.health);
    player.health += 10;
    text.innerText = "You bought 10 health! ❤️";

    // Secure check if player has over 200 HP, somehow.
    if (player.health >= player.maxHealth) {
      player.health = player.maxHealth;
      text.innerText = "You cannot buy more health, your health is full. ❤️";
    }

    // Update content
    healthText.innerText = player.health;
  }
}

function buyMaxHealth(e) {
  if (e && e.preventDefault) e.preventDefault();
  const hpMissing = player.maxHealth - player.health;
  const maxCanBuy = Math.min(player.gold, hpMissing);
  for (let i = 0; i < Math.floor(maxCanBuy / prices.health); i++) {
    buyHealth();
  }
}

// Buy a weapon from the store.
function buyWeapon() {
  const _currentWeaponIndex = weapons.indexOf(player.currentWeapon);
  const nextWeapon = weapons[_currentWeaponIndex + 1];

  if (!nextWeapon) {
    text.innerText = "You have already bought all weapons from the store.";
    return;
  }

  if (player.gold < nextWeapon.price) {
    text.innerText = `You do not have enough gold. Your bank currently stands at: ${player.gold} 💰`;
    return;
  }

  if (player.xp < nextWeapon.xpRequired) {
    text.innerText = `You do not have enough XP. You currently have: ${player.xp} XP.\n` +
      `XP required is: ${nextWeapon.xpRequired} ✨`;
    return;
  }

  // Pay gold for the weapon
  addGold(-nextWeapon.price);

  player.currentWeapon = nextWeapon;
  addToInventory(nextWeapon)
  const oldWeapon = weapons[_currentWeaponIndex];
  const weaponIcon = player.currentWeapon.icon;

  // Update shop price
  // `Buy weapon 🗡️ (${weapons[1].price}) gold`
  let nextAvailableWeapon = weapons[_currentWeaponIndex + 2];
  let nextWeaponPrice = nextAvailableWeapon ? nextAvailableWeapon.price : 0;
  locations[1]["button text"][1] = nextWeaponPrice ? `Buy weapon 🗡️ (${nextWeaponPrice} gold)` : 'No more weapons 🗡️ for you!'

  // Tooltip adjustments
  weaponEquippedTooltip.innerText = player.currentWeapon.name + " " + weaponIcon;
  weaponDmgTooltip.innerText = player.currentWeapon.power;

  text.innerText =
    `You upgraded from ${oldWeapon.name} ${oldWeapon.icon} to ` +
    player.currentWeapon.name + ' ' + weaponIcon;
  weaponEquipped.innerText = weaponIcon;
  player.maxHealth += 50;
  healthCap.innerText = player.maxHealth;
}
// A function to pass XP to player.
function xp(xp) {
  player.xp += xp;
  xpText.innerText = player.xp
  console.log(player.xp)
}

function addGold(gold) {
  player.gold += gold;
  goldText.innerText = player.gold;
}

// MonsterStats red box.
function showFightView() {
  toggleMonsterStats()
  updateMonsterStats()
}

// Sends player to the fighting locations.
function fightSnake() {
  currentEnemy = caveEnemies[0];
  updateCaveEnemies(currentEnemy);
  showFightView()
}

function fightBeast() {
  currentEnemy = caveEnemies[1];
  updateCaveEnemies(currentEnemy);
  showFightView()
}

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const timer = async () => {
  await delay(2000);
  text.innerText = currentEnemy.text;
};

function runAway() {
  const rand = Math.round(Math.random());
  const dmg = 50;
  const runDamage = Math.round(dmg * randomPercentage() + 0.7);

  if (rand === 1) {
    text.innerText = "You ran away! 🏃 and got 50 ✨ ";
    xp(50);
    randomLoot(foundables);
    // Make monster's stats reset based on the monster you are fighting.

    timer().then(() => {
      toggleMonsterStats();
      goTown();
    });
  } else if (player.health > runDamage) {
    player.health -= runDamage;
    text.innerText =
      "You failed to run and got attacked and lost " + runDamage + " ❤️";
    healthText.innerText = player.health;
    timer().then(() => {
      text.innerText = "You are still fighting..";
    });
  } else {
    playerDefeated();
  }
}

// Function for passing the objects to run battleRound-function.
function attackSnake() {
  battleRound(player, caveEnemies[0]);
}

function attackBeast() {
  battleRound(player, caveEnemies[1]);
}

// Monster stats
function updateMonsterStats() {
  monsterName.innerText = currentEnemy.name;
  monsterIcon.innerText = currentEnemy.icon;
  monsterHealth.innerText = "HP: " + currentEnemy.health;

  updateMonsterDmgTaken()
  
}

function updateMonsterDmgTaken(damage) {
  let monsterDmgTakenText = document.querySelector("#monsterDmgTaken");
  monsterDmgTakenText.innerText = damage ? "(-" + damage + ")" : "";
}

// Logic for fighting
function attack(attacker, target) {
  let damage;
  
  // Player attacks.
  if (attacker === player) {
    const playerDamage = attacker.currentWeapon.power;
    
    damage = Math.round(playerDamage * randomPercentage());
    target.health -= damage;
    
    // Securing for negative HP.
    target.health = Math.max(target.health, 0);
    
    text.innerText = "You attacked with " + attacker.currentWeapon.icon + " and dealt " + damage + " damage."
    updateMonsterStats()
    updateMonsterDmgTaken(damage)
    xp(1)
    
    console.log(
      `${attacker.name}, attacks ${target.name} with ${playerDamage} and deals ${damage}! ${target.name}s HP: ${target.health} `
    );
  } else {
    // Monster attacks.
    const monsterDamage = attacker.power;
    damage = Math.round(monsterDamage * randomPercentage());
    target.health -= damage;

    target.health = Math.max(target.health, 0);
    healthText.innerText = target.health;
    

    console.log(
      `${attacker.name}, attacks ${target.name} with ${attacker.power} and deals ${damage}! ${target.name}s HP: ${target.health} `
    );
  }
}

function battleRound(player, monster) {

  attack(player, monster);

  // Checks if monster is defeated.
  if (monster.health > 0) {
    attack(monster, player);

    // Checks if player is defeated.
    if (player.health <= 0) {
      playerDefeated();
    }
  } else {
    text.innerText = `You defeated the ${monster.name} 🎉 and gained ${monster.lootXp} ✨`;
    
    if (player.xp > 3000) {
      randomLoot(foundables);
    }
    
    randomLoot(items);
    
    xp(monster.lootXp);
    addGold(monster.lootGold);
    toggleMonsterStats();
    button1.style.visibility = "hidden";
    button2.style.visibility = "hidden";
    resetTownButtonVisibility();

    monster.defaultHealth = Math.round(monster.defaultHealth * 1.1);
    monster.health = monster.defaultHealth;
    console.log("Monster defeated's new defaultHealth: " + monster.health);
    currentEnemy = null; //
  }
}

function playerDefeated() {
  text.innerText = "💀 You have been defeated! 💀 Game over.";
  healthText.innerText = 0;
  lockScreen(true);
  backpackMenu.classList.add('hidden')
  backpackButton.classList.add('hidden')

  gameBoard.style.backgroundColor = "#1a1818";
  toggleMonsterStats()
}

function toggleMonsterStats() {
  monsterStats.classList.toggle("hidden");
}

// Backpack & Inventory

function updateBackpackUI() {
  const cards = document.getElementById("backpackMenu");
  cards.innerHTML = "";

  inventory.forEach(item => {
    const card = document.createElement('div');
    card.classList.add("card");

    switch(item.type) {
      case "weapon":
        card.innerHTML = `
            <div class="emoji">${item.icon}</div>
            <div class="title">${item.name}</div>
            <div class="power">Power: ${item.power}</div>
        `;
        card.addEventListener("click", () => equipWeapon(item));
        break;

      case "consumables":
        card.innerHTML = `
          <div class="emoji">${item.icon}</div>
          <div class="title">${item.name}</div>
          <div class="gain">Gain: ${item.healthRegain} HP</div>
          <div class="xpGain">${item.xpGain} ✨</div>
        `;
        card.addEventListener("click", () => consume(item));
        break;
      
      case "foundable":
        card.innerHTML = `
          <div class="emoji">${item.icon}</div>
          <div class="title">${item.name}</div>
          <div class="desc">${item.description}</div>
        `;
        break;
      
      default:
        card.innerHTML = `
          <div class="emoji">❓</div>
          <div class="title">Unknown Item</div>
        `;
        break;
    }
    

        cards.appendChild(card);
  })

}

function consume(item) {
  if (player.health != player.maxHealth) {
    player.health = Math.min(player.health + item.healthRegain, player.maxHealth);
    healthText.innerText = player.health;
  
    xp(item.xpGain)
    text.innerText = `You gained ${item.healthRegain} ❤️ from: ${item.name}. You earned ${item.xpGain} ✨`
    console.log("Before filtering:", inventory);
    console.log("Item to remove:", item);
    inventory = inventory.filter((invItem) => invItem.id !== item.id);
    updateBackpackUI();
    console.log("After filtering:", inventory);
  } else {
    text.innerText = "You already have max capacity! ❤️";
  }
  
}

function equipWeapon(weapon) {
  if(player.currentWeapon === weapon) {
    console.log("You already have equipped this weapon");
  } else {
    player.currentWeapon = weapon;
  }
  
}

// Adds a random consumable-item to the inventory, RNG 1/10
function randomLoot(o) {
  const randomNum = Math.floor(Math.random() * 10 ) + 1;
  

  var randomItem = o[Math.floor(Math.random()*o.length)];

  if(randomNum === 10) {
    addToInventory(randomItem);
    text.innerHTML = `You found: ${randomItem.name}`
  }

}


function toggleBackpack() {
  backpackMenu.classList.toggle('hidden');
}

function addToInventory(item) {
  inventory.push(item)
  updateBackpackUI()
}

