import { memo, useContext } from 'react'
import { AppContext } from '../Context'
import { CounterUI } from './CounterUI'

export const NormalCounter = memo(() => {
  const { setCounter, counter } = useContext(AppContext)

  return (
    <CounterUI action={setCounter} label="Normal Counter" value={counter} />
  )
})
NormalCounter.displayName = 'NormalCounter'

export const OtherNormalCounter = memo(() => {
  const { otherCounter, setOtherCounter } = useContext(AppContext)

  return (
    <CounterUI action={setOtherCounter} label="Other Normal Counter" value={otherCounter} />
  )
})
OtherNormalCounter.displayName = 'OtherNormalCounter'
