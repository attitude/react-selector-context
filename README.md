# react-selector-context

Tiny selector library for React Context to fix unnecessary re-renders

## Installation

- `npm add react-selector-context`
- `yarn add react-selector-context`
- `pnpm add react-selector-context`

## Usage

1. Wrap existing React context with `createSelectorContext(yourContext)`
2. Replace original `useContext()` hook with a new one returned with a selector
3. Replace original `Context.Provider` with a new one returned
4. Profit!

```tsx
import { memo, createContext, useMemo, useState } from 'react'
import { createSelectorContext } from 'react-selector-context'

type CountersStore = {
  counter: number;
  otherCounter: number;
}

const Counters = createContext<CountersStore>({
  counter: 0,
  otherCounter: 0,
})

// Step 1:
export const [Provider, useSelectorContext] = createSelectorContext(Context)

const selectCounter = (context: CountersStore) => context.counter
const selectOtherCounter = (context: CountersStore) => context.otherCounter

const Counter = memo(() => {
  // Step 2:
  const value = useSelectorContext(selectCounter)

  const renders = useRef(0)
  renders.current = renders.current + 1

  return <span>Count: {value}, renders: {renders.current}</span>
})

const OtherCounter = memo(() => {
  // Step 2:
  const value = useSelectorContext(selectOtherCounter)

  const renders = useRef(0)
  renders.current = renders.current + 1

  return <span>Other Count: {value}, renders: {renders.current}</span>
})

export default App() {
  const [counter, setCounter] = useState(0)
  const [otherCounter, setOtherCounter] = useState(0)

  const value = useMemo(() => ({
    counter,
    otherCounter,
    setCounter,
    setOtherCounter,
  }), [counter, otherCounter ])

  // Step 3:
  return (
    <div>
      <Provider value={value}>
        <SelectorCounter />
        <button onClick={() => {
          setCounter(value => value + 1)
        }}>
          Increase counter
        </button>

        <OtherSelectorCounter />
        <button onClick={() => { setOtherCounter(value => value + 1) }}>
          Increase other counter
        </button>
      </Provider>
    </div>
  )
}
```

[See the full example &rarr;](apps/web/src/Components/SelectorCounters.tsx)
