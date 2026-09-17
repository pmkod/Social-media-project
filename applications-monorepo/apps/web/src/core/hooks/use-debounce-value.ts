import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type DebouncedState<T> = T & {
	cancel: () => void;
	flush: () => void;
	isPending: () => boolean;
};

type UseDebounceCallbackOptions = {
	leading?: boolean;
	trailing?: boolean;
	maxWait?: number;
};

type UseDebounceValueOptions<T> = {
	leading?: UseDebounceCallbackOptions["leading"];
	trailing?: UseDebounceCallbackOptions["trailing"];
	maxWait?: UseDebounceCallbackOptions["maxWait"];
	equalityFn?: (left: T, right: T) => boolean;
};

function useDebounceCallback<Args extends unknown[]>(
	callback: (...args: Args) => void,
	delay: number,
	options?: UseDebounceCallbackOptions,
): DebouncedState<(...args: Args) => void> {
	const callbackRef = useRef(callback);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
		undefined,
	);
	const maxTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
		undefined,
	);
	const pendingArgsRef = useRef<Args | undefined>(undefined);

	callbackRef.current = callback;

	const clearTimers = useCallback(() => {
		if (timeoutRef.current !== undefined) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = undefined;
		}

		if (maxTimeoutRef.current !== undefined) {
			clearTimeout(maxTimeoutRef.current);
			maxTimeoutRef.current = undefined;
		}
	}, []);

	const cancel = useCallback(() => {
		clearTimers();
		pendingArgsRef.current = undefined;
	}, [clearTimers]);

	const invoke = useCallback(() => {
		const args = pendingArgsRef.current;
		if (!args) return;

		pendingArgsRef.current = undefined;
		callbackRef.current(...args);
	}, []);

	const isPending = useCallback(
		() =>
			timeoutRef.current !== undefined || maxTimeoutRef.current !== undefined,
		[],
	);

	const debouncedCallback = useMemo(() => {
		const leading = options?.leading ?? false;
		const trailing = options?.trailing ?? true;
		const maxWait = options?.maxWait;

		const debounced = (...args: Args) => {
			const isFirstCall = timeoutRef.current === undefined;
			pendingArgsRef.current = args;

			if (timeoutRef.current !== undefined) {
				clearTimeout(timeoutRef.current);
			}

			if (isFirstCall && leading) invoke();

			timeoutRef.current = setTimeout(() => {
				timeoutRef.current = undefined;
				if (trailing) invoke();
				else pendingArgsRef.current = undefined;

				if (maxTimeoutRef.current !== undefined) {
					clearTimeout(maxTimeoutRef.current);
					maxTimeoutRef.current = undefined;
				}
			}, delay);

			if (maxWait !== undefined && maxTimeoutRef.current === undefined) {
				maxTimeoutRef.current = setTimeout(() => {
					if (timeoutRef.current !== undefined) {
						clearTimeout(timeoutRef.current);
						timeoutRef.current = undefined;
					}

					maxTimeoutRef.current = undefined;
					if (trailing) invoke();
					else pendingArgsRef.current = undefined;
				}, maxWait);
			}
		};

		return Object.assign(debounced, {
			cancel,
			flush: () => {
				const hasPendingCall = pendingArgsRef.current !== undefined;
				clearTimers();
				if (hasPendingCall && trailing) invoke();
				else pendingArgsRef.current = undefined;
			},
			isPending,
		});
	}, [
		cancel,
		clearTimers,
		delay,
		invoke,
		isPending,
		options?.leading,
		options?.maxWait,
		options?.trailing,
	]);

	useEffect(() => cancel, [cancel]);

	return debouncedCallback;
}

function useDebounceValue<T>(
	initialValue: T | (() => T),
	delay: number,
	options?: UseDebounceValueOptions<T>,
): [T, DebouncedState<(value: T) => void>] {
	const eq = options?.equalityFn ?? ((left: T, right: T) => left === right);
	const unwrappedInitialValue =
		initialValue instanceof Function ? initialValue() : initialValue;
	const [debouncedValue, setDebouncedValue] = useState<T>(
		unwrappedInitialValue,
	);
	const previousValueRef = useRef<T | undefined>(unwrappedInitialValue);

	const updateDebouncedValue = useDebounceCallback(
		setDebouncedValue,
		delay,
		options,
	);

	if (!eq(previousValueRef.current as T, unwrappedInitialValue)) {
		updateDebouncedValue(unwrappedInitialValue);
		previousValueRef.current = unwrappedInitialValue;
	}

	return [debouncedValue, updateDebouncedValue];
}

export { useDebounceValue };
