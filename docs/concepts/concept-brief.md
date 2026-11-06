# ClickAway: incremental-game concept council

You are one of three independent game-design judges (Sol, Terra and Sonnet). The owner of ClickAway wants to fork the project and move it from a niche reflex trainer toward an **incremental game** with a much wider audience. Your job is to study the current app and propose concepts it could naturally grow into. **Do not edit, create or delete any files in this repo.**

## What ClickAway is today
A full-stack browser game (React/Vite front end, Express + Postgres back end). Players click a shrinking target as fast and accurately as they can. Each hit shrinks it; a streak builds a combo multiplier; misses cost points. Rounds come in three modes: Practice (untimed), Casual (30s) and Ranked (15s, MMR). Around the core loop are:
- an **Armory**: build a "machine" from core / lens / rig mods that change target size, shrink rate, combo ramp, miss cost and charge rate, plus three powerup keys that charge on streaks;
- a **Shop**: cosmetics (button skins, arena themes, profile images) bought with coins earned from rounds;
- **XP and levels** that unlock parts; a ranked **Ladder**; **Duels**; match history; achievements.

## Study the app
1. Screenshots of nearly every screen are in `docs/concepts/app-tour/` (1440x900). Key ones:
   - `play.png`: the round lobby
   - `live.png` and `longcombo.png`: a round in progress
   - `poweractive.png`: a powerup firing
   - `results.png` and `rankup.png`: end of round
   - `armory.png`, `mods.png`, `powers.png` and `testrun.png`: build screens
   - `shop.png`, `ladder.png`, `duels.png`, `profile.png`, `history.png` and `help.png`
2. You **may read the source** to understand the systems: `src/features/`, `src/pages/`, `src/constants/` and `server/`. Look especially at how rounds, combos, powerups, mods, XP and coins work.
3. You may capture any other screen yourself. A dev server is already running on port 4173, and API calls are mocked, so no login is needed. Run `SCENE=<scene> SHOT=<absolute path in your temp dir>.png npx playwright test tests/e2e/zz-one.spec.js --workers=1`. Scenes are listed at the top of that spec file; `route:<id>` opens any page. Save screenshots outside the repo.
4. `docs/concepts/reference-favorites.png` is a player's write-up of the incremental games they love most, and why: Cauldron, Scritchy Scratchy, Factory Town Idle, Alchemist's Garden and Legends of Dragaea, with Digseum and Upload Labs as near misses. **Research these games on the web if you can**, along with any other successful incrementals that fit (for example Cookie Clicker, Clicker Heroes, Melvor Idle, NGU Idle, Unnamed Space Idle, Bitburner, Antimatter Dimensions or Shapez). Focus on what makes them stick: their core loop, layered progression, prestige / New Game+ and active-versus-idle balance.

## What to produce
Propose **three or four distinct concepts** the project could become. They must be real incremental-game designs, not tweaks to the reflex trainer. Each should grow naturally out of what ClickAway already has: its clicking-on-targets core, combos, the build/machine Armory, powerups on keys, coins, levels, cosmetics and competitive modes. Aim for a wide audience: people who like numbers going up, building things, and short active bursts mixed with idle progress.

For each concept, give:
- **Name and one-line pitch.**
- **Fantasy and theme**: what the player is, and what they are building.
- **Core loop at three timescales**: the first 10 seconds (what a click does), the first 10 minutes, and hours or days in.
- **Progression layers**: currencies, generators or automation, upgrades, unlocks, and how the game opens up new systems over time.
- **Prestige / New Game+**: what resets, what carries over, and why the next run feels different, not just faster.
- **Active vs idle**: how much is skill-based clicking versus waiting, and how a player who only checks in occasionally still progresses. Keep the current reflex play as an optional active layer if it helps.
- **What it reuses**: specific current systems or code (Armory builds, powerups, combo math, shop, XP, ladder) and what is new.
- **Inspired by**: which reference games it borrows from, what exactly it takes, and how it differs.
- **Why a wider audience**: who plays it and why they keep coming back.
- **Risks and the smallest playable version**: what would prove the concept fastest.

Then end with:
- **YOUR #1 PICK**: which concept you would build, and a persuasive case for it. The owner will compare your pick with the other judges' picks.

Keep it to about 1,200 words. Be concrete: numbers, named systems and example upgrades are better than adjectives.
