import { act, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, expect, test, vi } from "vitest"
import SpareChangePage from "../src/features/spareChange/SpareChangePage.jsx"

afterEach(() => { vi.useRealTimers(); localStorage.clear() })

test("a spawned glint reveals a find when clicked", () => {
  vi.useFakeTimers()
  localStorage.clear()
  render(<SpareChangePage />)
  act(() => { vi.advanceTimersByTime(1700) })
  fireEvent.click(screen.getByRole("button", { name: /^Glint/ }))
  expect(screen.getByTestId("find-popup").textContent.length).toBeGreaterThan(0)
  expect(screen.getByText("1 finds in a row")).toBeTruthy()
})
