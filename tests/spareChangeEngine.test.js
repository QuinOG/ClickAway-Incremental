import test from "node:test"
import assert from "node:assert/strict"

import {
  applyOffline,
  buyUpgrade,
  canMoveHouse,
  clickGlint,
  createGame,
  deserialize,
  getCollection,
  getUpgrades,
  moveHouse,
  serialize,
  switchLocation,
  tick,
  useLintBall,
  useMagnet,
} from "../src/features/spareChange/engine.js"

// Runs the game forward, clicking each glint `reactionMs` after it appears.
// `missEvery` lets every Nth glint expire to model a human missing some.
function play(state, { fromMs, toMs, stepMs = 100, reactionMs = 900, missEvery = 7, buy = [], onEvents } = {}) {
  let seen = 0
  for (let now = fromMs; now <= toMs; now += stepMs) {
    let result = tick(state, now)
    state = result.state
    onEvents?.(result.events, now)
    for (const glint of state.glints) {
      if (now - glint.bornAt < reactionMs) continue
      seen += 1
      if (missEvery && seen % missEvery === 0) continue
      result = clickGlint(state, glint.id, now)
      state = result.state
      onEvents?.(result.events, now)
    }
    if (state.magnetCharged) {
      result = useMagnet(state, now)
      state = result.state
      onEvents?.(result.events, now)
    }
    for (const id of buy) {
      const offer = getUpgrades(state).find((candidate) => candidate.id === id)
      if (offer?.affordable) {
        result = buyUpgrade(state, id)
        state = result.state
        onEvents?.(result.events, now)
      }
    }
  }
  return state
}

const BUY_ORDER = ["longFingers", "pocketTorch", "cushionFlip", "sockVacuum", "raccoon", "magnet"]

test("glints spawn on a timer, shrink to expiry and reset the combo", () => {
  let state = createGame({ seed: 7, now: 0 })
  state = tick(state, 1600).state
  assert.equal(state.glints.length, 1)
  const [glint] = state.glints
  assert.equal(glint.expiresAt - glint.bornAt, 3500)
  state = { ...state, combo: 4, comboMult: 1.4 }
  const { state: after, events } = tick(state, glint.expiresAt)
  assert.ok(events.some((event) => event.type === "expire" && event.glintId === glint.id))
  assert.equal(after.combo, 0)
  assert.equal(after.comboMult, 1)
})

test("spawning stops at the max glint count", () => {
  let state = createGame({ seed: 3, now: 0 })
  for (let now = 0; now <= 3400; now += 100) state = tick(state, now).state
  assert.equal(state.glints.length, 3)
})

test("clicking a glint records a find and builds the combo", () => {
  let state = createGame({ seed: 11, now: 0 })
  state = tick(state, 1600).state
  const { state: after, events } = clickGlint(state, state.glints[0].id, 1700)
  const find = events.find((event) => event.type === "find")
  assert.ok(find, "a find event is emitted")
  assert.equal(after.glints.length, 0)
  assert.equal(after.combo, 1)
  assert.equal(after.stats.finds, 1)
  assert.equal(after.collection[find.findId], 1)
  // Clicking the same (now gone) glint again does nothing.
  assert.equal(clickGlint(after, state.glints[0].id, 1800).state, after)
})

test("the run is deterministic for a seed", () => {
  const a = play(createGame({ seed: 42, now: 0 }), { fromMs: 0, toMs: 60_000 })
  const b = play(createGame({ seed: 42, now: 0 }), { fromMs: 0, toMs: 60_000 })
  assert.deepEqual(a, b)
})

test("upgrades cost cents and cannot be bought twice", () => {
  let state = { ...createGame({ seed: 1, now: 0 }), cents: 100 }
  state = buyUpgrade(state, "longFingers").state
  assert.equal(state.cents, 60)
  assert.equal(state.upgrades.longFingers, 1)
  assert.equal(buyUpgrade(state, "longFingers").state, state)
  assert.equal(buyUpgrade({ ...state, cents: 10 }, "pocketTorch").state.upgrades.pocketTorch, undefined)
  const raccoon = getUpgrades({ ...state, upgrades: { raccoon: 1 } }).find((offer) => offer.id === "raccoon")
  assert.equal(raccoon.cost, 1920)
})

test("the car key is guaranteed once the player has earned $30", () => {
  let state = { ...createGame({ seed: 5, now: 0 }), earnedCents: 3000 }
  state = tick(state, 1600).state
  const { state: after, events } = clickGlint(state, state.glints[0].id, 1700)
  assert.ok(events.some((event) => event.type === "find" && event.findId === "carKey"))
  assert.ok(events.some((event) => event.type === "unlock" && event.what === "car"))
  assert.equal(after.unlocked.car, true)
  assert.equal(switchLocation(after, "car").location, "car")
  assert.equal(switchLocation(state, "car").location, "couch", "the car stays locked without the key")
})

test("lint ball spends 25 lint for three bonus glints", () => {
  let state = { ...createGame({ seed: 9, now: 0 }), lint: 30, unlocked: { car: false, lintBall: true, moveHouse: false } }
  const { state: after } = useLintBall(state, 500)
  assert.equal(after.lint, 5)
  assert.equal(after.glints.length, 3)
})

test("sets complete and apply their bonuses", () => {
  const state = {
    ...createGame({ seed: 2, now: 0 }),
    collection: { button: 1, arcadeToken: 2, steelPenny: 1, earringLeft: 1, earringRight: 1 },
  }
  const { sets } = getCollection(state)
  assert.ok(sets.every((set) => set.complete))
  let ticked = state
  for (let now = 0; now <= 6000; now += 100) ticked = tick(ticked, now).state
  assert.equal(ticked.glints.length, 4, "Couch Archaeologist adds a max glint")
})

test("moving house resets the run but keeps the collection", () => {
  const state = {
    ...createGame({ seed: 4, now: 0 }),
    cents: 900,
    earnedCents: 7100,
    unlocked: { car: true, lintBall: true, moveHouse: true },
    upgrades: { pocketTorch: 1 },
    collection: { button: 3 },
  }
  assert.equal(canMoveHouse(state), true)
  const { state: moved } = moveHouse(state, "student", 10_000)
  assert.equal(moved.cents, 0)
  assert.equal(moved.unlocked.car, false)
  assert.deepEqual(moved.upgrades, {})
  assert.equal(moved.collection.button, 3)
  assert.equal(moved.district, "student")
  assert.equal(moved.moves, 1)
  assert.equal(moveHouse(createGame(), "student", 0).state.moves, 0, "cannot move before it is earned")
})

test("save, reload and offline helpers", () => {
  let state = { ...createGame({ seed: 8, now: 0 }), upgrades: { sockVacuum: 1, raccoon: 1 }, cents: 50 }
  const text = serialize(state, 0)
  const loaded = deserialize(text, 3_600_000)
  assert.equal(loaded.cents, 50)
  assert.equal(deserialize("not json", 0), null)
  const { state: after, summary } = applyOffline(loaded, 3_600_000)
  // One hour at half rate: sock every 6s (600) + raccoon every 10s (360).
  const found = summary.finds.reduce((sum, find) => sum + find.count, 0)
  assert.equal(found, 960)
  assert.ok(summary.cents > 0)
  assert.equal(after.cents, 50 + summary.cents)
  const capped = applyOffline(deserialize(text, 48 * 3_600_000), 48 * 3_600_000)
  assert.equal(capped.summary.ms, 8 * 3_600_000)
})

test("pacing: a typical player hits the spec milestones within 15 minutes", () => {
  const milestones = {}
  const stamp = (key, now) => { if (milestones[key] === undefined) milestones[key] = Math.round(now / 6000) / 10 }
  const seeds = [1, 2, 3, 4, 5]
  const results = seeds.map((seed) => {
    Object.keys(milestones).forEach((key) => delete milestones[key])
    play(createGame({ seed, now: 0 }), {
      fromMs: 0,
      toMs: 15 * 60_000,
      buy: BUY_ORDER,
      onEvents: (events, now) => {
        for (const event of events) {
          if (event.type === "purchase") stamp(event.upgradeId, now)
          if (event.type === "unlock") stamp(event.what, now)
        }
      },
    })
    return { ...milestones }
  })
  const median = (key) => {
    const values = results.map((result) => result[key] ?? Infinity).sort((a, b) => a - b)
    return values[Math.floor(values.length / 2)]
  }
  const report = Object.fromEntries(["longFingers", "pocketTorch", "sockVacuum", "raccoon", "car", "moveHouse"].map((key) => [key, median(key)]))
  console.log("median minute reached:", report)
  assert.ok(report.pocketTorch >= 1 && report.pocketTorch <= 4, `torch at ${report.pocketTorch}m`)
  assert.ok(report.raccoon >= 3 && report.raccoon <= 8, `raccoon at ${report.raccoon}m`)
  assert.ok(report.car >= 4 && report.car <= 9, `car at ${report.car}m`)
  assert.ok(report.moveHouse >= 9 && report.moveHouse <= 15, `moving day at ${report.moveHouse}m`)
})
