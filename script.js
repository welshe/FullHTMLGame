const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game State
let gameState = 'start';
let wave = 1;
let score = 0;
let coins = 0;
let enemies = [];
let playerProjectiles = [];
let enemyProjectiles = [];
let powerups = [];
let particles = [];
let upgrades = {}; // Stores counts of purchased upgrades
let achievements = {};
let highScore = localStorage.getItem('highScore') || 0;
let totalEnemiesKilled = 0;
let totalPowerupsCollected = 0;
let totalUpgradesPurchased = 0;
let experience = 0;


// Player
const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 18,
  color: '#33ccff',
  speed: 250, // Increased speed: pixels per second
  fireRate: 200, // ms
  lastShotTime: 0,
  health: 100,
  maxHealth: 100,
  damage: 10,
  invincible: false,
  invincibleEndTime: 0,
  coinMagnet: false,
  dashCooldown: 500, //ms
  lastDashTime: 0,
  isDashing: false,
  dashEndTime: 0,
  dashDuration: 130, //ms (Increased slightly for more feel)
  dashSpeedMultiplier: 4 // Increased dash speed
};

const effectAreas = [];

// FPS Counter
let lastFrameTime = performance.now();
let frameCount = 0;
let fps = 0;

// Start Screen Variables
let currentStartTip = "";
const startTips = [
    "Tip: Auto-aim locks onto the closest enemy!",
    "Tip: Grab coins dropped by enemies for upgrades!",
    "Tip: Each wave gets tougher. Prepare yourself!",
    "Tip: Powerups are temporary but powerful!",
    "Tip: WASD or Arrow Keys to navigate.",
    "Tip: SPACEBAR to dash and evade attacks!",
    "Tip: Keep an eye on your health bar!",
    "Tip: Destroy enemies quickly to avoid being overwhelmed.",
    "Tip: Passive shop items grant permanent bonuses.",
    "Tip: Some foes fire back – stay nimble!",
    "Tip: Land critical hits for bonus damage!",
    "Tip: Life Steal can turn the tide of battle."
];


// --- Start Page Features ---
function drawStartPage() {
  ctx.fillStyle = '#0a0f14';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawBackgroundGrid();

  ctx.textAlign = 'center';
  ctx.font = "48px 'Press Start 2P', cursive";
  ctx.fillStyle = '#00ff99';
  ctx.shadowColor = 'rgba(0, 255, 153, 0.7)';
  ctx.shadowBlur = 15;
  ctx.fillText('Top Down Defender', canvas.width / 2, canvas.height / 2 - 100);
  ctx.shadowBlur = 0;

  ctx.font = "24px 'Press Start 2P', cursive";
  ctx.fillStyle = '#00ffff';
  ctx.fillText('Click to Start Wave ' + wave, canvas.width / 2, canvas.height / 2 );

  ctx.font = '18px Roboto, sans-serif';
  ctx.fillStyle = '#aabbcc';
  ctx.fillText(currentStartTip, canvas.width / 2, canvas.height / 2 + 70);

  ctx.font = "22px 'Press Start 2P', cursive";
  ctx.fillStyle = '#FFD700';
  ctx.fillText('High Score: ' + highScore, canvas.width / 2, canvas.height / 2 + 140);
}

// --- Game Over Page ---
function drawGameOverPage() {
   ctx.fillStyle = 'rgba(10, 15, 20, 0.85)';
   ctx.fillRect(0, 0, canvas.width, canvas.height);

   ctx.textAlign = 'center';
   ctx.font = "48px 'Press Start 2P', cursive";
   ctx.fillStyle = '#ff3333';
   ctx.shadowColor = 'rgba(255, 51, 51, 0.7)';
   ctx.shadowBlur = 15;
   ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 120);
   ctx.shadowBlur = 0;

   ctx.font = "24px 'Press Start 2P', cursive";
   ctx.fillStyle = '#00ffff';
   ctx.fillText('You Reached Wave: ' + wave, canvas.width / 2, canvas.height / 2 - 40);
   ctx.fillStyle = '#FFD700';
   ctx.fillText('Final Score: ' + Math.floor(score), canvas.width / 2, canvas.height / 2 + 10);
   ctx.fillText('High Score: ' + highScore, canvas.width / 2, canvas.height / 2 + 60);

   ctx.font = "20px 'Press Start 2P', cursive";
   ctx.fillStyle = '#00ff99';
   ctx.fillText('Click to Restart', canvas.width / 2, canvas.height / 2 + 130);
}


// --- Enemy Types ---
const enemyTypes = [
  { name: 'Basic', color: '#ff4444', speed: 100, health: 20, size: 15, damage: 5, coinDrop: 1, type: 'basic' }, // Speeds are pixels/sec
  { name: 'Fast', color: '#ffaa00', speed: 180, health: 15, size: 12, damage: 5, coinDrop: 1, type: 'basic' },
  { name: 'Tank', color: '#cc00cc', speed: 60, health: 60, size: 25, damage: 10, coinDrop: 3, type: 'basic' },
  { name: 'Shooter', color: '#aa6600', speed: 80, health: 25, size: 18, damage: 7, coinDrop: 2, type: 'shooter', projectileSpeed: 200, fireRate: 1500, lastShotTime: 0 },
  { name: 'Splitter', color: '#888888', speed: 120, health: 30, size: 20, damage: 6, coinDrop: 2, type: 'splitter', splitCount: 3, splitHealthRatio: 0.4, splitSizeRatio: 0.6 },
  { name: 'Charger', color: '#dd0000', speed: 160, health: 20, size: 17, damage: 8, coinDrop: 2, type: 'basic' },
  { name: 'Pusheen', color: '#ff99cc', speed: 90, health: 35, size: 22, damage: 6, coinDrop: 3, type: 'basic' },
  { name: 'Acidic', color: '#88ff00', speed: 100, health: 20, size: 16, damage: 6, coinDrop: 2, type: 'basic' },
  { name: 'Frost', color: '#66ccff', speed: 70, health: 30, size: 19, damage: 5, coinDrop: 2, type: 'basic' },
  { name: 'Electric', color: '#ffff00', speed: 110, health: 22, size: 15, damage: 7, coinDrop: 3, type: 'basic' },
  { name: 'Spitter', color: '#6b8e23', speed: 85, health: 28, size: 17, damage: 6, coinDrop: 2, type: 'shooter', projectileSpeed: 180, fireRate: 2000, lastShotTime: 0 },
  { name: 'Defender', color: '#008080', speed: 50, health: 70, size: 23, damage: 8, coinDrop: 4, type: 'basic' },
  { name: 'Hopper', color: '#32cd32', speed: 70, health: 20, size: 16, damage: 5, coinDrop: 2, type: 'basic' }, // Needs hopping logic
  { name: 'Regenerator', color: '#228b22', speed: 95, health: 40, size: 20, damage: 7, coinDrop: 3, type: 'regenerator', healRate: 0.25 }, // Heal rate per sec
  { name: 'Bomber', color: '#ff6347', speed: 105, health: 25, size: 18, damage: 15, coinDrop: 3, type: 'bomber' },
];

function createEnemy(typeData, x, y, size, health, speed, damage, coinDrop) {
    const type = typeData || enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    const initialSize = size !== undefined ? size : type.size;
    let initialHealth = health !== undefined ? health : type.health;
    const initialSpeed = speed !== undefined ? speed : type.speed;
    const initialDamage = damage !== undefined ? damage : type.damage;
    const initialCoinDrop = coinDrop !== undefined ? coinDrop : type.coinDrop;

    let spawnX, spawnY;
    const margin = 50; // Spawn further off-screen
    if (x !== undefined && y !== undefined) {
        spawnX = x; spawnY = y;
    } else {
        if (Math.random() < 0.5) {
          spawnX = Math.random() * canvas.width;
          spawnY = Math.random() < 0.5 ? -initialSize - margin : canvas.height + initialSize + margin;
        } else {
          spawnX = Math.random() < 0.5 ? -initialSize - margin : canvas.width + initialSize + margin;
          spawnY = Math.random() * canvas.height;
        }
    }
    initialHealth *= (1 + (wave -1) * 0.12); // Enemies get 12% more health per wave

    const newEnemy = {
      x: spawnX, y: spawnY, radius: initialSize, color: type.color,
      speed: initialSpeed, health: initialHealth, maxHealth: initialHealth,
      damage: initialDamage, coinDrop: initialCoinDrop, type: type.type,
      hitFlash: 0, projectileSpeed: type.projectileSpeed || 0,
      fireRate: type.fireRate || 0, lastShotTime: type.lastShotTime || 0,
      splitCount: type.splitCount || 0, splitHealthRatio: type.splitHealthRatio || 0,
      splitSizeRatio: type.splitSizeRatio || 0, healRate: type.healRate || 0
    };
    enemies.push(newEnemy);
}

let currentWaveFeature = null;

function spawnWave(waveNumber) {
  const baseEnemies = 8;
  const enemiesPerWave = 4;
  const randomFactor = Math.floor(Math.random() * (waveNumber * 1.5));
  const numEnemies = baseEnemies + waveNumber * enemiesPerWave + randomFactor;

  currentWaveFeature = null;
  applyRandomWaveFeature();

  const enemiesToSpawn = [];
  const healthReductionFactor = 1 - Math.min(0.5, (upgrades.enemyHealthReduction || 0));

  for (let i = 0; i < numEnemies; i++) {
      let typeData = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
      if (currentWaveFeature && currentWaveFeature.tanky && Math.random() < 0.4) {
           const tankType = enemyTypes.find(e => e.name === 'Tank') || typeData;
           typeData = tankType;
      }
      let effectiveSpeed = typeData.speed * (currentWaveFeature && currentWaveFeature.speedModifier ? currentWaveFeature.speedModifier : 1);
      if (waveNumber <= 2) effectiveSpeed *= 0.85;

      let effectiveHealth = typeData.health * healthReductionFactor;

      enemiesToSpawn.push({ typeData, speed: effectiveSpeed, health: effectiveHealth });
  }

  enemiesToSpawn.forEach(enemyInfo => {
      createEnemy(enemyInfo.typeData, undefined, undefined, enemyInfo.typeData.size, enemyInfo.health, enemyInfo.speed, enemyInfo.typeData.damage, enemyInfo.typeData.coinDrop);
  });
  console.log(`Wave ${waveNumber} spawned: ${numEnemies} enemies. Feature: ${currentWaveFeature ? currentWaveFeature.name : 'None'}`);
}

const waveFeatures = [
    { name: "Swift Assault", description: "Enemies are 20% faster!", speedModifier: 1.2 },
    { name: "Tank Brigade", description: "More tanky enemies!", tanky: true },
    { name: "Golden Rush", description: "Enemies drop 50% more coins!", coinMultiplier: 1.5 },
    { name: "Fog of War", description: "Limited visibility!", limitedVisibility: true, visibilityRadius: 250 },
    { name: "Regenerating Horde", description: "Enemies slowly heal!", enemyRegen: 0.1 }, // hp per sec
    { name: "Player Sluggish", description: "Your speed is reduced by 25%!", playerSpeedModifier: 0.75 },
    { name: "Evasive Maneuvers", description: "Enemies have 5% chance to dodge!", dodgeChance: 0.05 }
];

function applyRandomWaveFeature() {
    if (wave > 1 && waveFeatures.length > 0 && Math.random() < 0.4) {
        currentWaveFeature = waveFeatures[Math.floor(Math.random() * waveFeatures.length)];
        displayGameMessage(`Wave Feature: ${currentWaveFeature.name} - ${currentWaveFeature.description}`, 5000, '#00ffff');

        if (currentWaveFeature.playerSpeedModifier) {
            player._originalSpeed = player.speed;
            player.speed *= currentWaveFeature.playerSpeedModifier;
        }
    }
}

function removeWaveFeatureEffects() {
    if (currentWaveFeature) {
        if (currentWaveFeature.playerSpeedModifier && player._originalSpeed) {
            player.speed = player._originalSpeed;
            delete player._originalSpeed;
        }
    }
    currentWaveFeature = null;
}


// --- Powerups ---
const powerupTypes = [
  { name: 'Speed Boost', color: '#ffff00', duration: 10000, effect: () => { player._baseSpeed = player._baseSpeed || player.speed; player.speed *= 1.6;}, removeEffect: () => { player.speed = player._baseSpeed || player.speed / 1.6; delete player._baseSpeed;} },
  { name: 'Fire Rate+', color: '#00ffff', duration: 10000, effect: () => { player._baseFireRate = player._baseFireRate || player.fireRate; player.fireRate = Math.max(50, player.fireRate * 0.5);}, removeEffect: () => { player.fireRate = player._baseFireRate || player.fireRate / 0.5; delete player._baseFireRate;} },
  { name: 'Damage Up', color: '#00ff00', duration: 10000, effect: () => { player._baseDamage = player._baseDamage || player.damage; player.damage *= 1.8;}, removeEffect: () => {player.damage = player._baseDamage || player.damage / 1.8; delete player._baseDamage;} },
  { name: 'Invincibility', color: '#ff69b4', duration: 7000, effect: () => { player.invincible = true; player.invincibleEndTime = performance.now() + (7000 * (1 + (upgrades.powerupDuration || 0))); }, removeEffect: () => { player.invincible = false;} },
  { name: 'Coin Magnet', color: '#ffd700', duration: 12000, effect: () => player.coinMagnet = true, removeEffect: () => player.coinMagnet = false },
  { name: 'Area Bomb', color: '#ff3333', duration: 100, effect: () => applyAreaDamage(player.damage * 6, player.x, player.y, 220), removeEffect: () => {} },
  { name: 'Slow Field', color: '#9370db', duration: 8000, effect: () => { const field = { type: 'slow', x: player.x, y: player.y, radius: 180, slowFactor: 0.45, endTime: performance.now() + (8000 * (1 + (upgrades.powerupDuration || 0))) }; effectAreas.push(field);}, removeEffect: () => {} }
];

let activePowerupEffects = [];

function createPowerup(x, y) {
    const spawnChance = 0.18 + (upgrades.powerupSpawnChance || 0);
    if (Math.random() < spawnChance) {
        let availablePowerups = powerupTypes;
        if (!upgrades.areaDamageUnlock) {
            availablePowerups = powerupTypes.filter(pt => pt.name !== 'Area Bomb');
        }
        if (availablePowerups.length === 0) return;

        const type = availablePowerups[Math.floor(Math.random() * availablePowerups.length)];
        
        // Clamp spawn position to be within screen bounds or just slightly off
        const clampedX = Math.max(type.radius, Math.min(x, canvas.width - type.radius));
        const clampedY = Math.max(type.radius, Math.min(y, canvas.height - type.radius));

        powerups.push({ x: clampedX, y: clampedY, radius: 12, color: type.color, type: type, createdAt: performance.now() });
    }
}

function applyPowerupEffect(powerupType) {
    totalPowerupsCollected++;
    const now = performance.now();
    const durationWithUpgrade = powerupType.duration * (1 + (upgrades.powerupDuration || 0));

    const existingEffectIndex = activePowerupEffects.findIndex(effect => effect.type.name === powerupType.name);

    if (existingEffectIndex !== -1) {
        const existingEffect = activePowerupEffects[existingEffectIndex];
        if(existingEffect.type.removeEffect) existingEffect.type.removeEffect();
        if(powerupType.effect) powerupType.effect();
        existingEffect.endTime = now + durationWithUpgrade;
    } else {
        if(powerupType.effect) powerupType.effect();
        activePowerupEffects.push({ type: powerupType, endTime: now + durationWithUpgrade });
    }

    if (powerupType.name === 'Area Bomb') checkAchievements('areaDamageUsed');
    checkAchievements();
}

function removeExpiredPowerupEffects() {
    const now = performance.now();
    for (let i = activePowerupEffects.length - 1; i >= 0; i--) {
        const effect = activePowerupEffects[i];
        if (now >= effect.endTime) {
            if(effect.type.removeEffect) effect.type.removeEffect();
            activePowerupEffects.splice(i, 1);
        }
    }
    for (let i = effectAreas.length - 1; i >= 0; i--) {
       if (performance.now() >= effectAreas[i].endTime) {
           effectAreas.splice(i, 1);
       }
   }
}

function applyAreaDamage(damageAmount, centerX, centerY, radius) {
    createSparks(centerX, centerY, '#ff3333', 60, radius * 0.8);
    enemies.forEach(enemy => {
        const dist = Math.hypot(enemy.x - centerX, enemy.y - centerY);
        if (dist < radius + enemy.radius) {
            enemy.health -= damageAmount;
            enemy.hitFlash = 15;
        }
    });
}

function createSparks(x, y, color, count, spread = 5) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * spread + 2;
        const life = Math.random() * 45 + 25;
        particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: color,
            radius: Math.random() * 2.8 + 1.2,
            lifetime: life, age: 0,
            type: 'spark'
        });
    }
}

// --- Shop & Upgrades ---
const allShopItems = [
    { id: 'speed', name: 'Swift Boots', cost: 50, type: 'upgrade', apply: () => player.speed += 30, description: "+30 Player Speed", maxPurchases: 5 }, // Speed in pixels/sec
    { id: 'fireRate', name: 'Rapid Fire', cost: 75, type: 'upgrade', apply: () => player.fireRate = Math.max(50, player.fireRate - 25), description: "-25ms Fire Rate", maxPurchases: 6 },
    { id: 'damage', name: 'Power Shot', cost: 60, type: 'upgrade', apply: () => player.damage += 4, description: "+4 Damage", maxPurchases: 10 },
    { id: 'maxHealth', name: 'Vitality Boost', cost: 100, type: 'upgrade', apply: () => { player.maxHealth += 25; player.health = Math.min(player.maxHealth, player.health + 25); }, description: "+25 Max HP & Heal", maxPurchases: 8 },
    { id: 'heal', name: 'Medkit', cost: 30, type: 'upgrade', apply: () => player.health = Math.min(player.maxHealth, player.health + 50), description: "Heal 50 Health", maxPurchases: Infinity },
    { id: 'coinBonus', name: 'Greed Sensor', cost: 80, type: 'upgrade', apply: () => { upgrades.coinBonus = (upgrades.coinBonus || 0) + 0.1; }, description: "+10% Coin Drops", maxPurchases: 5 },
    { id: 'projectileSpeed', name: 'Velocity Matrix', cost: 70, type: 'upgrade', apply: () => { upgrades.projectileSpeed = (upgrades.projectileSpeed || 350) + 40; }, description: "+40 Proj. Speed", maxPurchases: 5 }, // Proj speed in pixels/sec
    { id: 'areaDamageUnlock', name: 'Unlock Area Bomb', cost: 150, type: 'upgrade', apply: () => { upgrades.areaDamageUnlock = true; }, description: "Area Bomb Appears", maxPurchases: 1, oneTime: true },
    { id: 'lifeSteal', name: 'Vampiric Touch', cost: 120, type: 'upgrade', apply: () => { upgrades.lifeSteal = (upgrades.lifeSteal || 0) + 0.015; }, description: "+1.5% Life Steal", maxPurchases: 5 },
    { id: 'criticalChance', name: 'Deadeye Lens', cost: 90, type: 'upgrade', apply: () => { upgrades.criticalChance = Math.min(0.5, (upgrades.criticalChance || 0) + 0.05); }, description: "+5% Crit Chance", maxPurchases: 10 },
    { id: 'extraLife', name: 'Phoenix Down', cost: 500, type: 'upgrade', apply: () => { upgrades.extraLife = (upgrades.extraLife || 0) + 1; }, description: "Gain 1 Extra Life", maxPurchases: 1, oneTime: true },
    { id: 'powerupDuration', name: 'Extended Charge', cost: 130, type: 'upgrade', apply: () => { upgrades.powerupDuration = (upgrades.powerupDuration || 0) + 0.15; }, description: "+15% Powerup Time", maxPurchases: 4 },
    { id: 'enemyHealthReduction', name: 'Weakening Field', cost: 100, type: 'upgrade', apply: () => { upgrades.enemyHealthReduction = Math.min(0.3, (upgrades.enemyHealthReduction || 0) + 0.05); }, description: "-5% Next Wave HP", maxPurchases: 6 },

    { id: 'passiveHealthRegen', name: 'Nano Repair', cost: 150, type: 'passive', apply: () => { upgrades.passiveHealthRegen = (upgrades.passiveHealthRegen || 0) + 0.15; }, description: "+0.15 HP/sec", maxPurchases: 5 }, // HP per sec
    { id: 'passiveCoinGain', name: 'Coin Drip', cost: 200, type: 'passive', apply: () => { upgrades.passiveCoinGain = (upgrades.passiveCoinGain || 0) + 0.3; }, description: "+0.3 Coins/sec", maxPurchases: 4 }, // Coins per sec
    { id: 'enemySpeedSlowAura', name: 'Slowing Aura', cost: 180, type: 'passive', apply: () => { upgrades.enemySpeedSlowAura = (upgrades.enemySpeedSlowAura || 0) + 0.03; }, description: "Aura slows by 3%", maxPurchases: 5 },
    { id: 'xpBonus', name: 'Learning Matrix', cost: 90, type: 'passive', apply: () => { upgrades.xpBonus = (upgrades.xpBonus || 0) + 0.1; }, description: "+10% Score Gain", maxPurchases: 5 },
    { id: 'damageResistance', name: 'Energy Shield', cost: 180, type: 'passive', apply: () => { upgrades.damageResistance = Math.min(0.25, (upgrades.damageResistance || 0) + 0.025); }, description: "+2.5% Dmg Resist", maxPurchases: 10 },
    { id: 'powerupSpawnChance', name: 'Luck Charm', cost: 100, type: 'passive', apply: () => { upgrades.powerupSpawnChance = Math.min(0.15, (upgrades.powerupSpawnChance || 0) + 0.015); }, description: "+1.5% Powerup Rate", maxPurchases: 10 },
    { id: 'dashCooldownReduction', name: 'Hyper Coils', cost: 100, type: 'passive', apply: () => { upgrades.dashCooldownReduction = Math.min(0.4, (upgrades.dashCooldownReduction || 0) + 0.05); }, description: "-5% Dash Cooldown", maxPurchases: 8},
    { id: 'projectileAOE', name: 'Splash Damage', cost: 250, type: 'passive', apply: () => { upgrades.projectileAOE = (upgrades.projectileAOE || 0) + 10; }, description: "Splash Dmg (10 R)", maxPurchases: 5 }, // Radius
    { id: 'critDamage', name: 'Executioner', cost: 150, type: 'passive', apply: () => { upgrades.critDamage = (upgrades.critDamage || 0) + 0.25; }, description: "+25% Crit Damage", maxPurchases: 8 },
    { id: 'coinMagnetRadius', name: 'Attraction Field', cost: 70, type: 'passive', apply: () => { upgrades.coinMagnetRadius = (upgrades.coinMagnetRadius || 50) + 40; }, description: "+40 Magnet Range", maxPurchases: 5 }, // Base magnet radius for this upgrade
];

function openShop() {
    gameState = 'shop';
    const shopElement = document.getElementById('shop');
    shopElement.classList.add('visible');

    document.getElementById('player-coins').innerText = Math.floor(coins);

    const upgradesDiv = document.getElementById('shop-upgrades-items');
    const passivesDiv = document.getElementById('shop-passives-items');
    upgradesDiv.innerHTML = '';
    passivesDiv.innerHTML = '';

    allShopItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('shop-item');
        const purchasedCount = upgrades[item.id + '_count'] || 0;
        let costText = `${item.cost} coins`;
        if (item.maxPurchases && item.maxPurchases !== Infinity) {
            costText += ` (${purchasedCount}/${item.maxPurchases})`;
        }
        
        itemElement.innerHTML = `
            <div class="shop-item-info">
                <span class="shop-item-name">${item.name}</span>
                <small class="shop-item-description">${item.description}</small>
            </div>
            <span class="shop-item-cost">${costText}</span>`;

        let isMaxed = (item.maxPurchases && purchasedCount >= item.maxPurchases);
        if (item.oneTime && upgrades[item.id]) isMaxed = true;
        if (item.id === 'extraLife' && upgrades.extraLife_used_this_game) isMaxed = true;

        if (Math.floor(coins) < item.cost || isMaxed) {
            itemElement.style.opacity = 0.6; // Slightly more visible than 0.5
            itemElement.style.cursor = 'not-allowed';
             if(isMaxed) {
                const costEl = itemElement.querySelector('.shop-item-cost');
                if(costEl) costEl.innerText = "MAXED";
                itemElement.style.backgroundColor = "rgba(80, 80, 100, 0.5)"; // Different color for maxed
             }
        } else {
            itemElement.onclick = () => purchaseItem(item.id);
        }

        if (item.type === 'upgrade') upgradesDiv.appendChild(itemElement);
        else if (item.type === 'passive') passivesDiv.appendChild(itemElement);
    });
}

function closeShop() {
    const shopElement = document.getElementById('shop');
    shopElement.classList.remove('visible');
    // gameState will be set to 'playing' after transition in gameLoop or a dedicated function
    // to avoid spawning wave while shop is still fading out.
    // For now, direct change:
    gameState = 'playing';


    removeWaveFeatureEffects();
    wave++;
    spawnWave(wave);
}

function purchaseItem(itemId) {
    const item = allShopItems.find(i => i.id === itemId);
    if (!item) return;

    const purchasedCount = upgrades[item.id + '_count'] || 0;
    let isMaxed = (item.maxPurchases && purchasedCount >= item.maxPurchases);
    if (item.oneTime && upgrades[item.id]) isMaxed = true;
    if (item.id === 'extraLife' && upgrades.extraLife_used_this_game) isMaxed = true;

    if (Math.floor(coins) >= item.cost && !isMaxed) {
        coins -= item.cost;
        item.apply();
        upgrades[item.id + '_count'] = purchasedCount + 1;
        if (item.oneTime) upgrades[item.id] = true;
        totalUpgradesPurchased++;
        checkAchievements('upgradePurchased');
        openShop(); // Refresh shop
    }
}


// --- Achievements ---
const allAchievements = [
    { id: 'firstKill', name: 'First Blood', description: 'Kill your first enemy.', achieved: false, condition: () => totalEnemiesKilled >= 1 },
    { id: 'wave5', name: 'Wave Novice', description: 'Reach Wave 5.', achieved: false, condition: () => wave >= 5 },
    { id: 'wave10', name: 'Wave Warrior', description: 'Reach Wave 10.', achieved: false, condition: () => wave >= 10 },
    { id: 'wave20', name: 'Wave Veteran', description: 'Reach Wave 20.', achieved: false, condition: () => wave >= 20 },
    { id: 'collect100coins', name: 'Coin Hoarder', description: 'Accumulate 100 coins.', achieved: false, condition: () => coins >= 100},
    { id: 'buyFirstUpgrade', name: 'First Investment', description: 'Buy your first upgrade.', achieved: false, type: 'upgradePurchased'},
    { id: 'kill100Enemies', name: 'Centurion', description: 'Defeat 100 enemies.', achieved: false, condition: () => totalEnemiesKilled >= 100 },
    { id: 'collect5Powerups', name: 'Power Hungry', description: 'Collect 5 powerups.', achieved: false, condition: () => totalPowerupsCollected >= 5},
    { id: 'maxHealthReached', name: 'Peak Condition', description: 'Reach 200 max health.', achieved: false, condition: () => player.maxHealth >= 200},
    { id: 'dashMaster', name: 'Untouchable', description: 'Use dash 20 times.', achieved: false, type: 'dashUsed', count: 0, targetCount: 20},
    { id: 'areaDamageUsed', name: 'Crowd Control', description: 'Use an Area Bomb.', achieved: false, type: 'areaDamageUsed' },
];

function checkAchievements(eventType) { // Removed eventValue as it wasn't used
    allAchievements.forEach(ach => {
        if (!ach.achieved) {
            let unlocked = false;
            if (ach.condition && ach.condition()) {
                unlocked = true;
            } else if (ach.type && ach.type === eventType) {
                if (ach.targetCount) {
                    ach.count = (ach.count || 0) + 1;
                    if (ach.count >= ach.targetCount) unlocked = true;
                } else {
                    unlocked = true;
                }
            }
            if (unlocked) {
                ach.achieved = true;
                achievements[ach.id] = true;
                displayAchievementNotification(ach.name);
            }
        }
    });
}

function displayGameMessage(message, duration = 3000, color = '#00ffff') {
   const targetDivId = (color === '#FFD700') ? 'achievement-notification' : 'game-message';
   const messageDiv = document.getElementById(targetDivId);
   if (!messageDiv) return;


   messageDiv.innerText = message;
   messageDiv.style.color = color;
   messageDiv.style.borderColor = color;
   messageDiv.style.boxShadow = `0 0 20px ${color}33`;

   messageDiv.classList.add('visible');

   // Clear any existing timeout for this div to prevent premature hiding
   if (messageDiv.hideTimeout) clearTimeout(messageDiv.hideTimeout);

   messageDiv.hideTimeout = setTimeout(() => {
       messageDiv.classList.remove('visible');
       messageDiv.hideTimeout = null; // Clear the stored timeout ID
   }, duration);
}

function displayAchievementNotification(name) {
    displayGameMessage(`Achievement: ${name}!`, 5000, '#FFD700');
}

function handleEnemyDefeat(enemy, index) {
    let coinsDropped = enemy.coinDrop * (1 + (upgrades.coinBonus || 0));
    if (currentWaveFeature && currentWaveFeature.coinMultiplier) {
        coinsDropped *= currentWaveFeature.coinMultiplier;
    }
    coins += Math.round(coinsDropped);

    score += (10 + wave) * (1 + (upgrades.xpBonus || 0));
    experience += 10;
    totalEnemiesKilled++;
    checkAchievements('firstKill');
    checkAchievements();

    // Clamp drop position
    const dropX = Math.max(20, Math.min(enemy.x, canvas.width - 20));
    const dropY = Math.max(20, Math.min(enemy.y, canvas.height - 20));

    createPowerup(dropX, dropY);
    createSparks(dropX, dropY, enemy.color, 20 + enemy.radius, enemy.radius * 0.5);

    if (enemy.type === 'splitter') {
        const splitType = enemyTypes.find(t => t.name === 'Basic');
        if (splitType) {
            for (let i = 0; i < enemy.splitCount; i++) {
                createEnemy(
                    splitType,
                    dropX + (Math.random() - 0.5) * enemy.radius, // Spawn split parts near original death
                    dropY + (Math.random() - 0.5) * enemy.radius,
                    splitType.size * (enemy.splitSizeRatio || 0.7),
                    splitType.health * (enemy.splitHealthRatio || 0.5),
                    splitType.speed * 1.2,
                    splitType.damage, 0
                );
            }
        }
    }
    if (enemy.type === 'bomber') {
        applyAreaDamage(enemy.damage * 1.5, dropX, dropY, enemy.radius * 4);
    }

    enemies.splice(index, 1);
    if (score > highScore) {
       highScore = Math.floor(score);
       localStorage.setItem('highScore', highScore);
    }
}

// --- Game Loop ---
function gameLoop(currentTime) {
  requestAnimationFrame(gameLoop);
  const now = performance.now();
  const deltaTime = Math.min(0.05, (now - (gameLoop.lastTime || now)) / 1000);
  gameLoop.lastTime = now;

  frameCount++;
  if (now - lastFrameTime >= 1000) {
      fps = frameCount;
      document.getElementById('fps').innerText = 'FPS: ' + fps;
      frameCount = 0;
      lastFrameTime = now;
  }

  ctx.fillStyle = '#0a0f14';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawBackgroundGrid();

  if (gameState === 'start') { drawStartPage(); return; }
  if (gameState === 'gameover') { drawGameOverPage(); return; }
  
  // If shop is visible, we might want to pause game updates or just draw them statically
  const shopIsVisible = document.getElementById('shop').classList.contains('visible');
  if (shopIsVisible) {
      // Optionally draw a dimmed game background while shop is open
      drawEffectAreas();
      drawParticles();
      drawEnemies(); // Draw them static
      drawPowerups();
      drawEnemyProjectiles();
      drawPlayerProjectiles();
      drawPlayer(); // Draw player static
      drawUI(); // UI might still be relevant
      return; // Skip game logic updates
  }


  if (upgrades.passiveHealthRegen > 0 && player.health < player.maxHealth) {
      player.health = Math.min(player.maxHealth, player.health + upgrades.passiveHealthRegen * deltaTime);
  }
  if (upgrades.passiveCoinGain > 0) {
       coins += upgrades.passiveCoinGain * deltaTime;
  }

  handlePlayerMovement(deltaTime, now);
  handlePlayerShooting(now);
  updateEnemies(deltaTime, now);
  updateProjectiles(deltaTime);
  updatePowerups(deltaTime);
  updateParticles(deltaTime);
  removeExpiredPowerupEffects();

  drawEffectAreas();
  drawParticles();
  drawEnemies();
  drawPowerups();
  drawEnemyProjectiles();
  drawPlayerProjectiles();
  drawPlayer();
  drawUI();

  if (currentWaveFeature && currentWaveFeature.limitedVisibility) {
      drawLimitedVisibilityOverlay(currentWaveFeature.visibilityRadius);
  }

  if (enemies.length === 0 && gameState === 'playing' && !shopIsVisible) {
      openShop();
  }
}


// --- Drawing Functions (Enhanced) ---

function drawBackgroundGrid() {
    ctx.strokeStyle = 'rgba(0, 70, 100, 0.2)';
    const gridSize = 60;
    if (!window.stars) {
        window.stars = [];
        for (let i = 0; i < 150; i++) {
            window.stars.push({
                x: Math.random() * canvas.width, y: Math.random() * canvas.height,
                radius: Math.random() * 1.8, opacity: Math.random() * 0.4 + 0.1
            });
        }
    }
    window.stars.forEach(star => {
        ctx.beginPath(); ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(150, 180, 220, ${star.opacity})`; ctx.fill();
    });
    ctx.beginPath();
    for (let x = 0; x < canvas.width; x += gridSize) { ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); }
    for (let y = 0; y < canvas.height; y += gridSize) { ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); }
    ctx.lineWidth = 0.3; ctx.stroke();
    ctx.lineWidth = 1;
}

function drawPlayer() {
    const now = performance.now();
    if (player.isDashing && now < player.dashEndTime) {
        const dashProgress = 1 - (player.dashEndTime - now) / player.dashDuration;
        ctx.fillStyle = `rgba(0, 255, 255, ${0.4 * (1 - dashProgress)})`;
        ctx.beginPath(); ctx.arc(player.x, player.y, player.radius * (1 + dashProgress * 1.5), 0, Math.PI * 2); ctx.fill();
    }
    if (player.invincible && now < player.invincibleEndTime) {
        ctx.strokeStyle = `rgba(255, 255, 0, ${0.3 + Math.sin(now / 100) * 0.3 + 0.2})`;
        ctx.lineWidth = 3 + Math.sin(now / 150) * 1.5;
        ctx.beginPath(); ctx.arc(player.x, player.y, player.radius + 7 + Math.sin(now / 200) * 2, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.fillStyle = player.color;
    ctx.beginPath(); ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(173, 216, 230, ${0.2 + Math.sin(now / 300) * 0.1})`;
    ctx.beginPath(); ctx.arc(player.x, player.y, player.radius * 0.8, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#00ffff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 1;

    const healthBarWidth = player.radius * 3; const healthBarHeight = 10;
    const healthBarX = player.x - healthBarWidth / 2; const healthBarY = player.y + player.radius + 10;
    ctx.fillStyle = 'rgba(50, 50, 50, 0.7)';
    roundRect(ctx, healthBarX, healthBarY, healthBarWidth, healthBarHeight, 4); ctx.fill();
    const healthPercentage = player.health / player.maxHealth;
    let healthColor;
    if (healthPercentage > 0.66) healthColor = '#00ff77';
    else if (healthPercentage > 0.33) healthColor = '#ffcc00';
    else healthColor = '#ff3333';
    ctx.fillStyle = healthColor;
    roundRect(ctx, healthBarX, healthBarY, Math.max(0, healthPercentage * healthBarWidth), healthBarHeight, 4); ctx.fill();
    ctx.strokeStyle = 'rgba(220, 220, 220, 0.8)';
    roundRect(ctx, healthBarX, healthBarY, healthBarWidth, healthBarHeight, 4); ctx.stroke();
}

function drawEnemies() {
  enemies.forEach(enemy => {
    const now = performance.now(); let flashAlpha = 0;
    if (enemy.hitFlash > 0) { flashAlpha = (enemy.hitFlash / 15) * 0.8; enemy.hitFlash--; }
    ctx.save(); ctx.translate(enemy.x, enemy.y);
    ctx.fillStyle = enemy.color;
    ctx.beginPath(); ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2); ctx.fill();
    if (flashAlpha > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
        ctx.beginPath(); ctx.arc(0, 0, enemy.radius + 1, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();

    const healthBarWidth = enemy.radius * 2.2; const healthBarHeight = 5;
    const healthBarX = enemy.x - healthBarWidth / 2; const healthBarY = enemy.y - enemy.radius - 12;
    ctx.fillStyle = 'rgba(40,40,40,0.7)'; ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
    const enemyHealthPercentage = enemy.health / enemy.maxHealth;
    ctx.fillStyle = enemyHealthPercentage > 0.5 ? '#ff6666' : '#dd2222';
    ctx.fillRect(healthBarX, healthBarY, Math.max(0, enemyHealthPercentage * healthBarWidth), healthBarHeight);
    ctx.strokeStyle = 'rgba(100,100,100,0.5)'; ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
  });
}

function drawPlayerProjectiles() {
  playerProjectiles.forEach(projectile => {
    ctx.save(); ctx.translate(projectile.x, projectile.y);
    ctx.rotate(projectile.angle + Math.PI / 2);
    const projLength = projectile.radius * 3.5; // Longer
    const projWidth = projectile.radius * 0.7; // Thinner
    ctx.fillStyle = '#00ffff';
    ctx.beginPath(); ctx.rect(-projWidth / 2, -projLength / 2, projWidth, projLength); ctx.fill();
    ctx.fillStyle = 'rgba(100, 255, 255, 0.4)';
    ctx.beginPath(); ctx.rect(-projWidth, -projLength/2 - projWidth*0.5, projWidth*2, projLength + projWidth); ctx.fill();
    ctx.restore();
  });
}

function drawEnemyProjectiles() {
    enemyProjectiles.forEach(projectile => {
        ctx.fillStyle = projectile.color;
        ctx.beginPath(); ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 1; ctx.stroke();
    });
}

function drawPowerups() {
    powerups.forEach(powerup => {
        const now = performance.now();
        const hoverEffect = Math.sin((now + powerup.createdAt) / 200) * 2;
        const pulseEffect = 0.8 + Math.sin((now + powerup.createdAt) / 300) * 0.2;
        ctx.save(); ctx.translate(powerup.x, powerup.y + hoverEffect); ctx.scale(pulseEffect, pulseEffect);
        ctx.fillStyle = powerup.color; ctx.beginPath();
        if (powerup.type.name.includes('Speed') || powerup.type.name.includes('Fire Rate')) {
            ctx.moveTo(0, -powerup.radius); ctx.lineTo(powerup.radius, 0);
            ctx.lineTo(0, powerup.radius); ctx.lineTo(-powerup.radius, 0); ctx.closePath();
        } else { ctx.arc(0, 0, powerup.radius, 0, Math.PI * 2); }
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.font = `bold ${powerup.radius * 0.8}px 'Press Start 2P'`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        let letter = powerup.type.name.substring(0,1);
        if (powerup.type.name === "Coin Magnet") letter = "$";
        if (powerup.type.name === "Area Bomb") letter = "B";
        ctx.fillText(letter, 0, 1);
        ctx.restore();
    });
}

function drawParticles() {
   particles.forEach(particle => {
       const lifeLeft = 1 - (particle.age / particle.lifetime);
       ctx.fillStyle = particle.color.startsWith('rgba') ? 
                       particle.color.replace(/,\s*\d?\.?\d*\)$/, `, ${Math.max(0, lifeLeft * 0.8).toFixed(2)})`) :
                       `rgba(${hexToRgb(particle.color).r}, ${hexToRgb(particle.color).g}, ${hexToRgb(particle.color).b}, ${Math.max(0, lifeLeft * 0.8).toFixed(2)})`;
       ctx.beginPath(); ctx.arc(particle.x, particle.y, particle.radius * lifeLeft, 0, Math.PI * 2); ctx.fill();
   });
}

function drawEffectAreas() {
    effectAreas.forEach(area => {
        if (area.type === 'slow') {
            const lifeLeft = Math.max(0, (area.endTime - performance.now()) / (area.endTime - (area.endTime - 8000)));
            ctx.fillStyle = `rgba(147, 112, 219, ${0.15 + lifeLeft * 0.1})`;
            ctx.beginPath(); ctx.arc(area.x, area.y, area.radius, 0, Math.PI * 2); ctx.fill();
        }
    });
}

function drawUI() {
  ctx.textAlign = 'left'; ctx.font = "20px 'Press Start 2P', cursive";
  ctx.textShadow = "2px 2px 3px rgba(0,0,0,0.7)";
  ctx.fillStyle = '#00ffff'; ctx.fillText('Wave: ' + wave, 20, 45);
  ctx.fillStyle = '#FFD700'; ctx.fillText('Score: ' + Math.floor(score), 20, 80);
  ctx.fillStyle = '#FFFFFF'; ctx.fillText('Coins: ' + Math.floor(coins), 20, 115);
  ctx.textShadow = "none";

  if (activePowerupEffects.length > 0) {
     ctx.textAlign = 'right'; let uiOffset = 0;
     activePowerupEffects.forEach(effect => {
         const timeLeft = Math.max(0, (effect.endTime - performance.now()) / 1000).toFixed(1);
         ctx.font = "16px 'Press Start 2P', cursive"; ctx.fillStyle = effect.type.color || '#e0e0e0';
         ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 3;
         ctx.fillText(`${effect.type.name}: ${timeLeft}s`, canvas.width - 20, 45 + uiOffset);
         ctx.shadowBlur = 0; uiOffset += 30;
     });
  }
  const dashTimeLeft = Math.max(0, (player.lastDashTime + (player.dashCooldown * (1 - (upgrades.dashCooldownReduction || 0)))) - performance.now());
  if (dashTimeLeft > 0) {
      ctx.fillStyle = '#cccccc'; ctx.textAlign = 'right'; ctx.font = "16px 'Press Start 2P', cursive";
      ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 3;
      ctx.fillText(`Dash CD: ${(dashTimeLeft / 1000).toFixed(1)}s`, canvas.width - 20, 45 + (activePowerupEffects.length * 30) + (activePowerupEffects.length > 0 ? 10 : 0) );
      ctx.shadowBlur = 0;
  }
}

function drawLimitedVisibilityOverlay(radius = 200) {
    const gradient = ctx.createRadialGradient(player.x, player.y, radius * 0.7, player.x, player.y, radius);
    gradient.addColorStop(0, 'rgba(10, 15, 20, 0)');
    gradient.addColorStop(0.8, 'rgba(10, 15, 20, 0.9)');
    gradient.addColorStop(1, 'rgba(10, 15, 20, 1)');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvas.width, canvas.height);
}


// --- Input & Update Logic ---
const keys = {};
window.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

canvas.addEventListener('click', (event) => {
  if (gameState === 'start') {
    resetGame(); gameState = 'playing'; spawnWave(wave);
  } else if (gameState === 'gameover') {
    gameState = 'start'; resetGame();
  }
});

function handlePlayerMovement(deltaTime, now) {
    if (gameState !== 'playing') return;
    let dx = 0; dy = 0;
    if (keys['w'] || keys['arrowup']) dy -= 1;
    if (keys['s'] || keys['arrowdown']) dy += 1;
    if (keys['a'] || keys['arrowleft']) dx -= 1;
    if (keys['d'] || keys['arrowright']) dx += 1;

    if (keys[' '] && now - player.lastDashTime >= (player.dashCooldown * (1-(upgrades.dashCooldownReduction || 0))) && !player.isDashing) {
        player.isDashing = true; player.lastDashTime = now; player.dashEndTime = now + player.dashDuration;
        player.dashDx = dx; player.dashDy = dy;
        if(dx === 0 && dy === 0) { player.dashDx = 1; player.dashDy = 0; } // Default dash right
        createSparks(player.x, player.y, '#00ffff', 15, 3);
        checkAchievements('dashUsed');
    }

    let currentSpeed = player.speed;
    if (currentWaveFeature && currentWaveFeature.playerSpeedModifier && !player.isDashing) {
        currentSpeed = (player._originalSpeed || player.speed) * currentWaveFeature.playerSpeedModifier;
    }

    if (player.isDashing && now < player.dashEndTime) {
        currentSpeed *= player.dashSpeedMultiplier;
        const dashMagnitude = Math.hypot(player.dashDx, player.dashDy);
        if (dashMagnitude > 0) {
            player.x += (player.dashDx / dashMagnitude) * currentSpeed * deltaTime;
            player.y += (player.dashDy / dashMagnitude) * currentSpeed * deltaTime;
        }
    } else {
        player.isDashing = false;
        const magnitude = Math.hypot(dx, dy);
        if (magnitude > 0) {
            player.x += (dx / magnitude) * currentSpeed * deltaTime;
            player.y += (dy / magnitude) * currentSpeed * deltaTime;
        }
    }
    player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));
}

function handlePlayerShooting(now) {
    if (now - player.lastShotTime > player.fireRate && enemies.length > 0 && gameState === 'playing') {
        let closestEnemy = null; let minDist = Infinity;
        enemies.forEach(enemy => {
            // Only target enemies within a certain range or on screen
            const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
            const isOnScreen = enemy.x > -enemy.radius && enemy.x < canvas.width + enemy.radius &&
                               enemy.y > -enemy.radius && enemy.y < canvas.height + enemy.radius;
            if (dist < minDist && (isOnScreen || dist < 800) ) { // Target on-screen or within 800px
                minDist = dist; closestEnemy = enemy;
            }
        });
        if (closestEnemy) {
            const angle = Math.atan2(closestEnemy.y - player.y, closestEnemy.x - player.x);
            playerProjectiles.push({
                x: player.x, y: player.y, radius: 5,
                speed: (upgrades.projectileSpeed || 350), angle: angle, damage: player.damage, // Speed in px/sec
                spawnTime: now, type: 'player'
            });
            player.lastShotTime = now;
        }
    }
}

function updateEnemies(deltaTime, now) {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        let currentEnemySpeed = enemy.speed;
        effectAreas.forEach(area => {
            if (area.type === 'slow' && now < area.endTime) {
                if (Math.hypot(enemy.x - area.x, enemy.y - area.y) < area.radius + enemy.radius) {
                    currentEnemySpeed *= area.slowFactor;
                }
            }
        });
        if (upgrades.enemySpeedSlowAura > 0) {
            if (Math.hypot(enemy.x - player.x, enemy.y - player.y) < (100 + (upgrades.enemySpeedSlowAura * 500)) + enemy.radius) {
                currentEnemySpeed *= (1 - upgrades.enemySpeedSlowAura);
            }
        }
        const angleToPlayer = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        enemy.x += Math.cos(angleToPlayer) * currentEnemySpeed * deltaTime;
        enemy.y += Math.sin(angleToPlayer) * currentEnemySpeed * deltaTime;

        if (enemy.type === 'shooter' && now - enemy.lastShotTime > enemy.fireRate) {
             enemyProjectiles.push({
                 x: enemy.x, y: enemy.y, radius: 6, color: enemy.color, speed: enemy.projectileSpeed,
                 angle: angleToPlayer, damage: enemy.damage, type: 'enemy'
             });
             enemy.lastShotTime = now;
        }
        if (enemy.type === 'regenerator' || (currentWaveFeature && currentWaveFeature.enemyRegen && enemy.health < enemy.maxHealth)) {
             enemy.health = Math.min(enemy.maxHealth, enemy.health + (enemy.healRate || currentWaveFeature.enemyRegen || 0) * deltaTime);
        }
        if (!player.invincible && !player.isDashing && now > player.dashEndTime) {
            if (Math.hypot(player.x - enemy.x, player.y - enemy.y) < player.radius + enemy.radius) {
               let damageTaken = enemy.damage * (1 - (upgrades.damageResistance || 0));
               player.health -= damageTaken;
               createSparks(player.x, player.y, '#ff8888', 10, 2);
               if (player.health <= 0) {
                   if (upgrades.extraLife > 0 && !upgrades.extraLife_used_this_game) {
                       upgrades.extraLife_used_this_game = true; player.health = player.maxHealth * 0.5;
                       player.invincible = true; player.invincibleEndTime = now + 2000;
                       displayGameMessage("Extra Life Consumed!", 3000, '#FFD700');
                   } else { gameState = 'gameover'; return; }
               }
            }
        }
        if(enemy.health <= 0) { handleEnemyDefeat(enemy, i); }
    }
}

function updateProjectiles(deltaTime) {
    for (let i = playerProjectiles.length - 1; i >= 0; i--) {
      const p = playerProjectiles[i];
      p.x += Math.cos(p.angle) * p.speed * deltaTime; // Speed is px/sec
      p.y += Math.sin(p.angle) * p.speed * deltaTime;
      if (p.x < -50 || p.x > canvas.width + 50 || p.y < -50 || p.y > canvas.height + 50) { // Despawn further off screen
        playerProjectiles.splice(i, 1); continue;
      }
      for (let j = enemies.length - 1; j >= 0; j--) {
        const enemy = enemies[j];
        if (Math.hypot(p.x - enemy.x, p.y - enemy.y) < projectile.radius + enemy.radius) { // Using generic projectile.radius for collision
          let damageDealt = p.damage; let isCrit = false;
          if (upgrades.criticalChance > 0 && Math.random() < upgrades.criticalChance) {
             damageDealt *= (1.5 + (upgrades.critDamage || 0)); isCrit = true;
          }
          if (upgrades.lifeSteal > 0) player.health = Math.min(player.maxHealth, player.health + damageDealt * upgrades.lifeSteal);
          enemy.health -= damageDealt; enemy.hitFlash = 15;
          createSparks(p.x, p.y, isCrit ? '#ffff00' : '#ffffff', isCrit ? 15 : 8, isCrit ? 3:2);
          if (upgrades.projectileAOE > 0) applyAreaDamage(damageDealt * 0.3, p.x, p.y, upgrades.projectileAOE);
          playerProjectiles.splice(i, 1);
          break;
        }
      }
    }
    for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
        const p = enemyProjectiles[i];
        p.x += Math.cos(p.angle) * p.speed * deltaTime;
        p.y += Math.sin(p.angle) * p.speed * deltaTime;
        if (p.x < -50 || p.x > canvas.width + 50 || p.y < -50 || p.y > canvas.height + 50) {
            enemyProjectiles.splice(i, 1); continue;
        }
        if (!player.invincible && !player.isDashing && performance.now() > player.dashEndTime) {
             if (Math.hypot(p.x - player.x, p.y - player.y) < p.radius + player.radius) {
                 let damageTaken = p.damage * (1 - (upgrades.damageResistance || 0));
                 player.health -= damageTaken;
                 createSparks(p.x, p.y, '#ff8888', 10, 2);
                 enemyProjectiles.splice(i, 1);
                 if (player.health <= 0) {
                   if (upgrades.extraLife > 0 && !upgrades.extraLife_used_this_game) {
                       upgrades.extraLife_used_this_game = true; player.health = player.maxHealth * 0.5;
                       player.invincible = true; player.invincibleEndTime = performance.now() + 2000;
                       displayGameMessage("Extra Life Consumed!", 3000, '#FFD700');
                   } else { gameState = 'gameover'; return; }
                }
                 break;
             }
        }
    }
}

function updatePowerups(deltaTime) {
    for (let i = powerups.length - 1; i >= 0; i--) {
        const p = powerups[i];
        let magnetActive = player.coinMagnet || (upgrades.coinMagnetRadius > 0); // Passive magnet also works
        let magnetRadius = 100 + (upgrades.coinMagnetRadius || 0);

        if (magnetActive && Math.hypot(player.x - p.x, player.y - p.y) < magnetRadius) {
            const angleToPlayer = Math.atan2(player.y - p.y, player.x - p.x);
            p.x += Math.cos(angleToPlayer) * 200 * deltaTime; // Magnet speed px/sec
            p.y += Math.sin(angleToPlayer) * 200 * deltaTime;
        }
        if (Math.hypot(player.x - p.x, player.y - p.y) < player.radius + p.radius) {
            applyPowerupEffect(p.type); powerups.splice(i, 1);
        } else if (performance.now() - p.createdAt > 15000) { powerups.splice(i, 1); }
    }
}

function updateParticles(deltaTime) {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * deltaTime; // vx, vy should be px/sec or scaled by fixed factor if per frame
        p.y += p.vy * deltaTime;
        p.age += deltaTime * 1000; // age in ms
        if (p.age >= p.lifetime) particles.splice(i, 1);
    }
}


// --- Game Initialization and Reset ---
function resetGame() {
   wave = 1; score = 0; coins = 0;
   enemies = []; playerProjectiles = []; enemyProjectiles = [];
   powerups = []; particles = []; effectAreas.length = 0;
   activePowerupEffects = [];

   player.health = 100; player.maxHealth = 100;
   player.speed = 250; player.fireRate = 200; player.damage = 10; // Reset to base
   upgrades.projectileSpeed = 350; // Reset base projectile speed if it's an upgrade
   player.invincible = false; player.coinMagnet = false;
   player.lastShotTime = 0; player.lastDashTime = 0;
   player.isDashing = false; delete player._originalSpeed;
   delete player._baseSpeed; delete player._baseFireRate; delete player._baseDamage;

   upgrades = {}; upgrades.extraLife_used_this_game = false;

   totalEnemiesKilled = 0; totalPowerupsCollected = 0; totalUpgradesPurchased = 0; experience = 0;
   allAchievements.forEach(a => { a.achieved = false; if (a.hasOwnProperty('count')) a.count = 0; });
   achievements = {};

   currentWaveFeature = null;
   currentStartTip = startTips[Math.floor(Math.random() * startTips.length)];
   highScore = localStorage.getItem('highScore') || 0;
   console.log("Game Reset. Player Speed:", player.speed);
}

// --- Utility Functions ---
function roundRect(ctx, x, y, width, height, radius) {
  if (typeof radius === 'number') radius = {tl: radius, tr: radius, br: radius, bl: radius};
  else { radius = {...{tl: 0, tr: 0, br: 0, bl: 0}, ...radius}; }
  ctx.beginPath(); ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y); ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br); ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height); ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl); ctx.quadraticCurveTo(x, y, x + radius.tl, y); ctx.closePath();
}
function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
}
// Global projectile for collision checking in updateProjectiles
// This is a bit of a hack, ideally projectile properties used for collision
// should be on the projectile object itself.
const projectile = { radius: 5 };


// Initial setup
resetGame();
gameLoop(performance.now());

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));
    delete window.stars; // Recreate stars for new size
});
