import { builder, Handler } from "@netlify/functions";

import type { Story } from "../../stories";
import { fetchTopStoriesWithLinks, defaultStoryCount } from "../../stories";

const main: Handler = async () => {
	const stories = await fetchTopStoriesWithLinks(defaultStoryCount);

	const body = /* HTML */ `<!DOCTYPE html>
		<html lang="en">
			<head>
				<meta charset="utf-8" />
				<title>Hacker News Top Stories</title>
				<meta name="viewport" content="initial-scale=1" />
				<meta
					name="description"
					content="A simple and fast Hacker News Top Stories reader – using Instapaper"
				/>
				<link rel="icon" href="/favicon.png" type="image/png" />
				<meta name="apple-mobile-web-app-title" content="Hacker News" />
				<link rel="preconnect" href="https://news.ycombinator.com" />
				<link rel="preconnect" href="https://www.instapaper.com" />
				<link
					rel="preconnect"
					href="https://staticinstapaper.s3.amazonaws.com"
				/>
				<link rel="preconnect" href="https://use.typekit.net" />
				<script src="/app.js" defer></script>
				<link rel="stylesheet" href="/styles.css" />
			</head>
			<body>
				<h1 class="page-title" id="top-stories">Hacker News Top Stories</h1>
				<nav class="main-navigation">
					<ul class="u-list-inline u-list-reset">
						<li>
							<a
								class="u-color-light"
								href="https://hn.algolia.com"
								accesskey="s"
								>Search</a
							>
						</li>
						<li><a class="u-color-light" href="/">Refresh</a></li>
						<li>
							<a class="u-color-light" href="https://news.ycombinator.com/"
								>Hacker News</a
							>
						</li>
					</ul>
				</nav>
				<main>
					<section
						class="js-top-stories top-stories"
						aria-labelledby="top-stories"
					>
						${stories
							.map(
								(story: Story) => /* HTML */ `<article
									class="js-story story u-faux-block-link"
									id="story-${story.id}"
									data-story-id="${story.id}"
								>
									<a
										class="js-story__action story__action u-faux-block-link__overlay"
										href="${story.instapaperUrl}"
										tabindex="-1"
										rel="noopener noreferrer"
										><span class="u-assistive-text">${story.title}</span></a
									>
									<h2 class="story__title">
										<a
											class="story__title u-link-no-underline"
											href="${story.instapaperUrl}"
											tabindex="0"
											rel="noopener noreferrer"
											>${story.title}</a
										>
									</h2>
									<div class="story__meta">
										<a
											class="js-original-url u-faux-block-link__promote u-color-light u-link-no-underline u-link-underline-hover"
											href="${story.url}"
											rel="noopener noreferrer"
											><span class="u-assistive-text"
												>Read original story on </span
											>${story.hostname}</a
										>
										– ${story.by} –
										<a
											class="u-faux-block-link__promote u-color-light u-link-no-underline u-link-underline-hover"
											href="${story.url}"
											rel="noopener noreferrer"
											>${story.relativeTime}</a
										>
									</div>
								</article>`
							)
							.join("")}
					</section>
				</main>
				<footer class="page-footer u-color-light">
					<p>
						<a
							href="https://github.com/kaelig/readhn/blob/master/README.md#why-do-stories-open-in-instapaper"
							rel="noopener noreferrer"
							>Why do I need an Instapaper account?</a
						>
					</p>
					<div class="u-hide-on-small-screens">
						<h1 class="heading-primary">Keyboard navigation</h1>
						<dl class="keyboard-shortcuts">
							<dt class="keyboard-shortcuts__shortcut">
								<kbd class="kbd">↓</kbd> <kbd class="kbd">↑</kbd>
							</dt>
							<dd class="keyboard-shortcuts__description">
								Next / Previous story
							</dd>
							<dt class="keyboard-shortcuts__shortcut">
								<kbd class="kbd">⏎</kbd>
							</dt>
							<dd class="keyboard-shortcuts__description">
								Read story on Instapaper
							</dd>
							<dt class="keyboard-shortcuts__shortcut">
								<kbd class="kbd">alt</kbd> <span>+</span>
								<kbd class="kbd">⏎</kbd>
							</dt>
							<dd class="keyboard-shortcuts__description">
								Read story on original site
							</dd>
							<dt class="keyboard-shortcuts__shortcut">
								<kbd class="kbd">C</kbd>
							</dt>
							<dd class="keyboard-shortcuts__description">Go to comments</dd>
						</dl>
					</div>
					<p>
						<a href="https://github.com/kaelig/readhn">Contribute on GitHub</a>
						—
						<a href="https://github.com/kaelig/readhn/issues"
							>Report an issue</a
						>
					</p>
				</footer>
			</body>
		</html>`;

	return {
		statusCode: 200,
		headers: {
			"Content-Type": "text/html",
		},
		ttl: 60 * 5,
		body,
	};
};

const handler = builder(main);
export { handler };
