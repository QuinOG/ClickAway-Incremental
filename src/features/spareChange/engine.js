// Spare Change: pure game engine for the 15-minute prototype.
// No timers and no DOM; callers pass `now` (ms). Randomness comes from a
// mulberry32 RNG whose state lives in the game state, so saves are exact
// and tests are deterministic. See docs/spare-change/spec.md.

export const SAVE_VERSION = 1
export const GLINT_LIFE_MS = 3500
export const SPAWN_MS = 1000
export const BASE_MAX_GLINTS = 3
export const COMBO_STEP = 0.1
export const COMBO_CAP = 2
export const MAGNET_CHARGE_COMBO = 10
export const LINT_BALL_COST = 25
// The car key is a guaranteed find once the player has earned this much,
// so its "wait, whose car is this?" moment lands at a predictable point.
export const CAR_KEY_PITY_CENTS = 3000
export const MOVE_HOUSE_CENTS = 7000
export const OFFLINE_CAP_MS = 8 * 60 * 60 * 1000
export const OFFLINE_RATE = 0.5
const MAX_CATCH_UP_ROLLS = 4000

export const FINDS = {
  penny: { name: "Penny", tier: "common", cents: 1 },
  lint: { name: "Lint", tier: "common", cents: 0, lint: 1 },
  crumb: { name: "Crumb", tier: "common", cents: 0, flavor: "Was that… a Cheeto?" },
  button: { name: "Button", tier: "common", cents: 0, collectible: true },
  nickel: { name: "Nickel", tier: "mid", cents: 5 },
  dime: { name: "Dime", tier: "mid", cents: 10 },
  quarter: { name: "Quarter", tier: "mid", cents: 25 },
  arcadeToken: { name: "Arcade token", tier: "mid", cents: 0, collectible: true },
  earringLeft: { name: "Lost earring (left)", tier: "rare", cents: 0, collectible: true },
  steelPenny: { name: "1943 steel penny", tier: "rare", cents: 100, collectible: true },
  giftCard: { name: "Gift card", tier: "rare", cents: 200, flavor: "$2 left on it. Score." },
  carKey: { name: "Car key", tier: "rare", cents: 0, flavor: "Wait, whose car is this?" },
  frenchFry: { name: "French fry", tier: "common", cents: 0, flavor: "Still crispy. Somehow." },
  parkingReceipt: { name: "Parking receipt", tier: "common", cents: 0, collectible: true },
  tollToken: { name: "Toll token", tier: "mid", cents: 0, collectible: true },
  crumpledDollar: { name: "Crumpled dollar", tier: "mid", cents: 100 },
  sunglasses: { name: "Sunglasses", tier: "rare", cents: 200 },
  earringRight: { name: "Lost earring (right)", tier: "rare", cents: 0, collectible: true },
  silverDollar: { name: "Silver dollar", tier: "rare", cents: 200, collectible: true },
  phoneCharger: { name: "Phone charger", tier: "common", cents: 0, collectible: true },
  shinyFoil: { name: "Shiny foil", tier: "common", cents: 0, flavor: "He's very proud of it." },
}

export const LOCATIONS = {
  couch: {
    name: "Couch",
    table: [
      ["penny", 50], ["lint", 18], ["crumb", 12], ["button", 5],
      ["nickel", 6], ["dime", 3], ["quarter", 1.5], ["arcadeToken", 2.5],
      ["earringLeft", 1], ["steelPenny", 0.6], ["giftCard", 0.4],
    ],
  },
  car: {
    name: "Car",
    table: [
      ["penny", 34], ["frenchFry", 18], ["parkingReceipt", 10],
      ["quarter", 8], ["tollToken", 5], ["crumpledDollar", 2],
      ["sunglasses", 1], ["earringRight", 1],
    ],
  },
}

export const DISTRICTS = {
  retirement: {
    name: "Retirement Village",
    blurb: "Antique coins. Rare finds ×1.5, and silver dollars turn up.",
    extraFind: ["silverDollar", 1],
  },
  student: {
    name: "Student Housing",
    blurb: "Fast turnover. Glints appear faster, and phone chargers are everywhere.",
    extraFind: ["phoneCharger", 6],
  },
}

export const UPGRADES = {
  longFingers: { name: "Long Fingers", cost: 40, maxLevel: 1, description: "Reach one more glint at a time." },
  pocketTorch: { name: "Pocket Torch", cost: 300, maxLevel: 1, description: "Rare finds twice as likely; glints last 30% longer." },
  cushionFlip: { name: "Cushion Flip", cost: 300, maxLevel: 1, description: "25% chance a find reveals another glint underneath." },
  sockVacuum: { name: "Sock on the Vacuum", cost: 600, maxLevel: 1, description: "Sucks up a common find every 3 seconds." },
  raccoon: { name: "Raccoon", cost: 1200, costGrowth: 1.6, maxLevel: 3, description: "Digs up something every 5 seconds. Loves shiny things." },
  magnet: { name: "Pocket Magnet", cost: 2500, maxLevel: 1, description: "Key 1: at a 10-find combo, pulls in every glint at once." },
}

export const SETS = {
  earringPair: { name: "Earring Pair", items: ["earringLeft", "earringRight"], bonus: "+10% coin value" },
  couchArchaeologist: { name: "Couch Archaeologist", items: ["button", "arcadeToken", "steelPenny"], bonus: "+1 max glint" },
}

const SOCK_MS = 3000
const RACCOON_MS = 5000
const FLIP_CHANCE = 0.25
const FOIL_CHANCE = 0.1

// ---- RNG -----------------------------------------------------------------
function nextRandom(state) {
  let seed = (state.rng + 0x6d2b79f5) >>> 0
  state.rng = seed
  let t = seed
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

function clone(state) {
  return JSON.parse(JSON.stringify(state))
}

// ---- Derived values ---------------------------------------------------------
function isSetComplete(state, setId) {
  return SETS[setId].items.every((id) => (state.collection[id] ?? 0) > 0)
}

function maxGlints(state) {
  let max = BASE_MAX_GLINTS
  if (state.upgrades.longFingers) max += 1
  if (isSetComplete(state, "couchArchaeologist")) max += 1
  return max
}

function glintLife(state) {
  return Math.round(GLINT_LIFE_MS * (state.upgrades.pocketTorch ? 1.3 : 1))
}

function spawnInterval(state) {
  return state.district === "student" ? 800 : SPAWN_MS
}

function rareMultiplier(state) {
  let mult = state.upgrades.pocketTorch ? 2 : 1
  if (state.district === "retirement") mult *= 1.5
  return mult
}

function valueMultiplier(state) {
  return isSetComplete(state, "earringPair") ? 1.1 : 1
}

function locationTable(state, locationId) {
  let table = LOCATIONS[locationId].table
  if (state.unlocked.car) table = table.filter(([id]) => id !== "carKey")
  if (state.district) table = [...table, DISTRICTS[state.district].extraFind]
  return table
}

function weightedPick(state, entries) {
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0)
  let roll = nextRandom(state) * total
  for (const [id, weight] of entries) {
    roll -= weight
    if (roll < 0) return id
  }
  return entries[entries.length - 1][0]
}

function tieredTable(state, locationId, { rareScale = 1, tier = null } = {}) {
  const rare = rareMultiplier(state) * rareScale
  return locationTable(state, locationId)
    .filter(([id]) => !tier || FINDS[id].tier === tier)
    .map(([id, weight]) => [id, FINDS[id].tier === "rare" ? weight * rare : weight])
}

// ---- State --------------------------------------------------------------------
export function createGame({ seed = 1, now = 0 } = {}) {
  return {
    version: SAVE_VERSION,
    rng: (Number(seed) >>> 0) || 1,
    cents: 0,
    earnedCents: 0,
    lint: 0,
    combo: 0,
    comboMult: 1,
    magnetCharged: false,
    location: "couch",
    unlocked: { car: false, lintBall: false, moveHouse: false },
    glints: [],
    nextGlintId: 1,
    lastSpawnAt: now,
    helperNext: { sock: now + SOCK_MS, raccoon: now + RACCOON_MS },
    upgrades: {},
    collection: {},
    setsDone: {},
    district: null,
    moves: 0,
    stats: { finds: 0, rares: 0 },
    savedAt: now,
  }
}

function spawnGlint(state, now, { tier = null } = {}) {
  const table = tieredTable(state, state.location)
  const tierWeights = {}
  for (const [id, weight] of table) tierWeights[FINDS[id].tier] = (tierWeights[FINDS[id].tier] ?? 0) + weight
  const chosenTier = tier ?? weightedPick(state, Object.entries(tierWeights))
  const x = 0.06 + nextRandom(state) * 0.88
  const y = 0.18 + nextRandom(state) * 0.64
  const glint = {
    id: state.nextGlintId++,
    location: state.location,
    x,
    y,
    cushion: Math.min(2, Math.floor(x * 3)),
    tier: chosenTier,
    bornAt: now,
    expiresAt: now + glintLife(state),
  }
  state.glints.push(glint)
  return glint
}

// Records a find and returns its event. `glintTier` restricts the roll to
// the tier the glint advertised.
function collect(state, { locationId, source, glintTier = null, glintId, events }) {
  let findId
  const pityDue = locationId === "couch" && !state.unlocked.car && state.earnedCents >= CAR_KEY_PITY_CENTS
  if (pityDue && (source === "click" || source === "magnet")) {
    findId = "carKey"
  } else if (source === "raccoon" && nextRandom(state) < FOIL_CHANCE) {
    findId = "shinyFoil"
  } else {
    const table = tieredTable(state, locationId, {
      rareScale: source === "raccoon" ? 0.5 : 1,
      tier: source === "sock" ? "common" : glintTier,
    })
    findId = weightedPick(state, table.length ? table : tieredTable(state, locationId))
  }

  const find = FINDS[findId]
  const comboMult = source === "click" || source === "magnet" ? state.comboMult : 1
  const cents = find.cents ? Math.max(1, Math.round(find.cents * comboMult * valueMultiplier(state))) : 0
  const isNew = !state.collection[findId]
  state.collection[findId] = (state.collection[findId] ?? 0) + 1
  state.cents += cents
  state.earnedCents += cents
  state.stats.finds += 1
  if (find.tier === "rare") state.stats.rares += 1
  if (find.lint) state.lint += find.lint
  events.push({ type: "find", findId, name: find.name, tier: find.tier, cents, isNew, source, glintId, flavor: find.flavor ?? null })

  if (findId === "carKey" && !state.unlocked.car) {
    state.unlocked.car = true
    events.push({ type: "unlock", what: "car" })
  }
  if (!state.unlocked.lintBall && state.lint >= LINT_BALL_COST) {
    state.unlocked.lintBall = true
    events.push({ type: "unlock", what: "lintBall" })
  }
  for (const setId of Object.keys(SETS)) {
    if (!state.setsDone[setId] && isSetComplete(state, setId)) {
      state.setsDone[setId] = true
      events.push({ type: "unlock", what: `set:${setId}` })
    }
  }
  if (!state.unlocked.moveHouse && canMoveHouse(state)) {
    state.unlocked.moveHouse = true
    events.push({ type: "unlock", what: "moveHouse" })
  }
  return findId
}

function bumpCombo(state) {
  state.combo += 1
  state.comboMult = Math.min(COMBO_CAP, 1 + state.combo * COMBO_STEP)
  if (state.upgrades.magnet && state.combo >= MAGNET_CHARGE_COMBO) state.magnetCharged = true
}

function resetCombo(state) {
  state.combo = 0
  state.comboMult = 1
}

// ---- Actions ---------------------------------------------------------------------
export function tick(prev, now) {
  const state = clone(prev)
  const events = []

  const before = state.glints.length
  state.glints = state.glints.filter((glint) => {
    if (glint.expiresAt > now) return true
    events.push({ type: "expire", glintId: glint.id })
    return false
  })
  if (state.glints.length < before) resetCombo(state)

  const interval = spawnInterval(state)
  while (now - state.lastSpawnAt >= interval) {
    if (state.glints.length >= maxGlints(state)) {
      state.lastSpawnAt = now
      break
    }
    state.lastSpawnAt += interval
    spawnGlint(state, now)
  }

  runHelpers(state, now, events, 1)
  return { state, events }
}

function runHelpers(state, now, events, rate) {
  let rolls = 0
  if (state.upgrades.sockVacuum) {
    const step = SOCK_MS / rate
    while (state.helperNext.sock <= now && rolls < MAX_CATCH_UP_ROLLS) {
      state.helperNext.sock += step
      collect(state, { locationId: state.location, source: "sock", events })
      rolls += 1
    }
  } else {
    state.helperNext.sock = now + SOCK_MS
  }
  const raccoons = state.upgrades.raccoon ?? 0
  if (raccoons > 0) {
    const step = RACCOON_MS / raccoons / rate
    while (state.helperNext.raccoon <= now && rolls < MAX_CATCH_UP_ROLLS) {
      state.helperNext.raccoon += step
      collect(state, { locationId: state.location, source: "raccoon", events })
      rolls += 1
    }
  } else {
    state.helperNext.raccoon = now + RACCOON_MS
  }
}

export function clickGlint(prev, glintId, now) {
  const glint = prev.glints.find((candidate) => candidate.id === glintId)
  if (!glint || glint.expiresAt <= now) return { state: prev, events: [] }
  const state = clone(prev)
  const events = []
  state.glints = state.glints.filter((candidate) => candidate.id !== glintId)
  collect(state, { locationId: glint.location, source: "click", glintTier: glint.tier, glintId, events })
  bumpCombo(state)
  if (state.upgrades.cushionFlip && nextRandom(state) < FLIP_CHANCE) spawnGlint(state, now)
  return { state, events }
}

export function buyUpgrade(prev, upgradeId) {
  const offer = getUpgrades(prev).find((candidate) => candidate.id === upgradeId)
  if (!offer || !offer.affordable) return { state: prev, events: [] }
  const state = clone(prev)
  state.cents -= offer.cost
  state.upgrades[upgradeId] = (state.upgrades[upgradeId] ?? 0) + 1
  return { state, events: [{ type: "purchase", upgradeId }] }
}

// Takes `now` for API symmetry with the other actions; collection is instant.
export function useMagnet(prev) {
  if (!prev.magnetCharged || !prev.glints.length) return { state: prev, events: [] }
  const state = clone(prev)
  const events = []
  const glints = state.glints
  state.glints = []
  for (const glint of glints) {
    collect(state, { locationId: glint.location, source: "magnet", glintTier: glint.tier, glintId: glint.id, events })
    bumpCombo(state)
  }
  state.magnetCharged = false
  return { state, events }
}

export function useLintBall(prev, now) {
  if (!prev.unlocked.lintBall || prev.lint < LINT_BALL_COST) return { state: prev, events: [] }
  const state = clone(prev)
  state.lint -= LINT_BALL_COST
  for (let i = 0; i < 3; i += 1) spawnGlint(state, now)
  return { state, events: [{ type: "lintBall" }] }
}

export function switchLocation(prev, locationId) {
  if (prev.location === locationId || !LOCATIONS[locationId]) return prev
  if (locationId === "car" && !prev.unlocked.car) return prev
  const state = clone(prev)
  state.location = locationId
  state.glints = []
  return state
}

export function canMoveHouse(state) {
  return state.unlocked.car && state.earnedCents >= MOVE_HOUSE_CENTS
}

export function moveHouse(prev, districtId, now) {
  if (!DISTRICTS[districtId] || !canMoveHouse(prev)) return { state: prev, events: [] }
  const fresh = createGame({ seed: prev.rng, now })
  const state = {
    ...fresh,
    collection: { ...prev.collection },
    setsDone: { ...prev.setsDone },
    stats: { ...prev.stats },
    district: districtId,
    moves: prev.moves + 1,
  }
  return { state, events: [{ type: "moved", districtId }] }
}

export function applyOffline(prev, now) {
  const away = Math.min(OFFLINE_CAP_MS, Math.max(0, now - (prev.savedAt ?? now)))
  const state = clone(prev)
  const summary = { ms: away, cents: 0, finds: [] }
  if (!away || (!state.upgrades.sockVacuum && !state.upgrades.raccoon)) {
    state.savedAt = now
    state.helperNext = { sock: now + SOCK_MS, raccoon: now + RACCOON_MS }
    return { state, summary }
  }
  const events = []
  const start = now - away
  state.helperNext = { sock: start + SOCK_MS / OFFLINE_RATE, raccoon: start + RACCOON_MS / OFFLINE_RATE }
  const centsBefore = state.cents
  runHelpers(state, now, events, OFFLINE_RATE)
  const counts = {}
  for (const event of events) {
    if (event.type === "find") counts[event.findId] = (counts[event.findId] ?? 0) + 1
  }
  summary.cents = state.cents - centsBefore
  summary.finds = Object.entries(counts).map(([id, count]) => ({ id, name: FINDS[id].name, count }))
  state.savedAt = now
  state.helperNext = { sock: now + SOCK_MS, raccoon: now + RACCOON_MS }
  return { state, summary }
}

export function serialize(state, now = state.savedAt) {
  return JSON.stringify({ ...state, glints: [], savedAt: now })
}

export function deserialize(text, now) {
  try {
    const data = JSON.parse(text)
    if (!data || data.version !== SAVE_VERSION) return null
    const base = createGame({ seed: data.rng, now })
    return {
      ...base,
      ...data,
      glints: [],
      combo: 0,
      comboMult: 1,
      lastSpawnAt: now,
      unlocked: { ...base.unlocked, ...data.unlocked },
      stats: { ...base.stats, ...data.stats },
    }
  } catch {
    return null
  }
}

// ---- Selectors ---------------------------------------------------------------------
export function upgradeCost(state, upgradeId) {
  const upgrade = UPGRADES[upgradeId]
  const level = state.upgrades[upgradeId] ?? 0
  return Math.round(upgrade.cost * (upgrade.costGrowth ?? 1) ** level)
}

export function getUpgrades(state) {
  return Object.entries(UPGRADES).map(([id, upgrade]) => {
    const level = state.upgrades[id] ?? 0
    const cost = upgradeCost(state, id)
    const owned = level >= upgrade.maxLevel
    return {
      id,
      name: upgrade.name,
      description: upgrade.description,
      cost,
      level,
      maxLevel: upgrade.maxLevel,
      owned,
      affordable: !owned && state.cents >= cost,
    }
  })
}

export function getCollection(state) {
  const items = Object.entries(FINDS)
    .filter(([, find]) => find.collectible)
    .map(([id, find]) => ({ id, name: find.name, tier: find.tier, count: state.collection[id] ?? 0 }))
  const sets = Object.entries(SETS).map(([id, set]) => ({
    id,
    name: set.name,
    bonus: set.bonus,
    items: set.items,
    complete: isSetComplete(state, id),
  }))
  return { items, sets }
}

export function getLocations(state) {
  return Object.entries(LOCATIONS).map(([id, location]) => ({
    id,
    name: location.name,
    unlocked: id === "couch" || Boolean(state.unlocked[id]),
    active: state.location === id,
  }))
}

export function getGlintSize(glint, now) {
  const span = glint.expiresAt - glint.bornAt
  return Math.max(0, Math.min(1, 1 - (now - glint.bornAt) / span))
}

export function formatCents(cents) {
  return cents < 100 ? `${cents}¢` : `$${(cents / 100).toFixed(2)}`
}
