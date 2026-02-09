// ==========================================
// The New Ceon.fi Experience - Game Engine
// ==========================================

const TILE = 48;
const MAP_COLS = 40;
const MAP_ROWS = 30;
const MAP_W = MAP_COLS * TILE;
const MAP_H = MAP_ROWS * TILE;

// Colors
const COLORS = {
    grass1: '#1a3a2a',
    grass2: '#1e4030',
    path: '#3a3a50',
    pathEdge: '#2e2e42',
    water: '#0d2847',
    waterLight: '#143560',
    buildingWall: '#2a2a4a',
    buildingRoof: '#4fc3f7',
    buildingDoor: '#ffc107',
    tree: '#0d5a2d',
    treeTrunk: '#5d4037',
    treeHighlight: '#1b8a4a',
    player: '#4fc3f7',
    playerBody: '#1565c0',
};

// ==========================================
// Weapon Definitions
// ==========================================

const WEAPON_DEFS = {
    keyboard: {
        name: 'Mechanical Keyboard',
        icon: '\u2328\uFE0F',
        damage: 20,
        speed: 8,
        fireRate: 18,
        ammo: 30,
        color: '#b3e5fc',
        projectileSize: 5,
        description: 'Throws keycaps! Fast but light damage.',
    },
    coffee: {
        name: 'Hot Coffee Cannon',
        icon: '\u2615',
        damage: 35,
        speed: 6,
        fireRate: 30,
        ammo: 15,
        color: '#8d6e63',
        projectileSize: 7,
        description: 'Scalding hot coffee. Powerful!',
    },
    code: {
        name: 'Code Blaster',
        icon: '\uD83D\uDCBB',
        damage: 15,
        speed: 12,
        fireRate: 8,
        ammo: 50,
        color: '#4fc3f7',
        projectileSize: 4,
        description: 'Rapid fire code snippets.',
    },
    debug: {
        name: 'Debugger Ray',
        icon: '\uD83D\uDD2C',
        damage: 50,
        speed: 10,
        fireRate: 40,
        ammo: 8,
        color: '#ff5722',
        projectileSize: 9,
        description: 'The ultimate bug killer.',
    },
    agile: {
        name: 'Agile Boomerang',
        icon: '\uD83E\uDE83',
        damage: 25,
        speed: 7,
        fireRate: 22,
        ammo: 20,
        color: '#81c784',
        projectileSize: 6,
        description: 'Sprint-powered throwing weapon.',
    },
};

// All weapon keys for random selection
const WEAPON_KEYS = Object.keys(WEAPON_DEFS);

// Weapon spawn system: only one building has a weapon at a time
const weaponSpawn = {
    buildingId: null,      // which building currently holds the weapon
    weaponKey: null,       // which weapon is available
    cooldown: 0,           // ticks until next weapon spawns
    RESPAWN_TIME: 600,     // ~10 seconds between spawns
    collected: false,      // was the current weapon picked up?
};

function spawnWeaponInRandomBuilding(forceBuildingId, silent) {
    let building;
    if (forceBuildingId) {
        building = BUILDINGS.find(b => b.id === forceBuildingId);
    } else {
        const available = BUILDINGS.filter(b => b.id !== weaponSpawn.buildingId);
        building = available[Math.floor(Math.random() * available.length)];
    }
    const weapon = WEAPON_KEYS[Math.floor(Math.random() * WEAPON_KEYS.length)];
    weaponSpawn.buildingId = building.id;
    weaponSpawn.weaponKey = weapon;
    weaponSpawn.collected = false;
    weaponSpawn.cooldown = weaponSpawn.RESPAWN_TIME;
    if (state.started && !silent) {
        state.pickupNotification = {
            text: `${WEAPON_DEFS[weapon].icon} ${WEAPON_DEFS[weapon].name} appeared at ${building.label}!`,
            life: 180,
        };
    }
}

function getActiveWeaponForBuilding(buildingId) {
    if (weaponSpawn.buildingId === buildingId && !weaponSpawn.collected) {
        return weaponSpawn.weaponKey;
    }
    return null;
}

// ==========================================
// Enemy Definitions
// ==========================================

const ENEMY_TYPES = {
    bug: {
        name: 'Bug',
        hp: 30,
        speed: 1.5,
        damage: 10,
        color: '#f44336',
        bodyColor: '#b71c1c',
        size: 20,
        score: 10,
        aggroRange: 250,
        attackCooldown: 60,
    },
    legacyCode: {
        name: 'Legacy Code',
        hp: 60,
        speed: 0.8,
        damage: 20,
        color: '#9c27b0',
        bodyColor: '#4a148c',
        size: 26,
        score: 25,
        aggroRange: 200,
        attackCooldown: 90,
    },
    techDebt: {
        name: 'Tech Debt',
        hp: 100,
        speed: 1.0,
        damage: 30,
        color: '#ff9800',
        bodyColor: '#e65100',
        size: 30,
        score: 50,
        aggroRange: 300,
        attackCooldown: 75,
    },
    nullPointer: {
        name: 'NullPointer',
        hp: 20,
        speed: 3.0,
        damage: 15,
        color: '#00bcd4',
        bodyColor: '#006064',
        size: 16,
        score: 15,
        aggroRange: 350,
        attackCooldown: 40,
    },
};

// ==========================================
// Building definitions
// ==========================================

const BUILDINGS = [
    {
        id: 'home',
        label: 'Ceon HQ',
        contentId: 'content-home',
        x: 17, y: 12,
        w: 6, h: 5,
        color: '#1565c0',
        roofColor: '#4fc3f7',
    },
    {
        id: 'palvelumuotoilu',
        label: 'Palvelumuotoilu',
        contentId: 'content-palvelumuotoilu',
        x: 5, y: 5,
        w: 5, h: 4,
        color: '#6a1b9a',
        roofColor: '#ce93d8',
    },
    {
        id: 'ohjelmistokehitys',
        label: 'Ohjelmistokehitys',
        contentId: 'content-ohjelmistokehitys',
        x: 28, y: 5,
        w: 6, h: 4,
        color: '#e65100',
        roofColor: '#ffb74d',
    },
    {
        id: 'yllapito',
        label: 'Ylläpito',
        contentId: 'content-yllapito',
        x: 5, y: 21,
        w: 5, h: 4,
        color: '#1b5e20',
        roofColor: '#81c784',
    },
    {
        id: 'yhteystiedot',
        label: 'Yhteystiedot',
        contentId: 'content-yhteystiedot',
        x: 29, y: 21,
        w: 5, h: 4,
        color: '#b71c1c',
        roofColor: '#ef9a9a',
    },
];

// ==========================================
// Map generation helpers
// ==========================================

const TREES = [];
function generateTrees() {
    TREES.length = 0;
    const rng = mulberry32(42);
    for (let i = 0; i < 80; i++) {
        const tx = Math.floor(rng() * MAP_COLS);
        const ty = Math.floor(rng() * MAP_ROWS);
        if (!isOccupied(tx, ty) && !isPath(tx, ty)) {
            TREES.push({ x: tx, y: ty, size: 0.7 + rng() * 0.5 });
        }
    }
}

function mulberry32(a) {
    return function() {
        a |= 0; a = a + 0x6D2B79F5 | 0;
        var t = Math.imul(a ^ a >>> 15, 1 | a);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

function generatePaths() {
    const paths = new Set();
    const centerX = 20;
    const centerY = 14;

    for (let x = 2; x < MAP_COLS - 2; x++) {
        for (let dy = -1; dy <= 1; dy++) paths.add(`${x},${centerY + dy}`);
    }
    for (let y = 2; y < MAP_ROWS - 2; y++) {
        for (let dx = -1; dx <= 1; dx++) paths.add(`${centerX + dx},${y}`);
    }

    BUILDINGS.forEach(b => {
        const bCenterX = b.x + Math.floor(b.w / 2);
        const bBottom = b.y + b.h;
        const bTop = b.y - 1;

        if (b.y < centerY) {
            for (let y = bBottom; y <= centerY + 1; y++) {
                for (let dx = -1; dx <= 1; dx++) paths.add(`${bCenterX + dx},${y}`);
            }
        } else {
            for (let y = centerY - 1; y <= bTop; y++) {
                for (let dx = -1; dx <= 1; dx++) paths.add(`${bCenterX + dx},${y}`);
            }
        }

        const connY = centerY;
        const startX = Math.min(bCenterX, centerX);
        const endX = Math.max(bCenterX, centerX);
        for (let x = startX; x <= endX; x++) {
            for (let dy = -1; dy <= 1; dy++) paths.add(`${x},${connY + dy}`);
        }
    });

    return paths;
}

let PATH_SET;

function isPath(tx, ty) {
    return PATH_SET && PATH_SET.has(`${tx},${ty}`);
}

function isOccupied(tx, ty) {
    for (const b of BUILDINGS) {
        if (tx >= b.x - 1 && tx <= b.x + b.w && ty >= b.y - 1 && ty <= b.y + b.h) return true;
    }
    return false;
}

const WATER_TILES = new Set();
function generateWater() {
    WATER_TILES.clear();
    for (let x = 34; x <= 37; x++) {
        for (let y = 13; y <= 16; y++) {
            if (!isOccupied(x, y)) WATER_TILES.add(`${x},${y}`);
        }
    }
    for (let x = 1; x <= 3; x++) {
        for (let y = 13; y <= 15; y++) {
            if (!isOccupied(x, y)) WATER_TILES.add(`${x},${y}`);
        }
    }
}

function isWater(tx, ty) {
    return WATER_TILES.has(`${tx},${ty}`);
}

// ==========================================
// Game State
// ==========================================

const state = {
    player: {
        x: 20 * TILE, y: 18 * TILE,
        dir: 0, frame: 0, speed: 3.5,
        hp: 100, maxHp: 100,
        weapon: null,
        ammo: 0,
        fireCooldown: 0,
        invincible: 0,
        dead: false,
    },
    camera: { x: 0, y: 0 },
    keys: {},
    mouse: { x: 0, y: 0 },
    nearBuilding: null,
    modalOpen: false,
    started: false,
    time: 0,
    enemies: [],
    projectiles: [],
    particles: [],
    pickupNotification: null,
    score: 0,
    wave: 0,
    waveTimer: 0,
    collectedWeapons: new Set(),
    weaponSpawnReady: false,
};

// ==========================================
// Canvas setup
// ==========================================

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const minimapCanvas = document.getElementById('minimap');
const minimapCtx = minimapCanvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    minimapCanvas.width = 180;
    minimapCanvas.height = 140;
}
window.addEventListener('resize', resize);
resize();

// ==========================================
// Input
// ==========================================

window.addEventListener('keydown', e => {
    state.keys[e.key.toLowerCase()] = true;
    if ((e.key.toLowerCase() === 'e' || e.key === 'Enter') && !state.modalOpen && !state.player.dead) {
        if (state.nearBuilding) {
            openModal(state.nearBuilding);
        }
    }
    if (e.key === 'Escape' && state.modalOpen) {
        closeModal();
    }
    if (e.key === ' ' && !state.modalOpen && !state.player.dead && state.started) {
        tryShoot();
    }
});

window.addEventListener('keyup', e => {
    state.keys[e.key.toLowerCase()] = false;
});

window.addEventListener('keydown', e => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
});

canvas.addEventListener('mousemove', e => {
    state.mouse.x = e.clientX;
    state.mouse.y = e.clientY;
});

canvas.addEventListener('click', e => {
    if (!state.modalOpen && !state.player.dead && state.started) {
        state.mouse.x = e.clientX;
        state.mouse.y = e.clientY;
        tryShoot();
    }
});

// ==========================================
// Shooting
// ==========================================

function tryShoot() {
    const p = state.player;
    if (!p.weapon || p.ammo <= 0 || p.fireCooldown > 0) return;

    const wDef = WEAPON_DEFS[p.weapon];
    p.fireCooldown = wDef.fireRate;
    p.ammo--;

    // Direction toward mouse
    const px = p.x + TILE / 2 - state.camera.x;
    const py = p.y + TILE / 2 - state.camera.y;
    const angle = Math.atan2(state.mouse.y - py, state.mouse.x - px);

    state.projectiles.push({
        x: p.x + TILE / 2,
        y: p.y + TILE / 2,
        vx: Math.cos(angle) * wDef.speed,
        vy: Math.sin(angle) * wDef.speed,
        damage: wDef.damage,
        color: wDef.color,
        size: wDef.projectileSize,
        life: 120,
        fromPlayer: true,
    });

    // Muzzle particles
    for (let i = 0; i < 4; i++) {
        state.particles.push({
            x: p.x + TILE / 2,
            y: p.y + TILE / 2,
            vx: Math.cos(angle) * (3 + Math.random() * 3) + (Math.random() - 0.5) * 2,
            vy: Math.sin(angle) * (3 + Math.random() * 3) + (Math.random() - 0.5) * 2,
            life: 10 + Math.random() * 10,
            color: wDef.color,
            size: 2 + Math.random() * 2,
        });
    }

    updateWeaponHUD();
}

// ==========================================
// Enemy spawning
// ==========================================

function spawnEnemyWave() {
    state.wave++;
    const count = 3 + Math.floor(state.wave * 1.5);
    const types = Object.keys(ENEMY_TYPES);

    for (let i = 0; i < count; i++) {
        // Pick type based on wave difficulty
        let typeIdx = Math.floor(Math.random() * Math.min(types.length, 1 + Math.floor(state.wave / 2)));
        const type = types[typeIdx];
        const def = ENEMY_TYPES[type];

        // Spawn at map edges (inside bounds)
        let sx, sy;
        const edge = Math.floor(Math.random() * 4);
        switch (edge) {
            case 0: sx = TILE * 2 + Math.random() * (MAP_W - TILE * 4); sy = TILE * 2; break;
            case 1: sx = MAP_W - TILE * 2; sy = TILE * 2 + Math.random() * (MAP_H - TILE * 4); break;
            case 2: sx = TILE * 2 + Math.random() * (MAP_W - TILE * 4); sy = MAP_H - TILE * 2; break;
            case 3: sx = TILE * 2; sy = TILE * 2 + Math.random() * (MAP_H - TILE * 4); break;
        }

        // Avoid spawning on buildings
        let onBuilding = false;
        for (const b of BUILDINGS) {
            if (sx > (b.x - 1) * TILE && sx < (b.x + b.w + 1) * TILE &&
                sy > (b.y - 1) * TILE && sy < (b.y + b.h + 1) * TILE) {
                onBuilding = true;
                break;
            }
        }
        if (onBuilding) { i--; continue; }

        // Initial angle points toward player
        const angleToPlayer = Math.atan2(
            state.player.y + TILE / 2 - sy,
            state.player.x + TILE / 2 - sx
        );

        state.enemies.push({
            x: sx, y: sy,
            hp: def.hp + state.wave * 3,
            maxHp: def.hp + state.wave * 3,
            type: type,
            speed: def.speed + state.wave * 0.05,
            damage: def.damage,
            attackCooldown: 0,
            maxAttackCooldown: def.attackCooldown,
            patrolAngle: angleToPlayer + (Math.random() - 0.5) * 0.5,
            patrolTimer: 0,
            hitFlash: 0,
        });
    }
}

// ==========================================
// Modal & Weapon Pickup
// ==========================================

function openModal(building) {
    state.modalOpen = true;
    const template = document.getElementById(building.contentId);
    const content = template.content.cloneNode(true);
    const contentDiv = document.getElementById('modal-content');
    contentDiv.innerHTML = '';
    contentDiv.appendChild(content);

    // Add weapon pickup only if this building has the active spawn
    const weaponKey = getActiveWeaponForBuilding(building.id);
    if (weaponKey) {
        const wDef = WEAPON_DEFS[weaponKey];
        const pickupDiv = document.createElement('div');
        pickupDiv.className = 'weapon-pickup-section';

        pickupDiv.innerHTML = `
            <div class="weapon-pickup-card">
                <div class="weapon-pickup-icon">${wDef.icon}</div>
                <div class="weapon-pickup-info">
                    <h3>${wDef.name}</h3>
                    <p>${wDef.description}</p>
                    <p class="weapon-stats">Damage: ${wDef.damage} | Ammo: ${wDef.ammo} | Fire rate: ${Math.round(60/wDef.fireRate)}/s</p>
                </div>
                <button class="weapon-pickup-btn" id="pickup-weapon-btn">Pick Up!</button>
            </div>
        `;
        contentDiv.appendChild(pickupDiv);

        setTimeout(() => {
            const btn = document.getElementById('pickup-weapon-btn');
            if (btn) {
                btn.addEventListener('click', () => {
                    state.player.weapon = weaponKey;
                    state.player.ammo = wDef.ammo;
                    weaponSpawn.collected = true;
                    updateWeaponHUD();
                    showPickupNotification(wDef);
                    btn.textContent = 'Equipped!';
                    btn.disabled = true;
                    btn.style.opacity = '0.6';
                });
            }
        }, 0);
    }

    document.getElementById('modal-overlay').classList.remove('hidden');
}

function closeModal() {
    state.modalOpen = false;
    document.getElementById('modal-overlay').classList.add('hidden');
}

document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-overlay')) closeModal();
});

function showPickupNotification(wDef) {
    state.pickupNotification = {
        text: `Picked up ${wDef.name}! ${wDef.icon}`,
        life: 120,
    };
}

// ==========================================
// HUD Updates
// ==========================================

function updateHealthHUD() {
    const p = state.player;
    const pct = Math.max(0, p.hp / p.maxHp) * 100;
    const fill = document.getElementById('health-fill');
    fill.style.width = pct + '%';
    fill.classList.remove('low', 'medium');
    if (pct <= 25) fill.classList.add('low');
    else if (pct <= 50) fill.classList.add('medium');
    document.getElementById('health-text').textContent = Math.max(0, Math.ceil(p.hp));
}

function updateWeaponHUD() {
    const p = state.player;
    const icon = document.getElementById('weapon-icon');
    const name = document.getElementById('weapon-name');
    const ammo = document.getElementById('ammo-count');

    if (p.weapon) {
        const wDef = WEAPON_DEFS[p.weapon];
        icon.textContent = wDef.icon;
        name.textContent = wDef.name;
        ammo.textContent = `${p.ammo}/${wDef.ammo}`;
    } else {
        icon.textContent = '';
        name.textContent = 'No weapon';
        ammo.textContent = 'Visit a building!';
    }
}

function updateScoreHUD() {
    document.getElementById('score-value').textContent = state.score;
}

// ==========================================
// Death & Respawn
// ==========================================

function playerDeath() {
    state.player.dead = true;
    document.getElementById('death-screen').classList.remove('hidden');
    document.getElementById('death-score').textContent = `Score: ${state.score}`;
}

// Contact form submission
document.getElementById('contact-form').addEventListener('submit', (e) => {
    e.preventDefault();
    document.getElementById('contact-form').classList.add('hidden');
    document.getElementById('form-success').classList.remove('hidden');
    // In production, you'd POST to an API here
});

document.getElementById('respawn-btn').addEventListener('click', () => {
    state.player.hp = state.player.maxHp;
    state.player.dead = false;
    state.player.invincible = 120;
    state.player.x = 20 * TILE;
    state.player.y = 18 * TILE;
    state.enemies = [];
    state.projectiles = [];
    state.particles = [];
    state.score = 0;
    state.wave = 0;
    state.waveTimer = 0;
    // Reset weapon spawn — first weapon at HQ again
    weaponSpawn.buildingId = null;
    weaponSpawn.weaponKey = null;
    weaponSpawn.collected = false;
    weaponSpawn.cooldown = 0;
    state.player.weapon = null;
    state.player.ammo = 0;
    spawnWeaponInRandomBuilding('home', true);
    document.getElementById('death-screen').classList.add('hidden');
    document.getElementById('contact-form').reset();
    document.getElementById('contact-form').classList.remove('hidden');
    document.getElementById('form-success').classList.add('hidden');
    updateHealthHUD();
    updateScoreHUD();
});

// ==========================================
// Welcome screen
// ==========================================

document.getElementById('start-btn').addEventListener('click', () => {
    document.getElementById('welcome-screen').classList.add('hidden');
    state.started = true;
    updateWeaponHUD();
    updateHealthHUD();
});

// ==========================================
// Collision detection
// ==========================================

function canMoveTo(px, py) {
    const margin = 8;
    const left = px + margin;
    const right = px + TILE - margin;
    const top = py + margin;
    const bottom = py + TILE - margin;

    if (left < 0 || right > MAP_W || top < 0 || bottom > MAP_H) return false;

    for (const b of BUILDINGS) {
        const bLeft = b.x * TILE;
        const bRight = (b.x + b.w) * TILE;
        const bTop = b.y * TILE;
        const bBottom = (b.y + b.h) * TILE;
        if (right > bLeft && left < bRight && bottom > bTop && top < bBottom) return false;
    }

    const tileChecks = [
        [Math.floor(left / TILE), Math.floor(top / TILE)],
        [Math.floor(right / TILE), Math.floor(top / TILE)],
        [Math.floor(left / TILE), Math.floor(bottom / TILE)],
        [Math.floor(right / TILE), Math.floor(bottom / TILE)],
    ];
    for (const [tx, ty] of tileChecks) {
        if (isWater(tx, ty)) return false;
    }

    return true;
}

function enemyCollidesBuilding(ex, ey, size) {
    for (const b of BUILDINGS) {
        const bLeft = b.x * TILE;
        const bRight = (b.x + b.w) * TILE;
        const bTop = b.y * TILE;
        const bBottom = (b.y + b.h) * TILE;
        if (ex + size > bLeft && ex - size < bRight && ey + size > bTop && ey - size < bBottom) return true;
    }
    return false;
}

// ==========================================
// Update
// ==========================================

function update() {
    if (!state.started || state.player.dead) return;

    const p = state.player;
    state.time++;

    // Player movement (skip if modal open)
    if (!state.modalOpen) {
        let dx = 0, dy = 0;
        if (state.keys['w'] || state.keys['arrowup']) dy = -1;
        if (state.keys['s'] || state.keys['arrowdown']) dy = 1;
        if (state.keys['a'] || state.keys['arrowleft']) dx = -1;
        if (state.keys['d'] || state.keys['arrowright']) dx = 1;

        if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }

        const newX = p.x + dx * p.speed;
        const newY = p.y + dy * p.speed;

        if (canMoveTo(newX, newY)) { p.x = newX; p.y = newY; }
        else if (canMoveTo(newX, p.y)) { p.x = newX; }
        else if (canMoveTo(p.x, newY)) { p.y = newY; }

        if (dx !== 0 || dy !== 0) {
            if (Math.abs(dx) > Math.abs(dy)) p.dir = dx > 0 ? 1 : 3;
            else p.dir = dy > 0 ? 0 : 2;
            p.frame += 0.15;
        }
    }

    // Camera
    state.camera.x = p.x + TILE / 2 - canvas.width / 2;
    state.camera.y = p.y + TILE / 2 - canvas.height / 2;
    state.camera.x = Math.max(0, Math.min(MAP_W - canvas.width, state.camera.x));
    state.camera.y = Math.max(0, Math.min(MAP_H - canvas.height, state.camera.y));

    // Building proximity
    state.nearBuilding = null;
    const pCenterX = p.x + TILE / 2;
    const pCenterY = p.y + TILE / 2;

    for (const b of BUILDINGS) {
        const bCenterX = (b.x + b.w / 2) * TILE;
        const bCenterY = (b.y + b.h / 2) * TILE;
        const dist = Math.hypot(pCenterX - bCenterX, pCenterY - bCenterY);
        const threshold = Math.max(b.w, b.h) * TILE * 0.8;
        if (dist < threshold) {
            state.nearBuilding = b;
            break;
        }
    }

    // Interact prompt
    const prompt = document.getElementById('interact-prompt');
    const promptText = document.getElementById('interact-text');
    if (state.nearBuilding && !state.modalOpen) {
        prompt.classList.remove('hidden');
        const activeWeapon = getActiveWeaponForBuilding(state.nearBuilding.id);
        const weaponHint = activeWeapon ? ` (${WEAPON_DEFS[activeWeapon].icon} weapon inside!)` : '';
        promptText.textContent = `Press E to enter ${state.nearBuilding.label}${weaponHint}`;
    } else {
        prompt.classList.add('hidden');
    }

    // Cooldowns
    if (p.fireCooldown > 0) p.fireCooldown--;
    if (p.invincible > 0) p.invincible--;

    // --- Weapon spawn system ---
    if (!state.modalOpen) {
        // First weapon spawns immediately at Ceon HQ (silent)
        if (weaponSpawn.buildingId === null) {
            spawnWeaponInRandomBuilding('home', true);
        }
        // Spawn new weapon when ammo runs out
        if (weaponSpawn.collected && p.weapon && p.ammo <= 0) {
            spawnWeaponInRandomBuilding();
            p.weapon = null;
            updateWeaponHUD();
        }
    }

    // --- Enemy wave spawning ---
    if (!state.modalOpen) {
        state.waveTimer++;
        if (state.waveTimer >= 600 && state.enemies.length < 5) {
            spawnEnemyWave();
            state.waveTimer = 0;
        }
        // Spawn initial wave
        if (state.wave === 0 && state.time > 120) {
            spawnEnemyWave();
        }
    }

    // --- Update enemies ---
    for (let i = state.enemies.length - 1; i >= 0; i--) {
        const e = state.enemies[i];
        const def = ENEMY_TYPES[e.type];

        const distToPlayer = Math.hypot(pCenterX - e.x, pCenterY - e.y);
        const inRange = distToPlayer < def.aggroRange;

        if (e.hitFlash > 0) e.hitFlash--;

        if (inRange && !state.modalOpen) {
            // Chase player
            const angle = Math.atan2(pCenterY - e.y, pCenterX - e.x);
            const nx = e.x + Math.cos(angle) * e.speed;
            const ny = e.y + Math.sin(angle) * e.speed;
            if (!enemyCollidesBuilding(nx, ny, def.size * 0.5)) {
                e.x = nx;
                e.y = ny;
            } else {
                // Try to slide around buildings
                const nx2 = e.x + Math.cos(angle) * e.speed;
                if (!enemyCollidesBuilding(nx2, e.y, def.size * 0.5)) e.x = nx2;
                else {
                    const ny2 = e.y + Math.sin(angle) * e.speed;
                    if (!enemyCollidesBuilding(e.x, ny2, def.size * 0.5)) e.y = ny2;
                }
            }

            // Attack player on contact
            if (distToPlayer < def.size + 20) {
                if (e.attackCooldown <= 0 && p.invincible <= 0) {
                    p.hp -= e.damage;
                    e.attackCooldown = e.maxAttackCooldown;
                    // Damage flash
                    const flash = document.getElementById('damage-flash');
                    flash.classList.add('active');
                    setTimeout(() => flash.classList.remove('active'), 150);
                    updateHealthHUD();
                    if (p.hp <= 0) {
                        playerDeath();
                        return;
                    }
                }
            }
        } else {
            // Roam toward player slowly so they always eventually find you
            const angleToPlayer = Math.atan2(pCenterY - e.y, pCenterX - e.x);
            e.patrolTimer++;
            if (e.patrolTimer > 90) {
                // Drift toward player with some randomness
                e.patrolAngle = angleToPlayer + (Math.random() - 0.5) * 1.2;
                e.patrolTimer = 0;
            }
            const nx = e.x + Math.cos(e.patrolAngle) * e.speed * 0.6;
            const ny = e.y + Math.sin(e.patrolAngle) * e.speed * 0.6;
            if (nx > TILE && nx < MAP_W - TILE && ny > TILE && ny < MAP_H - TILE) {
                if (!enemyCollidesBuilding(nx, ny, def.size * 0.5)) {
                    e.x = nx;
                    e.y = ny;
                } else {
                    e.patrolAngle += Math.PI * 0.5;
                }
            } else {
                // If at edge, turn toward center
                e.patrolAngle = Math.atan2(MAP_H / 2 - e.y, MAP_W / 2 - e.x) + (Math.random() - 0.5) * 0.5;
            }
        }

        if (e.attackCooldown > 0) e.attackCooldown--;
    }

    // --- Update projectiles ---
    for (let i = state.projectiles.length - 1; i >= 0; i--) {
        const proj = state.projectiles[i];
        proj.x += proj.vx;
        proj.y += proj.vy;
        proj.life--;

        if (proj.life <= 0 || proj.x < 0 || proj.x > MAP_W || proj.y < 0 || proj.y > MAP_H) {
            state.projectiles.splice(i, 1);
            continue;
        }

        // Check building collision
        let hitBuilding = false;
        for (const b of BUILDINGS) {
            if (proj.x > b.x * TILE && proj.x < (b.x + b.w) * TILE &&
                proj.y > b.y * TILE && proj.y < (b.y + b.h) * TILE) {
                hitBuilding = true;
                break;
            }
        }
        if (hitBuilding) {
            // Spark particles
            for (let j = 0; j < 3; j++) {
                state.particles.push({
                    x: proj.x, y: proj.y,
                    vx: (Math.random() - 0.5) * 4,
                    vy: (Math.random() - 0.5) * 4,
                    life: 15, color: '#fff', size: 2,
                });
            }
            state.projectiles.splice(i, 1);
            continue;
        }

        // Hit enemies (only player projectiles)
        if (proj.fromPlayer) {
            for (let j = state.enemies.length - 1; j >= 0; j--) {
                const e = state.enemies[j];
                const def = ENEMY_TYPES[e.type];
                const dist = Math.hypot(proj.x - e.x, proj.y - e.y);
                if (dist < def.size + proj.size) {
                    e.hp -= proj.damage;
                    e.hitFlash = 8;

                    // Hit particles
                    for (let k = 0; k < 6; k++) {
                        state.particles.push({
                            x: proj.x, y: proj.y,
                            vx: (Math.random() - 0.5) * 5,
                            vy: (Math.random() - 0.5) * 5,
                            life: 20 + Math.random() * 10,
                            color: def.color,
                            size: 2 + Math.random() * 3,
                        });
                    }

                    state.projectiles.splice(i, 1);

                    if (e.hp <= 0) {
                        // Death explosion
                        for (let k = 0; k < 15; k++) {
                            const angle = Math.random() * Math.PI * 2;
                            const spd = 1 + Math.random() * 4;
                            state.particles.push({
                                x: e.x, y: e.y,
                                vx: Math.cos(angle) * spd,
                                vy: Math.sin(angle) * spd,
                                life: 30 + Math.random() * 20,
                                color: def.color,
                                size: 3 + Math.random() * 4,
                            });
                        }
                        state.score += def.score;
                        updateScoreHUD();
                        state.enemies.splice(j, 1);
                    }
                    break;
                }
            }
        }
    }

    // --- Update particles ---
    for (let i = state.particles.length - 1; i >= 0; i--) {
        const part = state.particles[i];
        part.x += part.vx;
        part.y += part.vy;
        part.vx *= 0.95;
        part.vy *= 0.95;
        part.life--;
        if (part.life <= 0) state.particles.splice(i, 1);
    }

    // --- Pickup notification ---
    if (state.pickupNotification) {
        state.pickupNotification.life--;
        if (state.pickupNotification.life <= 0) state.pickupNotification = null;
    }
}

// ==========================================
// Rendering
// ==========================================

function drawGround() {
    const startCol = Math.max(0, Math.floor(state.camera.x / TILE));
    const endCol = Math.min(MAP_COLS, Math.ceil((state.camera.x + canvas.width) / TILE) + 1);
    const startRow = Math.max(0, Math.floor(state.camera.y / TILE));
    const endRow = Math.min(MAP_ROWS, Math.ceil((state.camera.y + canvas.height) / TILE) + 1);

    for (let row = startRow; row < endRow; row++) {
        for (let col = startCol; col < endCol; col++) {
            const sx = col * TILE - state.camera.x;
            const sy = row * TILE - state.camera.y;

            if (isWater(col, row)) {
                const wave = Math.sin(state.time * 0.03 + col * 0.5 + row * 0.3) * 0.5 + 0.5;
                ctx.fillStyle = wave > 0.5 ? COLORS.water : COLORS.waterLight;
                ctx.fillRect(sx, sy, TILE, TILE);
                if (Math.sin(state.time * 0.05 + col * 3.7 + row * 2.3) > 0.85) {
                    ctx.fillStyle = 'rgba(255,255,255,0.15)';
                    ctx.fillRect(sx + TILE * 0.3, sy + TILE * 0.3, 4, 4);
                }
            } else if (isPath(col, row)) {
                ctx.fillStyle = COLORS.path;
                ctx.fillRect(sx, sy, TILE, TILE);
                if ((col + row) % 4 === 0) {
                    ctx.fillStyle = COLORS.pathEdge;
                    ctx.fillRect(sx, sy, TILE, 1);
                    ctx.fillRect(sx, sy, 1, TILE);
                }
            } else {
                ctx.fillStyle = (col + row) % 2 === 0 ? COLORS.grass1 : COLORS.grass2;
                ctx.fillRect(sx, sy, TILE, TILE);
                if ((col * 7 + row * 13) % 5 === 0) {
                    ctx.fillStyle = 'rgba(40, 120, 60, 0.3)';
                    ctx.fillRect(sx + 10, sy + 20, 2, 6);
                    ctx.fillRect(sx + 30, sy + 10, 2, 5);
                }
            }
        }
    }
}

function drawBuilding(b) {
    const sx = b.x * TILE - state.camera.x;
    const sy = b.y * TILE - state.camera.y;
    const w = b.w * TILE;
    const h = b.h * TILE;

    if (sx + w < 0 || sx > canvas.width || sy + h + TILE < 0 || sy - TILE > canvas.height) return;

    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(sx + 6, sy + 6, w, h);

    ctx.fillStyle = b.color;
    ctx.fillRect(sx, sy, w, h);

    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 2;
    ctx.strokeRect(sx, sy, w, h);

    ctx.fillStyle = b.roofColor;
    ctx.fillRect(sx, sy, w, 6);

    const windowRows = Math.floor((h - 40) / 30);
    const windowCols = Math.floor((w - 20) / 35);
    for (let wr = 0; wr < windowRows; wr++) {
        for (let wc = 0; wc < windowCols; wc++) {
            const wx = sx + 18 + wc * 35;
            const wy = sy + 24 + wr * 30;
            const glow = Math.sin(state.time * 0.02 + wr * 1.5 + wc * 2.3) > 0 ? 0.5 : 0.3;
            ctx.fillStyle = `rgba(255, 235, 130, ${glow})`;
            ctx.fillRect(wx, wy, 18, 14);
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.lineWidth = 1;
            ctx.strokeRect(wx, wy, 18, 14);
        }
    }

    const doorX = sx + w / 2 - 10;
    const doorY = sy + h - 28;
    ctx.fillStyle = COLORS.buildingDoor;
    ctx.fillRect(doorX, doorY, 20, 28);
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(doorX, doorY, 20, 2);

    // Weapon icon above building (only if this building has the active spawn)
    const activeWeapon = getActiveWeaponForBuilding(b.id);
    if (activeWeapon) {
        const wDef = WEAPON_DEFS[activeWeapon];
        const bobY = Math.sin(state.time * 0.06) * 6;

        // Glow beacon
        ctx.save();
        const glowSize = 30 + Math.sin(state.time * 0.08) * 8;
        const gradient = ctx.createRadialGradient(sx + w / 2, sy - 20 + bobY, 0, sx + w / 2, sy - 20 + bobY, glowSize);
        gradient.addColorStop(0, 'rgba(255, 193, 7, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 193, 7, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(sx + w / 2, sy - 20 + bobY, glowSize, 0, Math.PI * 2);
        ctx.fill();

        // Icon
        ctx.font = '24px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(255,193,7,0.8)';
        ctx.shadowBlur = 12;
        ctx.fillText(wDef.icon, sx + w / 2, sy - 14 + bobY);
        ctx.restore();
    }

    if (state.nearBuilding === b) {
        ctx.save();
        ctx.strokeStyle = b.roofColor;
        ctx.lineWidth = 3;
        ctx.shadowColor = b.roofColor;
        ctx.shadowBlur = 15 + Math.sin(state.time * 0.08) * 5;
        ctx.strokeRect(sx - 4, sy - 4, w + 8, h + 8);
        ctx.restore();
    }

    ctx.save();
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 4;
    ctx.fillText(b.label, sx + w / 2, sy - 10);
    ctx.restore();
}

function drawTree(tree) {
    const sx = tree.x * TILE - state.camera.x + TILE / 2;
    const sy = tree.y * TILE - state.camera.y + TILE / 2;
    const s = tree.size;

    if (sx < -TILE || sx > canvas.width + TILE || sy < -TILE || sy > canvas.height + TILE) return;

    ctx.fillStyle = COLORS.treeTrunk;
    ctx.fillRect(sx - 3 * s, sy + 4 * s, 6 * s, 14 * s);

    ctx.fillStyle = COLORS.tree;
    ctx.beginPath();
    ctx.arc(sx, sy - 2 * s, 14 * s, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = COLORS.treeHighlight;
    ctx.beginPath();
    ctx.arc(sx - 3 * s, sy - 5 * s, 9 * s, 0, Math.PI * 2);
    ctx.fill();
}

function drawPlayer() {
    const p = state.player;
    const sx = p.x - state.camera.x;
    const sy = p.y - state.camera.y;
    const bounce = Math.abs(Math.sin(p.frame)) * 3;

    // Invincibility flash
    if (p.invincible > 0 && Math.floor(p.invincible / 4) % 2 === 0) return;

    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(sx + TILE / 2, sy + TILE - 4, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = COLORS.playerBody;
    ctx.fillRect(sx + 14, sy + 18 - bounce, 20, 24);

    ctx.fillStyle = COLORS.player;
    ctx.beginPath();
    ctx.arc(sx + TILE / 2, sy + 14 - bounce, 11, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    const eyeOffsets = [
        [[-3, -1], [3, -1]],
        [[2, -2], [6, -2]],
        [[-3, -3], [3, -3]],
        [[-6, -2], [-2, -2]],
    ];
    const eyes = eyeOffsets[p.dir];
    for (const [ex, ey] of eyes) {
        ctx.beginPath();
        ctx.arc(sx + TILE / 2 + ex, sy + 14 + ey - bounce, 2.5, 0, Math.PI * 2);
        ctx.fill();
    }

    // Weapon in hand
    if (p.weapon) {
        ctx.save();
        ctx.font = '14px system-ui, sans-serif';
        const handOffsets = [[0, 12], [14, 6], [0, -6], [-14, 6]];
        const ho = handOffsets[p.dir];
        ctx.fillText(WEAPON_DEFS[p.weapon].icon, sx + TILE / 2 + ho[0] - 7, sy + 20 + ho[1] - bounce);
        ctx.restore();
    }

    ctx.save();
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#4fc3f7';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 3;
    ctx.fillText('Vierailija', sx + TILE / 2, sy - 4);
    ctx.restore();
}

function drawEnemy(e) {
    const def = ENEMY_TYPES[e.type];
    const sx = e.x - state.camera.x;
    const sy = e.y - state.camera.y;

    if (sx < -50 || sx > canvas.width + 50 || sy < -50 || sy > canvas.height + 50) return;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(sx, sy + def.size * 0.6, def.size * 0.6, def.size * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body glow
    ctx.save();
    ctx.shadowColor = def.color;
    ctx.shadowBlur = 8 + Math.sin(state.time * 0.1 + e.x) * 3;

    // Flash white when hit
    const bodyColor = e.hitFlash > 0 ? '#fff' : def.bodyColor;
    const headColor = e.hitFlash > 0 ? '#fff' : def.color;

    // Body
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(sx, sy, def.size * 0.7, 0, Math.PI * 2);
    ctx.fill();

    // Head / spikes based on type
    ctx.fillStyle = headColor;

    if (e.type === 'bug') {
        // Bug antenna
        ctx.beginPath();
        ctx.arc(sx, sy - def.size * 0.3, def.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        // Legs
        const legAngle = Math.sin(state.time * 0.15) * 0.3;
        for (let l = 0; l < 3; l++) {
            const la = (l - 1) * 0.8 + legAngle;
            ctx.fillRect(sx + Math.cos(la) * def.size * 0.5 - 1, sy + 2, 3, def.size * 0.5);
            ctx.fillRect(sx - Math.cos(la) * def.size * 0.5 - 1, sy + 2, 3, def.size * 0.5);
        }
    } else if (e.type === 'legacyCode') {
        // Blocky shape
        ctx.fillRect(sx - def.size * 0.5, sy - def.size * 0.5, def.size, def.size);
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${def.size * 0.4}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText('{ }', sx, sy + def.size * 0.15);
    } else if (e.type === 'techDebt') {
        // Spiky monster
        for (let s = 0; s < 8; s++) {
            const a = (s / 8) * Math.PI * 2 + state.time * 0.02;
            const spikeLen = def.size * (0.8 + Math.sin(state.time * 0.1 + s) * 0.2);
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx + Math.cos(a) * spikeLen, sy + Math.sin(a) * spikeLen);
            ctx.lineWidth = 4;
            ctx.strokeStyle = headColor;
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(sx, sy, def.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
    } else if (e.type === 'nullPointer') {
        // Small fast glitchy
        ctx.beginPath();
        ctx.arc(sx, sy, def.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        // Glitch effect
        if (Math.random() > 0.7) {
            ctx.fillStyle = headColor;
            ctx.fillRect(sx + (Math.random() - 0.5) * 20, sy + (Math.random() - 0.5) * 20, 6, 2);
        }
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${def.size * 0.6}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText('?', sx, sy + def.size * 0.2);
    }

    ctx.restore();

    // Evil eyes
    if (e.type !== 'legacyCode' && e.type !== 'nullPointer') {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(sx - def.size * 0.15, sy - def.size * 0.15, 3, 0, Math.PI * 2);
        ctx.arc(sx + def.size * 0.15, sy - def.size * 0.15, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(sx - def.size * 0.15, sy - def.size * 0.15, 1.5, 0, Math.PI * 2);
        ctx.arc(sx + def.size * 0.15, sy - def.size * 0.15, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }

    // Health bar
    if (e.hp < e.maxHp) {
        const barW = def.size * 1.2;
        const barH = 4;
        const barX = sx - barW / 2;
        const barY = sy - def.size - 8;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = e.hp / e.maxHp > 0.5 ? '#4caf50' : (e.hp / e.maxHp > 0.25 ? '#ff9800' : '#f44336');
        ctx.fillRect(barX, barY, barW * (e.hp / e.maxHp), barH);
    }

    // Name
    ctx.save();
    ctx.font = '10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = def.color;
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 2;
    ctx.fillText(def.name, sx, sy - def.size - 12);
    ctx.restore();
}

function drawProjectiles() {
    for (const proj of state.projectiles) {
        const sx = proj.x - state.camera.x;
        const sy = proj.y - state.camera.y;

        if (sx < -20 || sx > canvas.width + 20 || sy < -20 || sy > canvas.height + 20) continue;

        ctx.save();
        ctx.shadowColor = proj.color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = proj.color;
        ctx.beginPath();
        ctx.arc(sx, sy, proj.size, 0, Math.PI * 2);
        ctx.fill();

        // Trail
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(sx - proj.vx * 2, sy - proj.vy * 2, proj.size * 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function drawParticles() {
    for (const part of state.particles) {
        const sx = part.x - state.camera.x;
        const sy = part.y - state.camera.y;
        const alpha = part.life / 30;

        ctx.save();
        ctx.globalAlpha = Math.min(1, alpha);
        ctx.fillStyle = part.color;
        ctx.beginPath();
        ctx.arc(sx, sy, part.size * alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function drawPickupNotification() {
    if (!state.pickupNotification) return;
    const n = state.pickupNotification;
    const alpha = Math.min(1, n.life / 30);
    const y = canvas.height / 2 - 60 - (120 - n.life) * 0.5;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#4fc3f7';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 6;
    ctx.fillText(n.text, canvas.width / 2, y);
    ctx.restore();
}

function drawWaveIndicator() {
    if (state.wave > 0 && state.waveTimer < 120) {
        const alpha = 1 - state.waveTimer / 120;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = 'bold 28px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#f44336';
        ctx.shadowColor = 'rgba(244,67,54,0.5)';
        ctx.shadowBlur = 15;
        ctx.fillText(`Wave ${state.wave}`, canvas.width / 2, 80);
        ctx.font = '16px system-ui, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillText(`${state.enemies.length} enemies incoming!`, canvas.width / 2, 110);
        ctx.restore();
    }
}

function drawCrosshair() {
    if (state.modalOpen || !state.player.weapon || state.player.dead) return;
    const mx = state.mouse.x;
    const my = state.mouse.y;
    const color = state.player.ammo > 0 ? WEAPON_DEFS[state.player.weapon].color : '#666';

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.8;

    ctx.beginPath();
    ctx.arc(mx, my, 12, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(mx - 18, my); ctx.lineTo(mx - 8, my);
    ctx.moveTo(mx + 8, my); ctx.lineTo(mx + 18, my);
    ctx.moveTo(mx, my - 18); ctx.lineTo(mx, my - 8);
    ctx.moveTo(mx, my + 8); ctx.lineTo(mx, my + 18);
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(mx, my, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawSignposts() {
    const signs = [
        { x: 14, y: 11, text: '\u2190 Palvelumuotoilu', color: '#ce93d8' },
        { x: 24, y: 11, text: 'Ohjelmistokehitys \u2192', color: '#ffb74d' },
        { x: 14, y: 17, text: '\u2190 Yll\u00e4pito', color: '#81c784' },
        { x: 24, y: 17, text: 'Yhteystiedot \u2192', color: '#ef9a9a' },
    ];

    for (const sign of signs) {
        const sx = sign.x * TILE - state.camera.x;
        const sy = sign.y * TILE - state.camera.y;

        if (sx < -200 || sx > canvas.width + 200 || sy < -50 || sy > canvas.height + 50) continue;

        ctx.fillStyle = '#5d4037';
        ctx.fillRect(sx + TILE / 2 - 2, sy + 8, 4, TILE - 8);

        ctx.font = '11px system-ui, sans-serif';
        const textW = ctx.measureText(sign.text).width || 100;
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(sx + TILE / 2 - textW / 2 - 8, sy, textW + 16, 22);
        ctx.fillStyle = sign.color;
        ctx.fillRect(sx + TILE / 2 - textW / 2 - 8, sy, 3, 22);

        ctx.save();
        ctx.font = '11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.fillText(sign.text, sx + TILE / 2, sy + 15);
        ctx.restore();
    }
}

function drawLampPosts() {
    const lampPositions = [
        { x: 16, y: 13 }, { x: 24, y: 13 },
        { x: 16, y: 15 }, { x: 24, y: 15 },
        { x: 8, y: 13 }, { x: 32, y: 13 },
        { x: 20, y: 8 }, { x: 20, y: 20 },
    ];

    for (const lamp of lampPositions) {
        const sx = lamp.x * TILE - state.camera.x + TILE / 2;
        const sy = lamp.y * TILE - state.camera.y;

        if (sx < -50 || sx > canvas.width + 50 || sy < -50 || sy > canvas.height + 50) continue;

        ctx.fillStyle = '#616161';
        ctx.fillRect(sx - 2, sy + 10, 4, 34);

        const glowIntensity = 0.15 + Math.sin(state.time * 0.03 + lamp.x) * 0.05;
        const gradient = ctx.createRadialGradient(sx, sy + 8, 0, sx, sy + 8, 40);
        gradient.addColorStop(0, `rgba(255, 235, 130, ${glowIntensity})`);
        gradient.addColorStop(1, 'rgba(255, 235, 130, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(sx, sy + 8, 40, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffc107';
        ctx.fillRect(sx - 5, sy + 6, 10, 6);
    }
}

function drawMinimap() {
    const mw = minimapCanvas.width;
    const mh = minimapCanvas.height;
    const scaleX = mw / MAP_W;
    const scaleY = mh / MAP_H;

    minimapCtx.fillStyle = COLORS.grass1;
    minimapCtx.fillRect(0, 0, mw, mh);

    minimapCtx.fillStyle = COLORS.path;
    PATH_SET.forEach(key => {
        const [tx, ty] = key.split(',').map(Number);
        minimapCtx.fillRect(tx * TILE * scaleX, ty * TILE * scaleY, TILE * scaleX + 1, TILE * scaleY + 1);
    });

    minimapCtx.fillStyle = COLORS.water;
    WATER_TILES.forEach(key => {
        const [tx, ty] = key.split(',').map(Number);
        minimapCtx.fillRect(tx * TILE * scaleX, ty * TILE * scaleY, TILE * scaleX + 1, TILE * scaleY + 1);
    });

    for (const b of BUILDINGS) {
        minimapCtx.fillStyle = b.color;
        minimapCtx.fillRect(b.x * TILE * scaleX, b.y * TILE * scaleY, b.w * TILE * scaleX, b.h * TILE * scaleY);
        minimapCtx.fillStyle = b.roofColor;
        minimapCtx.fillRect(b.x * TILE * scaleX, b.y * TILE * scaleY, b.w * TILE * scaleX, 2);
        // Pulsing gold border on building with active weapon
        if (getActiveWeaponForBuilding(b.id)) {
            minimapCtx.strokeStyle = `rgba(255, 193, 7, ${0.5 + Math.sin(state.time * 0.1) * 0.5})`;
            minimapCtx.lineWidth = 2;
            minimapCtx.strokeRect(b.x * TILE * scaleX - 1, b.y * TILE * scaleY - 1, b.w * TILE * scaleX + 2, b.h * TILE * scaleY + 2);
        }
    }

    // Enemy dots on minimap
    for (const e of state.enemies) {
        const def = ENEMY_TYPES[e.type];
        minimapCtx.fillStyle = def.color;
        minimapCtx.beginPath();
        minimapCtx.arc(e.x * scaleX, e.y * scaleY, 2, 0, Math.PI * 2);
        minimapCtx.fill();
    }

    // Player dot
    const px = state.player.x * scaleX;
    const py = state.player.y * scaleY;
    minimapCtx.fillStyle = '#fff';
    minimapCtx.beginPath();
    minimapCtx.arc(px + TILE * scaleX / 2, py + TILE * scaleY / 2, 3, 0, Math.PI * 2);
    minimapCtx.fill();

    minimapCtx.strokeStyle = 'rgba(255,255,255,0.4)';
    minimapCtx.lineWidth = 1;
    minimapCtx.strokeRect(
        state.camera.x * scaleX, state.camera.y * scaleY,
        canvas.width * scaleX, canvas.height * scaleY
    );
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGround();
    drawLampPosts();

    // Collect all drawable entities and sort by Y for depth
    const drawables = [];

    for (const tree of TREES) {
        drawables.push({ type: 'tree', y: tree.y * TILE + TILE, data: tree });
    }
    for (const b of BUILDINGS) {
        drawables.push({ type: 'building', y: (b.y + b.h) * TILE, data: b });
    }
    drawables.push({ type: 'player', y: state.player.y + TILE });
    for (const e of state.enemies) {
        drawables.push({ type: 'enemy', y: e.y, data: e });
    }

    drawables.sort((a, b) => a.y - b.y);

    drawSignposts();

    for (const d of drawables) {
        if (d.type === 'tree') drawTree(d.data);
        else if (d.type === 'building') drawBuilding(d.data);
        else if (d.type === 'player') drawPlayer();
        else if (d.type === 'enemy') drawEnemy(d.data);
    }

    drawProjectiles();
    drawParticles();
    drawCrosshair();
    drawPickupNotification();
    drawWaveIndicator();
    drawMinimap();
}

// ==========================================
// Game Loop
// ==========================================

function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// ==========================================
// Initialize
// ==========================================

PATH_SET = generatePaths();
generateWater();
generateTrees();

state.camera.x = state.player.x + TILE / 2 - canvas.width / 2;
state.camera.y = state.player.y + TILE / 2 - canvas.height / 2;

// Hide cursor over canvas when weapon is equipped
canvas.style.cursor = 'crosshair';

gameLoop();
