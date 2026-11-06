import { useEffect, useRef, useState } from "react"
import useSpareChange from "./useSpareChange.js"
import { DISTRICTS, formatCents, getGlintSize, LINT_BALL_COST, MOVE_HOUSE_CENTS } from "./engine.js"
import "./spareChange.css"

function MovingDialog({ onChoose, onClose }) {
  const ref = useRef(null)
  useEffect(() => {
    const previous = document.activeElement
    ref.current.showModal()
    return () => previous?.focus()
  }, [])
  return <dialog className="sc-dialog" ref={ref} onCancel={onClose} aria-labelledby="moving-title">
    <span className="sc-eyebrow">A fresh start</span><h2 id="moving-title">Moving Day</h2>
    <p>You've saved {formatCents(MOVE_HOUSE_CENTS)}. Time to move.</p>
    {Object.entries(DISTRICTS).map(([id, district]) => <button key={id} onClick={() => onChoose(id)}><strong>{district.name}</strong><span>{district.blurb}</span></button>)}
    <button onClick={onClose}>Stay a little longer</button>
  </dialog>
}

export default function SpareChangePage() {
  const game = useSpareChange()
  const { state, events, now } = game
  const [moving, setMoving] = useState(false)
  useEffect(() => {
    const previous = document.title
    document.title = "Spare Change · A little treasure hunt"
    return () => { document.title = previous }
  }, [])
  const finds = events.filter(e => e.type === "find")
  return <main className="spare-change">
    <header className="sc-header"><div><span className="sc-eyebrow">There’s treasure in the everyday</span><h1>Spare Change<span>.</span></h1></div><span className="sc-save-note">A little treasure hunt · Saved on this device</span></header>
    <div className="sc-layout"><section className="sc-play" aria-label="Treasure hunt">
      <div className="sc-hud"><div><span className="sc-eyebrow">Pocket money</span><strong className="sc-money" data-testid="cents">{formatCents(state.cents)}</strong><small>{formatCents(state.earnedCents)} found all time</small></div>
        <div className="sc-combo"><span>{state.combo} finds in a row</span><strong>×{state.comboMult.toFixed(1)}</strong><meter min="0" max="10" value={Math.min(10, state.combo)} aria-label="Combo charge" /></div>
      </div>
      <div className="sc-location-bar"><nav aria-label="Search location">{game.locations.map(location => <button key={location.id} disabled={!location.unlocked} aria-pressed={location.active} onClick={() => game.switchLocation(location.id)}>{location.unlocked ? location.name : <><span aria-hidden="true">⚿</span> Car · Find the key</>}</button>)}</nav><span>{state.district ? DISTRICTS[state.district].name : "Home, sweet home"}</span></div>
      <div className={`sc-room ${state.location === "car" ? "sc-car" : ""}`}>
        <div className="sc-wall-art" aria-hidden="true">a little<br />luck.</div><div className="sc-lamp" aria-hidden="true"><i /><b /></div>
        <div className="sc-scene-label">{state.location === "car" ? "THE BACK SEAT" : `${state.district ? DISTRICTS[state.district].name.toUpperCase() + " · " : ""}THE OLD COUCH`}</div>
        <div className="sc-sofa" aria-hidden="true"><div className="sc-back"><i /><i /><i /></div><div className="sc-seats"><i /><i /><i /></div><div className="sc-arm sc-left" /><div className="sc-arm sc-right" /><div className="sc-base" /><div className="sc-leg sc-left" /><div className="sc-leg sc-right" /></div>
        <div className="sc-search" aria-label="Search the cushions">
          {state.glints.map(glint => <button key={glint.id} className={`sc-glint sc-${glint.tier}`} aria-label={`Glint (${glint.tier})`} onClick={() => game.click(glint.id)} style={{ left: `${glint.x * 100}%`, top: `${glint.y * 100}%` }}><svg aria-hidden="true" viewBox="0 0 40 40" style={{ transform: `scale(${0.15 + getGlintSize(glint, now) * 0.85})`, opacity: 0.2 + getGlintSize(glint, now) * 0.8 }}><path d="M20 0 25 15 40 20 25 25 20 40 15 25 0 20 15 15Z" /></svg></button>)}
          {finds.filter(e => e.source === "click" || e.source === "magnet").map(event => <div key={event.key} data-testid="find-popup" className="sc-popup" style={{ left: `${event.x * 100}%`, top: `${event.y * 100}%` }}><strong>{event.name} · {event.findId === "lint" ? "+1 lint" : formatCents(event.cents)}</strong>{event.isNew && <b>★ NEW</b>}{event.flavor && <em>{event.flavor}</em>}</div>)}
        </div>
        <div className="sc-rug" aria-hidden="true" />
      </div>
      <div className="sc-instructions"><span>✧</span><p>A sparkle in the seams? Give it a click.<small>Keep finding treasures before the glints fade to build your combo.</small></p></div>
      <div className="sc-tools"><span>Lint collected <strong>{state.lint}</strong></span>{state.unlocked.lintBall && <button disabled={state.lint < LINT_BALL_COST} onClick={game.lintBall}>Lint Ball · 25 lint</button>}{state.upgrades.magnet > 0 && <button className={state.magnetCharged ? "sc-charged" : ""} disabled={!state.magnetCharged} onClick={game.magnet}>Magnet · Key 1 {state.magnetCharged ? "· Ready!" : "· Charging"}</button>}{game.canMove && <button onClick={() => setMoving(true)}>Moving Day →</button>}</div>
      <div className="sc-notices" aria-live="polite">{events.filter(e => e.type === "unlock").map(e => <p key={e.key}>{e.what === "car" ? "★ You found the key! The Car is ready to explore." : e.what.startsWith("set:") ? "★ Collection set complete! Your bonus is active." : e.what === "lintBall" ? "Lint Ball unlocked! Put that fluff to work." : "Moving Day is here! A new neighborhood awaits."}</p>)}{finds.filter(e => ["sock", "raccoon"].includes(e.source)).map(e => <p key={e.key}>{e.source === "raccoon" ? "🦝 Raccoon" : "🧦 Sock"} found: {e.name} · {formatCents(e.cents)}{e.flavor && <em> — {e.flavor}</em>}</p>)}</div>
      {game.offlineSummary && <div className="sc-offline" role="status"><strong>While you were away…</strong><p>Your helpers found {formatCents(game.offlineSummary.cents)}.</p><ul>{game.offlineSummary.finds.map(find => <li key={find.id}>{find.name} ×{find.count}</li>)}</ul><button onClick={game.dismissOffline}>Lovely, thanks</button></div>}
    </section>
    <aside className="sc-drawer"><section><span className="sc-eyebrow">Make yourself at home</span><h2>A helping hand</h2><p className="sc-subtitle">Small improvements. Better discoveries.</p><div className="sc-upgrades">{game.upgrades.map((upgrade, i) => <article key={upgrade.id}><span className="sc-upgrade-icon" aria-hidden="true">{["☞", "☼", "↻", "🧦", "🦝", "∩"][i]}</span><div><h3>{upgrade.name}</h3><p>{upgrade.description}</p>{upgrade.maxLevel > 1 && <small>Level {upgrade.level} / {upgrade.maxLevel}</small>}</div><button disabled={!upgrade.affordable} onClick={() => game.buy(upgrade.id)} aria-label={`Buy ${upgrade.name}`}>{upgrade.owned ? "Owned ✓" : formatCents(upgrade.cost)}</button></article>)}</div></section>
    <section className="sc-collection"><span className="sc-eyebrow">Odds, ends & little wonders</span><h2>The keepsake box</h2><ul>{game.collection.items.map(item => <li key={item.id}><span>{item.count ? item.name : "???"}</span><strong>{item.count || "—"}</strong></li>)}</ul>{game.collection.sets.map(set => <div className="sc-set" key={set.id}><strong>{set.complete ? "✓" : "○"} {set.name}</strong><span>{set.complete ? "Complete" : "Incomplete"} · {set.bonus}</span></div>)}</section></aside></div>
    <footer className="sc-footer">Take your time. Check between the cushions.</footer>
    {moving && <MovingDialog onClose={() => setMoving(false)} onChoose={id => { game.moveHouse(id); setMoving(false) }} />}
  </main>
}
