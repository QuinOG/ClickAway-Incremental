import { useCallback, useEffect, useRef, useState } from "react"
import { createGame, deserialize, applyOffline, serialize, tick, clickGlint, buyUpgrade, useMagnet, useLintBall, switchLocation, moveHouse, getUpgrades, getCollection, getLocations, canMoveHouse } from "./engine.js"

const SAVE_KEY = "spareChange.save.v1"
function loadGame() {
  const now = Date.now()
  try {
    const saved = deserialize(localStorage.getItem(SAVE_KEY), now)
    if (saved) return applyOffline(saved, now)
  } catch { /* Storage can be unavailable in private browsing. */ }
  return { state: createGame({ seed: Math.floor(Math.random() * 4294967296), now }), summary: null }
}

export default function useSpareChange() {
  const [initial] = useState(loadGame)
  const [snapshot, setSnapshot] = useState({ state: initial.state, events: [], now: initial.state.savedAt })
  const current = useRef(snapshot)
  const sequence = useRef(0)
  const [offlineSummary, setOfflineSummary] = useState(initial.summary?.ms > 1000 ? initial.summary : null)
  const run = useCallback((action, ...args) => {
    const now = Date.now()
    const before = current.current
    const result = action(before.state, ...args, now)
    const events = (result.events ?? []).map(event => {
      const glint = before.state.glints.find(g => g.id === event.glintId)
      return { ...event, key: ++sequence.current, at: now, x: glint?.x ?? 0.5, y: glint?.y ?? 0.5 }
    })
    const next = { state: result.state ?? result, now, events: [...before.events.filter(e => now - e.at < 5000), ...events].slice(-30) }
    current.current = next
    setSnapshot(next)
  }, [])
  useEffect(() => {
    const save = () => {
      try { localStorage.setItem(SAVE_KEY, serialize(current.current.state, Date.now())) } catch { /* Continue playing without persistence. */ }
    }
    const update = setInterval(() => run(tick), 100)
    const autosave = setInterval(save, 5000)
    const onKey = event => {
      if (event.key === "1" && !event.repeat && !event.ctrlKey && !event.metaKey && !event.altKey && !event.target.closest?.("input, textarea, select, [contenteditable=true]")) run(useMagnet)
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("visibilitychange", save)
    window.addEventListener("pagehide", save)
    return () => {
      clearInterval(update)
      clearInterval(autosave)
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("visibilitychange", save)
      window.removeEventListener("pagehide", save)
      save()
    }
  }, [run])
  return {
    ...snapshot, upgrades: getUpgrades(snapshot.state), collection: getCollection(snapshot.state), locations: getLocations(snapshot.state), canMove: canMoveHouse(snapshot.state),
    click: id => run(clickGlint, id), buy: id => run(buyUpgrade, id), magnet: () => run(useMagnet), lintBall: () => run(useLintBall), switchLocation: id => run(switchLocation, id), moveHouse: id => run(moveHouse, id),
    offlineSummary, dismissOffline: () => setOfflineSummary(null),
    resetSave: () => {
      const next = { state: createGame({ seed: Math.floor(Math.random() * 4294967296), now: Date.now() }), events: [], now: Date.now() }
      current.current = next
      setSnapshot(next)
      setOfflineSummary(null)
      try { localStorage.removeItem(SAVE_KEY) } catch { /* Storage unavailable. */ }
    },
  }
}
