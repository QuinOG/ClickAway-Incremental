# ClickAway incremental concepts: the debate round

You are one of three game-design judges (Sol, Terra and Sonnet). In the last round, each of you studied ClickAway (a browser reflex game where you click shrinking targets for combos, with an Armory machine builder, powerup keys, coins, XP and cosmetics). Each of you proposed incremental-game concepts it could grow into. The owner wants to pivot the project toward an incremental game for a much wider audience. **Do not edit, create or delete any files in this repo.**

Background material, unchanged from last round:
- `docs/concepts/concept-brief.md`: the original brief.
- `docs/concepts/app-tour/`: screenshots of every screen.
- `docs/concepts/reference-favorites.png`: the owner's list of favourite incrementals and why they like them. Cauldron is "my favorite by far", followed by Scritchy Scratchy, Factory Town Idle, Alchemist's Garden and Legends of Dragaea; Digseum and Upload Labs are near misses.
- The source code (`src/`, `server/`) is open to you.

Below is **every unique concept** the three of you proposed, with its author. Several of you converged on a factory; those versions are grouped into one entry.

## The concepts

### A. Factory built from the machine
*Sol's "Sparkworks", Terra's "ClickAway Workshop", Sonnet's "Cartridge Foundry". This was Terra's and Sonnet's #1 pick.*
Clicking targets extracts Sparks or shards. Extractors and drones automate that (Sol: 25 Sparks buys an Extractor at 1/s). Condensers and presses convert resources (Sparks → Cells → coins → research), and the player solves production bottlenecks.
- **Armory reuse:** core/lens/rig become station stats (Sol: core = throughput, lens = yield, rig = power draw), and powerup keys become line-wide Overclock bursts.
- **Sonnet:** a 12×12 station grid with Doctrines (Speed, Quality or Volume) and permanent Blueprints.
- **Terra:** workshop orders and Charters (Salvager turns misses into scrap; Conductor links adjacent machines).
- **Sol:** restore a dark city district by district. Prestige launches a district for Patents, and the next district changes the economics (a storm district gives free power but needs insulation; a greenhouse district rewards recycling).
- **Offline and active:** 8–24h offline. Active bursts are worth about +20% daily output.
- **Inspired by** Factory Town Idle and Shapez.

### B. Oddjob Arcade (Sol, Sol's #1 pick)
You restore a magical arcade, and each cabinet is its own evolving clicking incremental.
- **Spark Popper** (today's game) earns tickets. Upgrades like Twin Targets and Chain Lightning change how you click.
- **Attendants** automate each cabinet (manual → assisted → automated). Crystal Catcher and Clockwork Rally unlock later, and their resources cross-feed (crystals fork lightning; gears automate crystal collection).
- **Prestige:** open a new branch. Star Licenses change cabinet rules (bouncing, linked or rhythm targets), and you pick two starting cabinets.
- **Offline and active:** attendants run 24h offline. Active play banks a capped "Showmanship" bonus.
- **Inspired by** Cauldron and Scritchy Scratchy.

### C. Combo Cauldron (Sonnet)
A WarioWare-style alchemist game.
- **Clicking:** 5-second micro-rounds that are variants of today's game (moving, decoy and rhythm targets). Hits drop essence, and the streak sets its tier (Dull, Bright, Prismatic).
- **Brewing:** the cauldron brews potions to sell. Apprentices run micro-rounds at 30% of your skill, and Armory builds are their loadouts.
- **Long term:** recipe trees, named Customers' orders and Reputation.
- **Prestige ("Grand Brew"):** Relics permanently change rules ("decoys give double essence"), and variant availability is reshuffled.
- **Offline and active:** active play earns 3–5× the idle rate.
- **Inspired by** Cauldron and Alchemist's Garden.

### D. Relic Runners (Sol)
A salvage guild.
- **Clicking** fractures deposits to reveal coins and artifact fragments. Drones dig automatically, and three crews work different ruins.
- **Museum:** restored artifacts become exhibits that strengthen future digs.
- **Armory reuse:** core/lens/rig become drill/scanner/recovery, with interactions (a scanner marks weak points, a drill hits every mark, a recovery rig turns overkill into salvage).
- **Prestige:** a new continent with new geology (crystal caves split deposits; flooded ruins reward recovery gear). Exhibits and blueprints carry over.
- **Fairness:** to stop random drops stalling progress, you can choose a guaranteed fragment after ten clears.
- **Offline:** 24h offline.
- **Inspired by** Alchemist's Garden, Digseum and Legends of Dragaea.

### E. Orb Expedition (Terra)
You pilot a modular probe through worlds.
- **Clicking** mines and scans deposits. Auto-miners automate it, and lenses reveal hidden deposits.
- **Expeditions** resolve offline (8h), and you choose zones by hazard and reward. Artifacts give unusual build effects (a Chain Lens jumps every fifth hit).
- **Prestige:** chart the edge of a sector and pick a route modifier (Dense Asteroids clusters targets; Silent Sector favours idle scanning).
- **Anomalies:** today's shrinking-target rounds become optional anomaly encounters.
- **Inspired by** Cauldron and Legends of Dragaea.

### F. The Target Garden (Terra)
An alchemist's greenhouse.
- **Clicking:** tap targets to plant, water and harvest.
- **Economy:** herbs become potions, which earn coins for beds and sprinklers. Plant adjacency matters (moonmint boosts nightshade), and customers place orders.
- **Prestige ("seasons"):** an heirloom seed changes the next season's ecology (frost seeds bring cold plants and weather recipes).
- **Offline and active:** 8h offline. Active tending improves quality, and there's no penalty for misses.
- **Inspired by** Alchemist's Garden.

### G. Scratch & Win Arcade (Sonnet)
A lottery parlor.
- **Clicking** reveals symbols on scratch cards. Matching three pays out, and combos multiply.
- **Progression:** card tiers with their own mechanics (12 types), clerks for auto-scratching, and daily Jackpots.
- **Prestige ("Grand Reopening"):** Stars buy permanent Charm slots and House Rules.
- **Inspired by** Scritchy Scratchy.
- **Known risk:** it reads as gambling.

### H. Idle Squad (Sonnet)
Armory builds become machine-heroes fighting dungeon floors, and clicks are crits and commands.
- **Progression:** a boss every 10 floors, more hero recruits, and floor 500+.
- **Prestige:** Ascend for Souls, which unlock new hero classes. Squads fight each other in async PvP duels.
- **Offline and active:** idle play runs at about 60% of active.
- **Inspired by** Clicker Heroes and Legends of Dragaea.

## Your job: argue to a top three
Judge every concept on its merits, including your own and your rivals'. Do not defend your own idea out of loyalty. Change your mind if the evidence says so; that is a sign of a good judge, not a weak one. You may **merge** concepts, or borrow a mechanic from one into another, if the result is stronger.

**Compelling evidence** means:
- **Market evidence** from web research: Steam review counts and scores, player counts, sales or wishlist signals, genre trends, and what reviewers praise or complain about in comparable games. Cite sources with links.
- **Owner fit**: how well each concept delivers what the owner wrote they love, quoting their list.
- **Build evidence** from the repo: name the files and systems each concept would reuse and estimate what is new. Unsupported claims of "lots of reuse" don't count.
- **Design evidence**: whether the loop holds up at 10 seconds, 10 minutes and day 10; whether prestige changes decisions; and whether clicking stays meaningful once automation arrives.

Return about 1,000 words, in exactly this shape:

QUICK VERDICTS: one line per concept, A–H. State the strongest reason for it and the strongest reason against.
TOP THREE (ranked):
1. <concept or merge>: the case for it, with evidence, and the smallest playable version.
2. ...
3. ...
WHERE I CHANGED MY MIND: what moved you since last round, if anything.
STRONGEST COUNTER-ARGUMENT: the best argument against your #1, and your answer to it.
