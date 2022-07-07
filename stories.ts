import fetch from "node-fetch";

export const defaultStoryCount = 25;

function capitalizeFirstLetter(word: string) {
	return word.charAt(0).toUpperCase() + word.slice(1);
}

// Naïve titlecase, improves scanability
function startCase(sentence: string) {
	return sentence.split(" ").map(capitalizeFirstLetter).join(" ");
}

function fetchStory(id: number) {
	return fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(
		(data) => data.json()
	);
}

function fetchTopStoryIds(numberOfStories: number): Promise<number[]> {
	return fetch("https://hacker-news.firebaseio.com/v0/topstories.json")
		.then((data) => data.json())
		.then((topStories) => topStories.slice(0, numberOfStories));
}

// On Hacker News, some stories are comment threads
// and other stories are external "actual" stories
function isActualStory(story: Story) {
	return !!story.url;
}

function isExcludedFromInstapaper(url: string) {
	return ["https://www.bloomberg.com"].some((domain) => url.startsWith(domain));
}

const units: { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
	{ unit: "year", ms: 31536000000 },
	{ unit: "month", ms: 2628000000 },
	{ unit: "day", ms: 86400000 },
	{ unit: "hour", ms: 3600000 },
	{ unit: "minute", ms: 60000 },
	{ unit: "second", ms: 1000 },
];
const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/**
 * Get language-sensitive relative time message from Dates.
 * @param relative  - the relative dateTime, generally is in the past or future
 * @param pivot     - the dateTime of reference, generally is the current time
 */
export function relativeTimeFromDates(
	relative: Date | null,
	pivot: Date = new Date()
): string {
	if (!relative) return "";
	const elapsed = relative.getTime() - pivot.getTime();
	return relativeTimeFromElapsed(elapsed);
}

/**
 * Get language-sensitive relative time message from elapsed time.
 * @param elapsed   - the elapsed time in milliseconds
 */
export function relativeTimeFromElapsed(elapsed: number): string {
	for (const { unit, ms } of units) {
		if (Math.abs(elapsed) >= ms || unit === "second") {
			return rtf.format(Math.round(elapsed / ms), unit);
		}
	}
	return "";
}

interface HnStory {
	id: number;
	title: string;
	time: number;
	url: string;
	by: string;
}

export interface Story {
	id: number;
	title: string;
	relativeTime: string;
	url: string;
	by: string;
	hostname: string;
	instapaperUrl: string;
}

function buildStoriesObject({ id, title, time, url, by }: HnStory): Story {
	return {
		id,
		title: startCase(title),
		relativeTime: relativeTimeFromElapsed(time),
		url,
		by,
		hostname: new URL(url).hostname,
		instapaperUrl: isExcludedFromInstapaper(url)
			? url
			: `https://www.instapaper.com/text?u=${encodeURIComponent(url)}`,
	};
}

export async function fetchTopStoriesWithLinks(
	numberOfStories: number = defaultStoryCount
): Promise<Story[]> {
	const topStoryIds = await fetchTopStoryIds(numberOfStories + 20);
	const topStories = await Promise.all(topStoryIds.map(fetchStory));
	const stories = topStories
		.filter(isActualStory)
		.slice(0, numberOfStories)
		.map(buildStoriesObject);

	return stories;
}

export default {};
