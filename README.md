# react-selector-context

Tiny selector library for React Context to fix unnecessary re-renders
by adding selector support to React Context.

Selectors are functions that take the current state of the context and return
a specific piece of data. They are similar to mapStateToProps in Redux,
but they are not tied to Redux.

## How does createSelectorContext work?

`createSelectorContext()` takes a React context and returns:

1. a new Provider component;
2. useSelectorContext hook that supports selectors;
3. and Consumer component.

The `Provider` component is a standard React context provider, with one difference:
it wraps its children in a new context that exposes subscribe and unsubscribe API.
Whenever the value prop changes it then calls its subscribed selector with an updated
values.

The `useSelectorContext()` hook is a function that takes a selector function
and returns the selected value. Whenever the selected value changes,
the component using this hook will re-render, returning the newly selected value.

## Benefits over the React Context

1. You can avoid passing down props to multiple levels of components as with
   a classic React Context, but you can use selectors to select only the data you need
   from the context and use it in any component that needs it.
2. You can optimize the performance of your components by using the equal parameter
   in the useSelectorContext hook. This parameter allows you to specify
   a custom equality function to compare the previous and current values of the selected data.
   This means that the component will only re-render if the selected data has changed.
3. You can decouple your components from the context.
   By using selectors, your components don't need to know about the structure of the context.
   They only need to know what data they need and how to select it.

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
export const [Provider, useSelectorContext] = createSelectorContext(Counters)

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
