// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { ChillzPlayer } from "./chillz-player";

let root: Root;
let container: HTMLDivElement;
let observers: IntersectionObserverCallback[];
let play: ReturnType<typeof vi.spyOn>;
let pause: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
	vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
	observers = [];
	vi.stubGlobal(
		"IntersectionObserver",
		class {
			constructor(callback: IntersectionObserverCallback) {
				observers.push(callback);
			}
			observe() {}
			disconnect() {}
		},
	);
	play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
	pause = vi
		.spyOn(HTMLMediaElement.prototype, "pause")
		.mockImplementation(() => {});
	Object.defineProperty(document, "hidden", {
		configurable: true,
		value: false,
	});
	container = document.createElement("div");
	document.body.append(container);
	root = createRoot(container);
});
afterEach(async () => {
	await act(() => root.unmount());
	container.remove();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});
async function visibility(index: number, ratio: number) {
	await act(() =>
		observers[index](
			[
				{
					isIntersecting: ratio > 0,
					intersectionRatio: ratio,
				} as IntersectionObserverEntry,
			],
			{} as IntersectionObserver,
		),
	);
}

test("only plays a sufficiently visible Chillz and pauses offscreen", async () => {
	await act(() => root.render(<ChillzPlayer src="/test.mp4" />));
	expect(play).not.toHaveBeenCalled();
	await visibility(0, 0.4);
	expect(play).not.toHaveBeenCalled();
	await visibility(0, 0.8);
	expect(play).toHaveBeenCalledTimes(1);
	pause.mockClear();
	await visibility(0, 0);
	expect(pause).toHaveBeenCalled();
	const video = container.querySelector("video");
	expect(video?.controls).toBe(true);
	expect(video?.loop).toBe(true);
	expect(video?.muted).toBe(true);
});

test("pauses for a dialog and when the browser tab is hidden", async () => {
	await act(() => root.render(<ChillzPlayer src="/test.mp4" />));
	await visibility(0, 1);
	pause.mockClear();
	play.mockClear();
	await act(() => root.render(<ChillzPlayer src="/test.mp4" paused />));
	expect(pause).toHaveBeenCalled();
	expect(play).not.toHaveBeenCalled();
	await act(() => root.render(<ChillzPlayer src="/test.mp4" />));
	expect(play).toHaveBeenCalledTimes(1);
	pause.mockClear();
	Object.defineProperty(document, "hidden", {
		configurable: true,
		value: true,
	});
	await act(() => {
		document.dispatchEvent(new Event("visibilitychange"));
	});
	expect(pause).toHaveBeenCalled();
});

test("keeps manual controls if autoplay is denied and exposes load errors", async () => {
	play.mockRejectedValue(new Error("Autoplay denied"));
	await act(() => root.render(<ChillzPlayer src="/test.mp4" />));
	await visibility(0, 1);
	const video = container.querySelector("video");
	if (!video) throw new Error("Chillz video is missing");
	expect(video.controls).toBe(true);
	await act(() => {
		video.dispatchEvent(new Event("error"));
	});
	expect(container.querySelector('[role="alert"]')?.textContent).toContain(
		"could not be loaded",
	);
});
