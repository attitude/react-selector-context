import {
	Context,
	createContext,
	memo,
	MutableRefObject,
	NamedExoticComponent,
	ProviderProps,
	useCallback, useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react'
import type { Selector, UseSelectorContextHook } from './Types'

type Callback<Result> = (next: Result) => void
type Register<Store> = <Result>(selector: Selector<Store, Result>, callback: Callback<Result>) => void
type Unregister = <Result>(callback: Callback<Result>) => void

type SelectorContextType<Store> = {
	ref: MutableRefObject<Store>;
	register: Register<Store>;
	unregister: Unregister;
}

type Watchers<Store, Result> = Map<Callback<Result>, Selector<Store, Result>>

/**
 * Wraps original context in a stable one that supports selectors
 *
 * @param context Original context being wrapped
 * @returns Tuple of new provider component and hook to use selector context
 */
export function createSelectorContext<Store>(context: Context<Store>): readonly [NamedExoticComponent<ProviderProps<Store>>, UseSelectorContextHook<Store>] {
	const displayName = context.displayName ?? 'Context'

	const SelectorContext = createContext<SelectorContextType<Store>>(null as unknown as SelectorContextType<Store>)
	SelectorContext.displayName = `SelectorContext(${displayName})`

	const Provider = memo<ProviderProps<Store>>(({ children, value }) => {
		const ref = useRef(value); ref.current = value
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const watchers = useRef<Watchers<Store, any>>(new Map)

		useEffect(() => {
			watchers.current.forEach(
				(selector, callback) => {
					const next = selector(value)
					callback(next)
				},
			)
		}, [value])

		return (
			<SelectorContext.Provider value={useMemo(() => ({
				ref,
				register: (selector, callback) => {
					watchers.current.set(callback, selector)
				},
				unregister: (callback) => {
					watchers.current.delete(callback)
				},
			}), [])}>
				{children}
			</SelectorContext.Provider>
		)
	})
	Provider.displayName = `SelectorContext(${displayName})`

	const useSelectorContext: UseSelectorContextHook<Store> = (
		selector,
		equal = Object.is,
	) => {
		const { ref, register, unregister } = useContext(SelectorContext)

		const [previous, setPrevious] = useState(selector(ref.current))
		const previousRef = useRef(previous); previousRef.current = previous

		const onSelect = useCallback((next: typeof previous) => {
			if (!equal(previousRef.current, next)) {
				previousRef.current = next
				setPrevious(next)
			}
		}, [equal])

		useEffect(() => {
			register(selector, onSelect)

			return () => {
				unregister(onSelect)
			}
		}, [selector, onSelect, register, unregister])

		return previous
	}

	return [Provider, useSelectorContext] as const
}
