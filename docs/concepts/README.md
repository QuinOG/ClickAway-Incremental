# ClickAway Incremental: concept direction

This repo is a fork of [ClickAway](https://github.com/QuinOG/ClickAway), made to pivot the game from a niche reflex trainer into an incremental game with a wider audience.

## How we got here
1. **Concept round** (`concept-brief.md`): three AI design judges (GPT 6.1 Sol, GPT 6.1 Terra and Sonnet 5.5) studied the app (`app-tour/`) and the owner's favourite incrementals (`reference-favorites.png`), then proposed genre concepts: a factory, an arcade of minigames, excavation, a garden and others.
2. **Debate round** (`debate-brief.md`): the judges ranked every concept with market, fit, build and design evidence. The owner then asked for something **novel and relatable** rather than a remake, using Scritchy Scratchy as the model.
3. **Hook stress test** (`hooks-brief.md`): four everyday-ritual hooks were scored on how relatable, addictive, novel, scalable and ClickAway-compatible they are, with a competitor search for each.

| Hook | Sol | Terra | Sonnet | Main finding |
|---|---|---|---|---|
| **Spare Change** (dig coins out of couch cushions, then the world) | 1 | 1 | 1 | No polished couch-dig incremental found. Possible older Flash-era precedent to verify. |
| Fortune Cookie (fortunes rewrite the rules) | 2 | 2 | 2 | Steam "Fortune Cookie" (54 reviews) does click-to-reveal; rule-changing fortunes would be new. |
| Geode Cracker | 3 | 4 | 3 | Crowded: Geode Wrecker, GEODE SMASH, GEODE (itch.io). |
| Bubble Wrap Shipping | 4 | 3 | 4 | Taken: Unboxathon (Steam, 281 reviews) already does pop wrap, then unbox. |

## Direction: Spare Change
*Working titles from the judges: Cushion Fortune, Finders Keepers, Loose Change.*

- **The ritual:** everyone has found money in a couch. Glints in the cushions are the targets (ClickAway's shrinking targets), and each click uncovers a **named object**, not just a coin: a penny, a button, lint, an arcade token, half of a matched earring, a 1943 steel penny.
- **Lost objects unlock places:** a car key opens the car, an arcade token opens a forgotten arcade, a luggage tag opens an airport lost-property auction. The world grows through finds rather than a level menu.
- **Collections:** completing sets unlocks new search tools. Junk such as lint still advances something.
- **Upgrades change how you search:** Cushion Flip, Pocket Torch, Long Fingers, Pocket Magnet, Sock on the Vacuum. The helper is a raccoon that loves shiny things and sometimes brings back foil.
- **Prestige, "Moving Day":** spend everything on a bizarre new home, keep a few keepsakes, and choose a neighbourhood with its own finds (a retirement district has antique coins; a student district has electronics and fast turnover).
- **Reuse from ClickAway:** target and combo engine, powerup keys (magnet, flashlight, shake), the Armory slot model for search gear, coins, XP and cosmetics.

## The 15-minute playable test
- One couch with three cushions, and the car.
- About 12 kinds of finds: 70% common, 25% mid, 5% rare, each with a named pop-up.
- Pocket Torch at about minute 2, a third upgrade and the raccoon at about minute 5.
- A found car key opens the car at about minute 7.
- A mock Moving Day choice at about minute 12.

It passes if players keep searching after automation arrives and want "one more find."

## Open item
Terra found two Reddit threads ([1](https://www.reddit.com/r/tipofmyjoystick/comments/1fla3ge), [2](https://www.reddit.com/r/tipofmytongue/comments/x4z6yb)) where players half-remember an older game about finding couch coins and buying helpers. It should be identified before the concept is final.
