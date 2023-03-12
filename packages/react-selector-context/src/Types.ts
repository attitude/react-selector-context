export type Selector<Store, Result> = (input: Store) => Result
export type UseSelectorContextHook<Store> = <Result>(selector: Selector<Store, Result>, equal?: typeof Object['is']) => Result
