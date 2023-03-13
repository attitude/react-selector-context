import {
	Context,
	createContext,
	memo,
	MutableRefObject,
	NamedExoticComponent,
	ReactNode,
	useCallback, useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react'
import type { ConsumerProps, ProviderProps, Selector, UseSelectorContextHook } from './Types'

type Callback<Result> = (next: Result) => void
type Register<Store> = <Result>(selector: Selector<Store, Result>, callback: Callback<Result>) => void
type Unregister = <Result>(callback: Callback<Result>) => void

type SelectorContextType<Store> = {
	ref: MutableRefObject<Store>;
	register: Register<Store>;
	unregister: Unregister;
}

type Subscriptions<Store, Result> = Map<Callback<Result>, Selector<Store, Result>>

/**
 * Wraps original context in a stable one that supports selectors
 *
 * @param context Original context being wrapped
 * @returns Tuple of new provider component and hook to use selector context
 */
export function createSelectorContext<Store>(context: Context<Store>): readonly [{
	Consumer: (props: ConsumerProps<Store>) => ReactNode;
	Provider: NamedExoticComponent<ProviderProps<Store>>;
}, UseSelectorContextHook<Store>] {
	const displayName = context.displayName ?? 'Context'

	const Subscriptions = createContext<SelectorContextType<Store>>(null as unknown as SelectorContextType<Store>)
	Subscriptions.displayName = `${displayName}(Subscriptions)`

	const Provider = memo<ProviderProps<Store>>(({ children, value }) => {
		const ref = useRef(value); ref.current = value
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const subscriptions = useRef<Subscriptions<Store, any>>(new Map)

		useEffect(() => {
			subscriptions.current.forEach(
				(selector, callback) => {
					callback(selector(value))
				},
			)
		}, [value])

		return (
			<Subscriptions.Provider value={useMemo(() => ({
				ref,
				register: (selector, callback) => {
					subscriptions.current.set(callback, selector)
				},
				unregister: (callback) => {
					subscriptions.current.delete(callback)
				},
			}), [])}>
				{children}
			</Subscriptions.Provider>
		)
	})
	Provider.displayName = `SelectorContext(${displayName}.Provider)`

	const useSelectorContext: UseSelectorContextHook<Store> = (
		selector,
		equal = Object.is,
	) => {
		const { ref, register, unregister } = useContext(Subscriptions)

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

	const Consumer = ({
		children,
		selector,
		when = Object.is,
	}: ConsumerProps<Store>) => {
		return children(useSelectorContext(selector, when)) ?? null
	}
	Consumer.displayName = `SelectorContext(${displayName}.Consumer)`

	return [{
		Consumer,
		Provider,
	}, useSelectorContext] as const
}
