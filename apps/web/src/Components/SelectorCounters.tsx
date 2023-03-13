import { memo } from 'react'
// 1. Import the factory:
import { createSelectorContext } from 'react-selector-context'
import { AppContext, AppContextType } from '../Context'
import { CounterUI } from './CounterUI'

// 2. Wrap the context
// IMPORTANT: Do not forget to add the Provider somewhere at the root of your application.
export const [AppSelectorContext, useSelectorContext] = createSelectorContext(AppContext)

// 3. Selector for counter value and its setter action:
const selectCounter = (context: AppContextType) => ({
  counter: context.counter,
  setCounter: context.setCounter,
})

// 4. Selector for the other counter value and its setter action:
const selectOtherCounter = (context: AppContextType) => ({
  otherCounter: context.otherCounter,
  setOtherCounter: context.setOtherCounter,
})

// 5. Optional (if selectors return stable reference) comparison method:
//
// We are selecting multiple values and return new object on each context change.
// We therefore need to tell whether the values are really different.
//
// This is a naive and dirty comparison solution.
// Use `immer` or full equality check of object properties instead.
//
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function customEqual(before: any, after: any) {
  return JSON.stringify(before) === JSON.stringify(after)
}

// 6a. Final UI components:
export const SelectorCounter = memo(() => {
  const { setCounter, counter } = useSelectorContext(selectCounter, customEqual)

  return (
    <CounterUI action={setCounter} label="Counter with Selector" value={counter} />
  )
})
SelectorCounter.displayName = 'SelectorCounter'

// 6b. Final UI components:
export const OtherSelectorCounter = memo(() => {
  const { otherCounter, setOtherCounter } = useSelectorContext(selectOtherCounter, customEqual)

  return (
    <CounterUI action={setOtherCounter} label="Other Counter with Selector" value={otherCounter} />
  )
})
OtherSelectorCounter.displayName = 'OtherSelectorCounter'
