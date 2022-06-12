<script lang="ts">
	import { browser } from '$app/env';

	export let width = 7500;
	export let height = 7350;
	export let columns = 10;
	export let rows = 7;
	export let src: string;
	export let index = 1;
	let imgElement: HTMLImageElement;
  let isImageLoaded = false;

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
      })
		}
	}

	const loadImage = (src: string) => {
		const _img = new Image();
		_img.src = src;
		imgElement = _img;
    _img.addEventListener('load', () => {
      calcImageSize(_img)
      isImageLoaded = true;
    });
	};

	const calcImageSize = (_img: HTMLImageElement) => {
		width = _img.width;
		height = _img.height;
		cardWidth = width / columns;
		cardHeight = height / rows;
	};

	const renderCard = (zeroBasedIndex: number) => {
		const canvas: HTMLCanvasElement = document.querySelector('canvas') as HTMLCanvasElement;
		const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
		const x = Math.floor(zeroBasedIndex % columns) * cardWidth;
		const y = Math.floor(zeroBasedIndex / columns) * cardHeight;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(imgElement, -x, -y);
	};
</script>

<div style="display:flex; flex-direction: column; align-items: center;">
	<span>Current Index: <input type="number" bind:value={index}></span>
	<div style="display:flex; flex-direction: row">
		<button disabled={index < 0} on:click={() => (index--)}>⬅️</button>
		<button disabled={index > maxCardIndex} on:click={() => (index++)}>➡️</button
		>
	</div>
	<canvas width={cardWidth} height={cardHeight} style="border: 1px solid black" />
</div>
