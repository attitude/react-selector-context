import { createContext, Dispatch, SetStateAction } from 'react'

export type AppContextType = {
  counter: number;
  otherCounter: number;
  setCounter: Dispatch<SetStateAction<number>>;
  setOtherCounter: Dispatch<SetStateAction<number>>;
}

export const AppContext = createContext<AppContextType>({
  counter: 0,
  otherCounter: 0,
  setCounter: () => { throw new Error('Missing parent context') },
  setOtherCounter: () => { throw new Error('Missing parent context') },
})
AppContext.displayName = 'AppContext'
