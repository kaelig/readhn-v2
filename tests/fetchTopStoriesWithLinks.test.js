import { assertEquals } from "https://deno.land/std@0.147.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.147.0/testing/bdd.ts";
import {
	fetchTopStoriesWithLinks,
	defaultStoryCount,
} from "../netlify/edge-functions/stories.ts";

describe("fetchTopStoriesWithLinks", () => {
	it("Fetches top stories with links", () => {
		return fetchTopStoriesWithLinks().then((stories) => {
			assertEquals(stories.length, defaultStoryCount);
		});
	});

	it("Fetches only a few stories when needed", () => {
		return fetchTopStoriesWithLinks(3).then((stories) => {
			assertEquals(stories.length, 3);
		});
	});
});
