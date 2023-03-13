export type { ProviderProps } from 'react'
import type { ReactNode } from 'react'

export type Selector<Store, Result> = (input: Store) => Result
export type UseSelectorContextHook<Store> = <Result>(selector: Selector<Store, Result>, equal?: typeof Object['is']) => Result

export interface ConsumerProps<T> {
  children: <U>(value: U) => ReactNode;
  selector: <U>(value: T) => U;
  when?: (typeof Object)['is'];
}
