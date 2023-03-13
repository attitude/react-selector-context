import { useMemo, useState } from 'react'
import './App.css'
import { AppSelectorContext, NormalCounter, OtherNormalCounter, OtherSelectorCounter, SelectorCounter } from './Components'
import { AppContext } from './Context'

function hrefToRepository({ href, hostname, pathname }: Location) {
  const owner = hostname.split('.')[0] ?? ''
  const repository = pathname.split('/')[1] ?? ''

  if (owner && repository) {
    return `https://github.com/${owner}/${repository}`
  } else {
    console.error('Failed to get github link')
    return href
  }
}

export function App() {
  const [counter, setCounter] = useState(0)
  const [otherCounter, setOtherCounter] = useState(0)

  const value = useMemo(() => ({
    counter,
    otherCounter,
    setCounter,
    setOtherCounter,
  }), [
    counter,
    otherCounter,
    setCounter,
    setOtherCounter,
  ])

  return (
    <main className="vertical-stack box-padding">
      <header className="vertical-stack gap">
        <h1>React Context with Selectors</h1>
        <a href={hrefToRepository(window.location)}>GitHub repository &rarr;</a>

        <p>
          When React context changes all components consuming such context need to re-render.
          It is expected behavior but that causes endless nesting of context providers to
          achieve update granularity and re-render only the parts of our application
          that really need to re-render.
        </p>
      </header>

      <p>
        <strong>This is an example of a typical context usage. Try to increase any of the counters,
          notice how both counter components re-render:</strong>
      </p>

      <p>Context: <code>{JSON.stringify({ counter, otherCounter })}</code></p>

      <div className="vertical-stack gap">
        <AppContext.Provider value={value}>
          <NormalCounter />
          <OtherNormalCounter />
        </AppContext.Provider>
      </div>

      <p>
        There are solutions like <a href="https://github.com/reduxjs/reselect/tree/master"
          rel="nofollow noreferrer" target="_blank">reselect</a> for Redux, but they are lacking
        fot the built-in React context.
      </p>

      <p>
        <a href="https://beta.reactjs.org/reference/react/useContext#optimizing-re-renders-when-passing-objects-and-functions"
          rel="nofollow noreferrer" target="_blank">Memoizing to stop unnecessary re-renders</a> has typically
        substantial results — the hooks consuming context simply will be called and will cause re-render.
      </p>

      <h2>Can we have <em>reselect</em> but for React Context please?</h2>

      <p>
        Turns out we can! And only by using what is already available in React library.
        By wrapping the React context we can apply selectors and also an extra equality check.
      </p>

      <p>
        <strong>This is an example of a selector context usage. Try to increase any of the counters,
          notice how only one of the counter components change each time:</strong>
      </p>

      <p>Context: <code>{JSON.stringify({ counter, otherCounter })}</code></p>

      <div className="vertical-stack gap">
        <AppSelectorContext.Provider value={value}>
          <SelectorCounter />
          <OtherSelectorCounter />
        </AppSelectorContext.Provider>
      </div>

      <p>
        Each of the selector counter components now consumes a new stable context
        and only re-renders when its selector returns new value.
      </p>
      <p>
        <strong>
          By default, the selected values are compared against <code>Object.is</code>.
          Therefore it is your responsibility to return stable reference of the selected data.
          Otherwise the you cannot see benefits of using context with selectors.
        </strong>
      </p>

      <footer className="vertical-stack gap">
        <a className="horizontal-stack justify-center padding border border-radius"
          href={`${hrefToRepository(window.location)}/blob/main/apps/web/src/Components/SelectorCounters.tsx`}>Show me the code!</a>

        <a className="align-center" href={hrefToRepository(window.location)}>GitHub repository &rarr;</a>
      </footer>
    </main>
  )
}
