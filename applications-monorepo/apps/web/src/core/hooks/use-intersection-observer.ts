import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type State = {
	isIntersecting: boolean;
	entry?: IntersectionObserverEntry;
};

type UseIntersectionObserverOptions = {
	root?: Element | Document | null;
	rootMargin?: string;
	threshold?: number | number[];
	freezeOnceVisible?: boolean;
	onChange?: (
		isIntersecting: boolean,
		entry: IntersectionObserverEntry,
	) => void;
	initialIsIntersecting?: boolean;
};

type IntersectionReturn = {
	ref: (node: Element | null) => void;
	isIntersecting: boolean;
	entry?: IntersectionObserverEntry;
};

export function useIntersectionObserver({
	threshold = 0,
	root = null,
	rootMargin = "0%",
	freezeOnceVisible = false,
	initialIsIntersecting = false,
	onChange,
}: UseIntersectionObserverOptions = {}): IntersectionReturn {
	const [ref, setRef] = useState<Element | null>(null);
	const observerRef = useCallback((node: Element | null) => {
		setRef(node);
	}, []);

	const [state, setState] = useState<State>(() => ({
		isIntersecting: initialIsIntersecting,
		entry: undefined,
	}));

	const callbackRef =
		useRef<UseIntersectionObserverOptions["onChange"]>(undefined);

	callbackRef.current = onChange;

	const frozen = state.entry?.isIntersecting && freezeOnceVisible;
	const observerOptions = useMemo(
		() => ({ threshold, root, rootMargin }),
		[threshold, root, rootMargin],
	);

	useEffect(() => {
		// Ensure we have a ref to observe
		if (!ref) return;

		// Ensure the browser supports the Intersection Observer API
		if (!("IntersectionObserver" in window)) return;

		// Skip if frozen
		if (frozen) return;

		let unobserve: (() => void) | undefined;

		const observer = new IntersectionObserver(
			(entries: IntersectionObserverEntry[]): void => {
				const thresholds = Array.isArray(observer.thresholds)
					? observer.thresholds
					: [observer.thresholds];

				entries.forEach((entry) => {
					const isIntersecting =
						entry.isIntersecting &&
						thresholds.some(
							(threshold) => entry.intersectionRatio >= threshold,
						);

					setState({ isIntersecting, entry });

					if (callbackRef.current) {
						callbackRef.current(isIntersecting, entry);
					}

					if (isIntersecting && freezeOnceVisible && unobserve) {
						unobserve();
						unobserve = undefined;
					}
				});
			},
			observerOptions,
		);

		observer.observe(ref);

		return () => {
			observer.disconnect();
		};
	}, [ref, observerOptions, frozen, freezeOnceVisible]);

	// ensures that if the observed element changes, the intersection observer is reinitialized
	const prevRef = useRef<Element | null>(null);

	useEffect(() => {
		if (
			!ref &&
			state.entry?.target &&
			!freezeOnceVisible &&
			!frozen &&
			prevRef.current !== state.entry.target
		) {
			prevRef.current = state.entry.target;
			setState({ isIntersecting: initialIsIntersecting, entry: undefined });
		}
	}, [ref, state.entry, freezeOnceVisible, frozen, initialIsIntersecting]);

	return {
		ref: observerRef,
		isIntersecting: !!state.isIntersecting,
		entry: state.entry,
	};
}
