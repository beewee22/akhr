<script lang="ts">
	import { browser } from '$app/env';
import { goto } from '$app/navigation';
import { CardPositionStore } from '$lib/store';
	import { globalLoading } from '$lib/store/ui';
	import { CardPositionClass } from '$lib/types';

	export let width = 7500;
	export let height = 7350;
	export let columns = 10;
	export let rows = 7;
	export let src: string;
	export let index = 1;
	let imgElement: HTMLImageElement;
	let isImageLoaded = false;
	let canvas: HTMLCanvasElement;
	let cards: CardPositionClass[] = [];

	$: zeroBasedIndex = index - 1;
	$: maxCardIndex = columns * rows;

	$: cardWidth = width / columns;
	$: cardHeight = height / rows;

	$: {
		index = index < 1 ? 1 : index > maxCardIndex ? maxCardIndex : index;
	}

	$: {
		if (browser) {
			loadImage(src);
		}
	}

	$: {
		if (browser && isImageLoaded) {
			requestAnimationFrame(() => {
				renderCard(zeroBasedIndex);
			});
		}
	}

	$: {
		if (browser && isImageLoaded) {
			cards = getCards();
		}
	}

	const loadImage = (src: string) => {
		const _img = new Image();
		_img.src = src;
		imgElement = _img;
		_img.addEventListener('load', () => {
			calcImageSize(_img);
			isImageLoaded = true;
		});
	};

	const calcImageSize = (_img: HTMLImageElement) => {
		width = _img.width;
		height = _img.height;
		cardWidth = width / columns;
		cardHeight = height / rows;
	};

	const getCards = () => {
		return Array.from({ length: maxCardIndex }, (_, i) => {
      const rowIndex = Math.floor(i / columns);
			const y = rowIndex * cardHeight;
      const columnIndex = Math.floor(i % columns);
			const x = columnIndex * cardWidth;
			return new CardPositionClass(x, y, cardWidth, cardHeight, src, rowIndex, columnIndex);
		});
	};

	const renderCard = (zeroBasedIndex: number) => {
		const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
		const x = Math.floor(zeroBasedIndex % columns) * cardWidth;
		const y = Math.floor(zeroBasedIndex / columns) * cardHeight;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(imgElement, -x, -y);
	};

	const saveImages = () => {
		$globalLoading = true;
    CardPositionStore.addMany(cards);
		$globalLoading = false;
    goto("/card/list")
	};
</script>

<div class="cutterContainer">
	<div class="navBtns">
		<div>
			<button disabled={index < 0} on:click={() => index--}>⬅️</button>
		</div>
		<span>Current Index: <input type="number" bind:value={index} /></span>

		<button disabled={index > maxCardIndex} on:click={() => index++}>➡️</button>
	</div>
	<div>
		<button class="cutBtn" on:click={saveImages}>Cut images</button>
	</div>
	<canvas
		bind:this={canvas}
		width={cardWidth}
		height={cardHeight}
		style="border: 1px solid black"
	/>
</div>

<style lang="scss">
	button {
		cursor: pointer;
	}
	.cutterContainer {
		display: flex;
		flex-direction: column;
		align-items: center;
		row-gap: 0.5rem;
		.navBtns {
			display: flex;
			column-gap: 1rem;
		}
		.cutBtn {
			padding: 0.3rem 0.8rem;
		}
	}
</style>
