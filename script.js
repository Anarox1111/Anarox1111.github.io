/**
 * Game made by Anarox.
 * 
 * Dragon Repeller Mini-RPG               

 * 
 * Author:    Anarox
 * Created:   21.01.25
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
const controls = document.querySelector('#controls');
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

const tooltips = document.querySelectorAll(".tooltip .tooltiptext");
const weaponEquippedTooltip = document.querySelector("#weaponEquippedTooltip");
const weaponDmgTooltip = document.querySelector("#weaponDmgTooltip");

const backpackHead = document.getElementById('backpackHead');
const backpackButton = document.getElementById('backpackTitle');
const backpackMenu = document.getElementById('backpackMenu');

let uniqueIdCounter = 0;


function randomPercentage() {
  return 0.4 + Math.random() * 0.6;
}

// Classes
class Weapon {
  card = document.createElement('div');
  name = '';
  power = 0;
  icon = '';
  xpRequired = 0;
  price = 0;

  constructor(name, power, icon, xpRequired, price) {
    this.name = name;
    this.power = power;
    this.icon = icon;
    this.xpRequired = xpRequired;
    this.price = price;
    this.createInventoryCard();
  }

  createInventoryCard() {
    this.card.classList.add("card");

    this.card.innerHTML = `
        <div class="emoji">${this.icon}</div>
        <div class="title">${this.name}</div>
        <div class="power">Power: ${this.power}</div>
    `;

    this.card.addEventListener('click', e => {
      this.equipWeapon();
    });
  }
  
  equipWeapon() {
    if(player.currentWeapon === this) {
      console.log("You already have equipped this weapon");
    } else {
      player.currentWeapon = this;
    }
  }
}

class Consumable {
  card = document.createElement('div');
  name = '';
  healthRegain = 0;
  icon = '';
  xpGain = 0;
  consumed = false;

  constructor(name, healthRegain, icon, xpGain) {
    this.name = name;
    this.healthRegain = healthRegain;
    this.icon = icon;
    this.xpGain = xpGain;
    this.createInventoryCard();
  }

  createInventoryCard() {
    this.card.classList.add("card");

    this.card.innerHTML = `
        <div class="emoji">${this.icon}</div>
        <div class="title">${this.name}</div>
        <div class="gain">Gain: ${this.healthRegain} HP</div>
        <div class="xpGain">${this.xpGain} ✨</div>
    `;

    this.card.addEventListener('click', e => {
      if (!this.consumed) this.consume();
    });
  }

  consume() {
    this.consumed = true;
    player.health += this.healthRegain;
    healthText.innerText = player.health;
    
    xp(this.xpGain);
    console.log("You gained " + this.healthRegain + " from " + this.name);

    updateBackpackUI();
  }
}

class Foundable {
  card = document.createElement('div');
  name = '';
  description = '';
  icon = '';
  rarity = 0;
  opened = false;

  constructor(name, description, icon, rarity) {
    this.name = name;
    this.description = description;
    this.icon = icon;
    this.rarity = rarity;
    this.createInventoryCard();
  }

  createInventoryCard() {
    this.card.classList.add("card");

    this.card.innerHTML = `
        <div class="emoji">${this.icon}</div>
        <div class="title">${this.name}</div>
        <div class="desc">Gain: ${this.description}</div>
    `;

    this.card.addEventListener('click', e => {
      if (!this.opened) this.openLoot();
    });
  }

  openLoot() {
    this.opened = true;
    addGold(100);
    updateBackpackUI();
  }
}

// Weapons
const weapons = [
  new Weapon('Chopsticks', 20, '🥢', 0, 0),
  new Weapon('Dagger', 35, '🗡️', 200, 100),
  new Weapon('Axe', 55, '🪓', 600, 300),
  new Weapon('Bow', 130, '🏹', 1800, 800),
  new Weapon('Double sword', 300, '⚔️', 3500, 2000),
  new Weapon('OP Pickaxe', 700, '⛏️', 6000, 4000),
  new Weapon('Robo-Arm', 2000, '🦾', 10e3, 10e3)
];

const inventory = [ weapons[0] ];

// Shop prices 
const prices = {
  health: 10
};

// Items that can be found in crates, gifts or boxes. 🧪🍎🍵🔮✨ 🍊🧃🥤
const consumables = [
  () => new Consumable("Apple Juice", 10, "🧃", 5),
  () => new Consumable("Apple", 25, "🍎", 10),
  () => new Consumable("Health potion", 50, "🍎", 30),
];

// Foundables that can found after winning a combat.
const foundables = [
  () => new Foundable("Dusty box", "Might contain something", "📦", 5),
  () => new Foundable("Gift", "Hope you have deserved it", "🎁", -1),
  () => new Foundable("Key", "Can open special crates", "🗝️", 15),
  () => new Foundable("Common Crate", "Commonly uncommon..", commonCrate, 20),
  () => new Foundable("Rare Crate", "Uncommonly rare..", rareCrate, 30),
];

// Player
const player = {
  name: "",
  health: 100,
  maxHealth: 200,
  gold: 0,
  currentWeapon: weapons[0],
  xp: 0,
};
// fix to update UI
addGold(0);

// Introduces playername setup if the player hasn't set a name yet.
if (player.name === "") {
  lockScreen(true);
  playernameInput.placeholder = "Enter playername..";
  text.innerHTML = "Hello fellow player 👋 Choose a playername for your character:";
  usernameField.append(playernameInput);
  usernameField.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
      submitPlayer();
    }
  });

  usernameField.append(buttonUsernameSubmit);
  buttonUsernameSubmit.innerText = "Apply ✅";
  buttonUsernameSubmit.onclick = submitPlayer;

  window.onload = function() {
    playernameInput.focus();
  }
} else {
  lockScreen(false);
  updateBackpackUI();
  controls.classList.remove('hidden');
  backpackHead.classList.remove('hidden');
  text.innerText = `Welcome, ${player.name}! to Dragon Repeller. You must defeat ` +
      `the dragon that is preventing people from leaving the town. You are in ` +
      `the town square. Where do you want to go? Use the buttons above.`;
}

function submitPlayer() {
  const playerName = playernameInput.value.trim(); // Trim removes excessive spaces

  if (playerName === '' || playerName.includes(' ')) {
    text.innerText = "Playername cannot contain spaces or be left blank.";
    return
  }

  if (playerName.length < 5 || playerName.length > 12) {
    text.innerText = "Playername must contain at least 5 characters and at most 12.";
    return;
  }

  player.name = playerName;
  text.innerText = `Welcome, ${player.name}! to Dragon Repeller. You must defeat ` +
      `the dragon that is preventing people from leaving the town. You are in ` +
      `the town square. Where do you want to go? Use the buttons above.`;

  toggleButtons(true, button1, button2, button3);
  updateBackpackUI();
  controls.classList.remove('hidden');
  backpackHead.classList.remove('hidden');
  usernameField.remove();
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
      "Buy 10 ❤️ (10 gold)",
      `Buy 🗡️ (${weapons[1].price} gold)`,
      "Town square 🏙️",
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
    health: 70,
    defaultHealth: 70,
    "button text": ["Attack 🤺", "Run 🏃"],
    "button functions": [attackEnemy, runAway],
    text: "🐍 sss.. The snake hisses aggressively..",
    icon: "🐍",
    lootXp: 50,
    lootGold: 40,
    lootGoldIncrement: 5
  },
  {
    name: "Beast",
    power: 17,
    health: 150,
    defaultHealth: 150,
    "button text": ["Attack 🤺", "Run 🏃"],
    "button functions": [attackEnemy, runAway],
    text: "ARGGGHHHH! WROOOOHA 🐊",
    icon: "🐊",
    lootXp: 100,
    lootGold: 80,
    lootGoldIncrement: 10
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
  enemy.health = enemy.defaultHealth;
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
  });
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
    });
}

// Locks all UI when set to true.
function lockScreen(isLocked) {
  if(isLocked) {
    toggleButtons(false, button1, button2, button3);
    // TODO: Make tooltips hidden when in this state
  } else {
    toggleButtons(true, button1, button2, button3);
  }
}

// goFunctions for visitng the selected location.
function gotoLocation(index) {
  resetAllButtonVisibility();
  update(locations[index]);
}
function goTown() {
  gotoLocation(0);
}

function goStore() {
  gotoLocation(1);
}

function goCave() {
  gotoLocation(2);
}

// Boss fight!
function fightDragon() {
  if (player.xp >= 10000) {
    text.innerText = "You won over a dragon that does not exist yet!";
  } else {
    text.innerText = "You are unfortunately not strong enough to fight the boss yet.. You need 10K ✨";
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
  addToInventory(nextWeapon);
  const oldWeapon = weapons[_currentWeaponIndex];
  const weaponIcon = player.currentWeapon.icon;

  // Update shop price
  let nextAvailableWeapon = weapons[_currentWeaponIndex + 2];
  let nextWeaponPrice = nextAvailableWeapon ? nextAvailableWeapon.price : 0;
  locations[1]["button text"][1] = nextWeaponPrice ? `Buy 🗡️ (${nextWeaponPrice} gold)` : 'No more 🗡️ for you!';

  // Tooltip adjustments
  weaponEquippedTooltip.innerText = player.currentWeapon.name + " " + weaponIcon;
  weaponDmgTooltip.innerText = player.currentWeapon.power;

  goStore();
  text.innerText = `You upgraded from ${oldWeapon.name} ${oldWeapon.icon} to ${player.currentWeapon.name} ${weaponIcon}`;
  weaponEquipped.innerText = weaponIcon;
  player.maxHealth += 50;
  healthCap.innerText = player.maxHealth;
}

// A function to pass XP to player.
function xp(xp) {
  player.xp += xp ?? 0;
  xpText.innerText = player.xp;
  // console.log(player.xp, xp);
}

function addGold(gold) {
  player.gold += gold;
  goldText.innerText = player.gold;
}

// MonsterStats red box.
function showFightView() {
  toggleMonsterStats();
  updateMonsterStats();
}

// Sends player to the fighting locations.
function fightEnemy(enemy) {
  currentEnemy = enemy;
  updateCaveEnemies(currentEnemy);
  showFightView();
}

function fightSnake() {
  fightEnemy(caveEnemies[0]);
}

function fightBeast() {
  fightEnemy(caveEnemies[1]);
}

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const timer = async () => {
  await delay(2000);
  text.innerText = currentEnemy.text;
};

async function runAway() {
  const rand = Math.round(Math.random());
  const dmg = 50;
  const runDamage = Math.round(dmg * randomPercentage() + 0.7);

  if (rand === 1) {
    text.innerText = "You ran away! 🏃 and got 50 ✨ ";
    xp(50);
    randomLoot(foundables);

    // Make monster's stats reset based on the monster you are fighting.
    await timer();
    toggleMonsterStats();
    goTown();
  } else if (player.health > runDamage) {
    player.health -= runDamage;
    text.innerText = `You failed to run and got attacked and lost ${runDamage} ❤️`;
    healthText.innerText = player.health;

    await timer();
    text.innerText = "You are still fighting..";
  } else {
    playerDefeated();
  }
}

// Function for passing the objects to run battleRound-function.
function attackEnemy() {
  battleRound(player, currentEnemy);
}

// Monster stats
function updateMonsterStats() {
  monsterName.innerText = currentEnemy.name;
  monsterIcon.innerText = currentEnemy.icon;
  monsterHealth.innerText = "HP: " + currentEnemy.health;

  updateMonsterDmgTaken();
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
    
    text.innerText = `You attacked with ${attacker.currentWeapon.icon} and dealt ${damage} damage.`;
    updateMonsterStats();
    updateMonsterDmgTaken(damage);
    xp(1);
    
    console.log(
      `${attacker.name}, attacks ${target.name} with ${playerDamage} and deals ${damage}! ${target.name}s HP: ${target.health}`
    );
  } else {
    // Monster attacks.
    const monsterDamage = attacker.power;
    damage = Math.round(monsterDamage * randomPercentage());
    target.health -= damage;

    target.health = Math.max(target.health, 0);
    healthText.innerText = target.health;
    

    console.log(
      `${attacker.name}, attacks ${target.name} with ${attacker.power} and deals ${damage}! ${target.name}s HP: ${target.health}`
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
    
    randomLoot(consumables);
    
    xp(monster.lootXp);
    addGold(monster.lootGold);
    toggleMonsterStats();
    button1.style.visibility = "hidden";
    button2.style.visibility = "hidden";
    resetTownButtonVisibility();

    monster.defaultHealth = Math.round(monster.defaultHealth * 1.1);
    monster.lootGold += monster.lootGoldIncrement;
    monster.health = monster.defaultHealth;
    console.log("Monster defeated's new defaultHealth: " + monster.health);
    currentEnemy = null;
  }
}

function playerDefeated() {
  text.innerText = "💀 You have been defeated! 💀 Game over.";
  healthText.innerText = 0;
  lockScreen(true);
  backpackMenu.classList.add('hidden')
  backpackButton.classList.add('hidden')

  gameBoard.style.backgroundColor = "#1a1818";
  toggleMonsterStats();
  backpackButton.classList.add("hidden");
  backpackMenu.classList.add('hidden');
}

function toggleMonsterStats() {
  monsterStats.classList.toggle("hidden");
}

// Backpack & Inventory

function updateBackpackUI() {
  const backpackCards = [];

  const invWeapons = inventory.filter(item => item instanceof Weapon);
  for (let weapon of invWeapons) {
    backpackCards.push(weapon.card);
  }
  
  const invConsumables = inventory.filter(item => item instanceof Consumable);
  for (let consumable of invConsumables) {
    // Skip consumed consumables
    if (consumable.consumed) continue;
    
    backpackCards.push(consumable.card);
  }
  
  const invFoundables = inventory.filter(item => item instanceof Foundable);
  for (let foundable of invFoundables) {
    // Skip opened foundables
    if (foundable.opened) continue;

    backpackCards.push(foundable.card);
  }

  backpackMenu.replaceChildren(...backpackCards);
}

// Adds a random consumable-item to the inventory, RNG 1/10
function randomLoot(items) {
  const randomNum = Math.floor(Math.random() * 10 ) + 1;
  
  var randomItem = items[Math.floor(Math.random()*items.length)]();

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
