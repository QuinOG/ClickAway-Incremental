# Spare Change: 15-minute prototype spec

**Goal:** prove the hook in under 15 minutes of play. Players should keep searching after automation arrives and want "one more find." This is a prototype, not the full game.

**Where it lives:** a standalone page at `/couch`. It needs no login and no server; state is saved in `localStorage`. All code lives in `src/features/spareChange/`. The rest of the app is untouched.

## The ritual
A couch fills the screen, with three cushions (left, middle and right). **Glints** appear in the fabric. Like ClickAway targets, each glint **shrinks and fades over about 3.5 seconds**. Click one before it vanishes to dig out a **find**: a named object with a small pop-up ("Penny · 1¢", "Lint · +1 lint", "Lost earring (left) ★ NEW").

- **Glint colour hints at the tier:** common is silver, mid is bronze, rare shimmers gold. You see *that* something good is there before you know *what*.
- **Combo:** each find before any glint expires raises the combo (×1.0, +0.1 per find, capped at ×2.0), which multiplies coin values. A glint that expires unclicked resets the combo. Clicking empty fabric costs nothing (no miss penalty).
- **Spawning:** a new glint every 1.0s while fewer than *max glints* are visible (3 at start). A glint lasts longer than the spawn gap, so the max actually binds and Long Fingers matters.

## Money
All money is integer **cents**, shown as `47¢` or `$3.20`. The **lifetime total** (`earnedCents`) drives unlocks and does not go down when you spend.

## Finds
Weights are relative within a location. The Pocket Torch doubles rare weights.

**Couch**
| Find | Tier | Weight | Value | Notes |
|---|---|---|---|---|
| Penny | common | 50 | 1¢ | |
| Lint | common | 18 | 0¢ | +1 lint (lint has a use later, see Lint) |
| Crumb | common | 12 | 0¢ | flavour only ("Was that… a Cheeto?") |
| Button | common | 5 | 0¢ | collectible |
| Nickel | mid | 6 | 5¢ | |
| Dime | mid | 3 | 10¢ | |
| Quarter | mid | 1.5 | 25¢ | |
| Arcade token | mid | 2.5 | 0¢ | collectible (it will open the arcade in a later version) |
| Lost earring (left) | rare | 1 | 0¢ | collectible; its pair is in the car |
| 1943 steel penny | rare | 0.6 | 100¢ | collectible |
| Gift card | rare | 0.4 | 200¢ | "$2 left on it. Score." |
| **Car key** | rare | — | 0¢ | **unlocks the Car**; guaranteed, never random (see below) |

**Car** (unlocked by the car key)
| Find | Tier | Weight | Value | Notes |
|---|---|---|---|---|
| Penny | common | 34 | 1¢ | |
| French fry | common | 18 | 0¢ | flavour ("Still crispy. Somehow.") |
| Parking receipt | common | 10 | 0¢ | collectible |
| Quarter | mid | 8 | 25¢ | |
| Toll token | mid | 5 | 0¢ | collectible |
| Crumpled dollar | mid | 2 | 100¢ | |
| Sunglasses | rare | 1 | 200¢ | |
| Lost earring (right) | rare | 1 | 0¢ | collectible; completes the **Earring Pair** set |

**Car key:** the key is not in the random table. The first couch find after `earnedCents ≥ 3000` ($30) is always the key, so its "wait, whose car is this?" moment lands at a predictable point (about minute 6).

## Upgrades
These are one-time purchases unless noted.
| Id | Name | Cost | Effect |
|---|---|---|---|
| `longFingers` | Long Fingers | 40¢ | max glints 3 → 4 |
| `pocketTorch` | Pocket Torch | $3.00 | rare weights ×2; glints last +30% |
| `cushionFlip` | Cushion Flip | $3.00 | 25% chance a find reveals a bonus glint underneath |
| `sockVacuum` | Sock on the Vacuum | $6.00 | auto-collects one **common** find every 3s at the current location |
| `raccoon` | Raccoon | $12.00, then ×1.6 per level (max 3) | finds one item every 5s per level (rare weight ×0.5). 10% of its finds are "Shiny foil" (0¢, flavour: "He's very proud of it.") |
| `magnet` | Pocket Magnet | $25.00 | powerup on key **1**: charges at a 10-find combo and instantly collects every visible glint |

## Collection
Every collectible is listed with a count. Sets:
- **Earring Pair** (both earrings): +10% coin value.
- **Couch Archaeologist** (button, arcade token, 1943 steel penny): +1 max glint.

## Lint
At 25 lint, **Lint Ball** unlocks: a one-shot button that spawns 3 bonus glints. It costs 25 lint and can be reused. Junk still advances something.

## Moving Day (prestige, mocked)
Available once the Car is unlocked **and** `earnedCents ≥ 7000`. A modal ("You've saved $70. Time to move.") offers two neighbourhoods:
- **Retirement Village:** antique coins. Rare weights ×1.5 permanently, plus a new find, *Silver dollar* (rare, 200¢).
- **Student Housing:** fast turnover. The glint spawn interval drops 1.0s → 0.8s permanently, plus a new find, *Phone charger* (common, 0¢, collectible).

Choosing one resets cents, upgrades, lint, combo and the Car unlock. It keeps the collection, set bonuses and lifetime stats, increments `moves`, and records the neighbourhood. In the prototype, the new neighbourhood re-skins the couch label and applies its modifier; that's enough to test whether players want it.

## Offline
On load, helpers (sock and raccoon) earn for the time away at **50% rate**, capped at 8 hours. A "While you were away…" toast lists the finds.

## Pacing (tested)
`tests/spareChangeEngine.test.js` simulates a good player (clicks each glint after 0.9s, misses one in seven, buys upgrades as soon as affordable) over five seeds. Median minute reached: Long Fingers 0.2, Pocket Torch 1.4, Sock 2.2, Raccoon 4.5, **car key 6.0**, **Moving Day 11.7**. Real players are slower than the bot, so these are lower bounds.

## Engine API (`src/features/spareChange/engine.js`)
Pure, deterministic functions with no timers and no DOM. Time is passed in as `now` (ms). Randomness comes from a seeded RNG stored in state.

```js
createGame({ seed, now }) -> state
tick(state, now) -> { state, events }        // spawn/expire glints, run helpers
clickGlint(state, glintId, now) -> { state, events }
buyUpgrade(state, upgradeId, now) -> { state, events }   // no-op if unaffordable or maxed
useMagnet(state, now) -> { state, events }
useLintBall(state, now) -> { state, events }
switchLocation(state, locationId) -> state  // "couch" | "car"
moveHouse(state, districtId, now) -> { state, events }   // "retirement" | "student"
applyOffline(state, now) -> { state, summary }           // summary: { ms, finds: [{id,count}], cents }
serialize(state) -> string ; deserialize(string, now) -> state | null

// Selectors
getUpgrades(state) -> [{ id, name, cost, level, maxLevel, affordable, owned, description }]
getCollection(state) -> { items: [{ id, name, count, tier }], sets: [{ id, name, complete, bonus }] }
getLocations(state) -> [{ id, name, unlocked, active }]
canMoveHouse(state) -> boolean
FINDS, UPGRADES, LOCATIONS, DISTRICTS                  // static data
```

**State, as seen by the UI:**
```js
{
  cents, earnedCents, lint, combo, comboMult, magnetCharged,
  location: "couch" | "car", unlocked: { car: bool },
  glints: [{ id, location, x, y, cushion /*0-2*/, tier, bornAt, expiresAt }],
  //   x, y are 0..1 within the location's search area
  //   size = 1 - (now - bornAt) / (expiresAt - bornAt), shrinking to 0
  upgrades: { [id]: level }, collection: { [findId]: count },
  district: null | "retirement" | "student", moves, stats: { finds, rares }
}
```

**Events** (for pop-ups and sound):
- `{ type: "find", findId, name, tier, cents, isNew, source: "click"|"sock"|"raccoon"|"magnet", glintId? }`
- `{ type: "expire", glintId }`
- `{ type: "unlock", what: "car"|"lintBall"|"moveHouse"|"set:<id>" }`
- `{ type: "purchase", upgradeId }`
- `{ type: "moved", districtId }`

## UI, in brief
- **Couch scene:** 1440×900 first, but usable on a phone.
- **HUD:** cents (big), lifetime total, combo meter, lint, and the magnet key when owned.
- **Right drawer:** the shop, then the collection.
- **Location tabs:** Couch and Car, with the car locked behind a key silhouette until found.
- **Find pop-ups:** float from the click point with the name and value. NEW finds get a gold flash.
- **Finds by helpers:** raccoon and sock finds appear as small toasts.
- **Moving Day** is a modal. Respect `prefers-reduced-motion`.
- **Art:** CSS and inline SVG only. The look is warm and domestic (fabric, lamplight), not ClickAway's neon arena.
