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
 * Wraps a context in a stable context with selector support.
 *
 * @param context Original context to wrap
 * @returns A tuple containing the new context and a hook to use the context
 * @example
 * const [SelectorContext, useSelectorContext] = createSelectorContext(React.createContext({}))
 * const store = { foo: 'bar' }
 * const selector = (store) => store.foo
 *
 * const Component = () => {
 * 	const foo = useSelectorContext(selector)
 * 	return <div>{foo}</div>
 * }
 *
 * ReactDOM.render(
 * 	<SelectorContext.Provider value={store}>
 * 		<Component />
 * 	</SelectorContext.Provider>,
 * 	document.getElementById('root'),
 * )
 */
export function createSelectorContext<Store>(context: Context<Store>): readonly [{
	Consumer: (props: ConsumerProps<Store>) => ReactNode;
	Provider: NamedExoticComponent<ProviderProps<Store>>;
}, UseSelectorContextHook<Store>] {
	const displayName = context.displayName ?? 'Context'

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const SelectorSubscriptions = createContext<SelectorContextType<Store>>(null!)
	SelectorSubscriptions.displayName = `${displayName}(Subscriptions)`

	/**
	 * Provider component that re-renders all consumers whenever the store changes.
	 * @param props Provider props
	 * @returns Provider component
	 * @example
	 * const [SelectorContext, useSelectorContext] = createSelectorContext(React.createContext({}))
	 * const store = { foo: 'bar' }
	 * const selector = (store) => store.foo
	 *
	 * const Component = () => {
	 *  const foo = useSelectorContext(selector)
	 * 	return <div>{foo}</div>
	 * }
	 *
	 * ReactDOM.render(
	 * 	<SelectorContext.Provider value={store}>
	 * 		<Component />
	 * 	</SelectorContext.Provider>,
	 * 	document.getElementById('root'),
	 * )
	 */
	const Provider = memo<ProviderProps<Store>>(({ children, value }) => {
		const ref = useRef(value); ref.current = value
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const selectorSubscriptions = useRef<Subscriptions<Store, any>>(new Map)

		useEffect(() => {
			selectorSubscriptions.current.forEach(
				(selector, callback) => {
					callback(selector(value))
				},
			)
		}, [value])

		useEffect(() => {
			const currentSelectorSubscriptions = selectorSubscriptions.current

			return () => {
				currentSelectorSubscriptions.forEach((_, callback) => {
					currentSelectorSubscriptions.delete(callback)
				})
			}
		}, [])

		return (
			<SelectorSubscriptions.Provider value={useMemo(() => ({
				ref,
				register: (selector, callback) => {
					selectorSubscriptions.current.set(callback, selector)
				},
				unregister: (callback) => {
					selectorSubscriptions.current.delete(callback)
				},
			}), [])}>
				{children}
			</SelectorSubscriptions.Provider>
		)
	})
	Provider.displayName = `SelectorContext(${displayName}.Provider)`

	/**
	 * Returns a hook that returns the value of the selector, and re-renders the component whenever the value of the selector changes.
	 *
	 * @param selector Function to select a value from the store.
	 * @param equal Function to test whether two objects are equal. Defaults to Object.is.
	 * @returns The value of the selector.
	 * @example
	 * const [SelectorContext, useSelectorContext] = createSelectorContext(React.createContext({}))
	 * const store = { foo: 'bar' }
	 * const selector = (store) => store.foo
	 *
	 * const Component = () => {
	 *  const foo = useSelectorContext(selector)
	 * 	return <div>{foo}</div>
	 * }
	 *
	 * ReactDOM.render(
	 * 	<SelectorContext.Provider value={store}>
	 * 		<Component />
	 * 	</SelectorContext.Provider>,
	 * 	document.getElementById('root'),
	 * )
	 */
	const useSelectorContext: UseSelectorContextHook<Store> = (
		selector,
		equal = Object.is,
	) => {
		const { ref, register, unregister } = useContext(SelectorSubscriptions)

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

	/**
	 * Returns a component that renders its children with the value of the selector, and re-renders the component whenever the value of the selector changes.
	 * @param props Consumer props
	 * @returns Consumer component
	 * @example
	 * const [SelectorContext, useSelectorContext] = createSelectorContext(React.createContext({}))
	 * const store = { foo: 'bar' }
	 * const selector = (store) => store.foo
	 *
	 * const Component = () => {
	 * 	return (
	 * 		<SelectorContext.Consumer selector={selector}>
	 * 			{(foo) => <div>{foo}</div>}
	 * 		</SelectorContext.Consumer>
	 * 	)
	 * }
	 *
	 * ReactDOM.render(
	 * 	<SelectorContext.Provider value={store}>
	 * 		<Component />
	 * 	</SelectorContext.Provider>,
	 * 	document.getElementById('root'),
	 * )
	 */
	const Consumer = ({
		children,
		selector,
		equal = Object.is,
	}: ConsumerProps<Store>) => {
		return children(useSelectorContext(selector, equal)) ?? null
	}
	Consumer.displayName = `SelectorContext(${displayName}.Consumer)`

	return [{
		Consumer,
		Provider,
	}, useSelectorContext] as const
}
