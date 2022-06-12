<script lang="ts">
	import { browser } from '$app/env';
	import { CardPositionStore } from '$lib/store';
	import type { CardPositionClass } from '$lib/types';
	import { onMount } from 'svelte';

	let cardCanvas: HTMLCanvasElement[] = [];
	let originImages: { [src: string]: HTMLImageElement } = {};
	let isImageLoaded: Promise<void>[] = [];
	let cards: CardPositionClass[] = [];

	$: {
		if (browser) {
			// load images
			const imageSrcs = new Set<string>();
			cards.forEach((card) => {
				imageSrcs.add(card.originSrc);
			});

			imageSrcs.forEach((src) => {
				const img = new Image();
				img.src = src;
				originImages[src] = img;
				isImageLoaded = [
					...isImageLoaded,
					new Promise((resolve) => {
						img.addEventListener('load', () => {
							resolve();
						});
					})
				];
			});
		}
	}

	$: {
		// load canvas
		if (isImageLoaded.length > 0) {
			Promise.all(isImageLoaded).then(() => {
				cardCanvas.forEach((el, i) => {
					const ctx = el.getContext('2d');
					const card = cards[i];
					ctx?.drawImage(originImages[card.originSrc], card.x * -1, card.y * -1);
				});
			});
		}
	}
	onMount(() => {
		cards = CardPositionStore.getAll();
	});
</script>

<div>
	{#each cards as card, i}
		<canvas
			bind:this={cardCanvas[i]}
			class="card"
			width={card.width}
			height={card.height}
      style="width: 10vw;"
		/>
	{/each}
</div>
