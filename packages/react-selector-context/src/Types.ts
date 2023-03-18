export type { ProviderProps } from 'react'
import type { ReactNode } from 'react'

export type Selector<Store, Result> = (input: Store) => Result
export type UseSelectorContextHook<Store> = <Result>(selector: Selector<Store, Result>, equal?: typeof Object['is']) => Result
export type EqualityFunction = typeof Object['is']

export interface ConsumerProps<T> {
  children: <U>(value: U) => ReactNode;
  equal?: EqualityFunction;
  selector: <U>(value: T) => U;
}
