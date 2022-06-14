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

	interface Hole {
		x: number;
		y: number;
		radius: number;
	}

	interface ImageFilter {
		sapia: number;
		saturate: number;
	}

	interface BlankImage {
		src: string;
		adjustWidth: number;
		adjustHeight: number;
		offsetX: number;
		offsetY: number;
		rotate: number;
		hole: Hole | null;
		filter: ImageFilter | null;
	}

	interface Card {
		offsetX: number;
		offsetY: number;

		isDisplaySubTitle: boolean;
		subTitle: BlankImage;

		isDisplayHoleBoundary: boolean;
		
		isDisplayTitle: boolean;
		title: BlankImage;

		isDisplayDialog: boolean;
		dialog: BlankImage;
	}

	let currentCard: Card = {
		offsetX: 0,
		offsetY: 0,
		
		isDisplayHoleBoundary: false,

		isDisplaySubTitle: false,
		subTitle: {
			src: '/resources/blank_cards/blank_subtitle_1.png',
			adjustWidth: 4,
			adjustHeight: 20,
			offsetX: 0,
			offsetY: 6.4,
			rotate: 0,
			hole: null,
			filter: {
				sapia: 0,
				saturate: 100,
			}
		},

		isDisplayTitle: false,
		title: {
			src: '/resources/blank_cards/blank_title_1.png',
			adjustWidth: 68,
			adjustHeight: 67,
			offsetX: 0,
			offsetY: 39.6,
			rotate: 0,
			filter: {
				sapia: 0,
				saturate: 100,
			},
			hole: {
				x: 107,
				y: 105,
				radius: 60,
			}
		},

		isDisplayDialog: false,
		dialog: {
			src: '/resources/blank_cards/blank_dialog_1.png',
			adjustWidth: 67,
			adjustHeight: 86,
			offsetX: 0,
			offsetY: 41,
			rotate: 0,
			filter: {
				sapia: 0,
				saturate: 100,
			},
			hole: {
				x: 698,
				y: 991,
				radius: 50,
			}
		}
	}

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
			requestAnimationFrame(async () => {
				const context = canvas.getContext('2d') as CanvasRenderingContext2D;
				const shadowCanvas = document.createElement('canvas');
				shadowCanvas.width = cardWidth;
				shadowCanvas.height = cardHeight;
				const shadowContext = shadowCanvas.getContext('2d') as CanvasRenderingContext2D;

				renderCard(
					shadowContext,
					zeroBasedIndex,
					currentCard.offsetX,
					currentCard.offsetY
				);

				currentCard.isDisplaySubTitle && renderBlankImage(
					context, currentCard.subTitle, currentCard.isDisplayHoleBoundary
				);

				currentCard.isDisplayTitle && renderBlankImage(
					context, currentCard.title, currentCard.isDisplayHoleBoundary
				);

				currentCard.isDisplayDialog && renderBlankImage(
					context, currentCard.dialog, currentCard.isDisplayHoleBoundary
				);

				context.clearRect(0, 0, canvas.width, canvas.height);
				context.drawImage(shadowCanvas, 0, 0);
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

	const renderCard = (
		context: CanvasRenderingContext2D,
		zeroBasedIndex: number,
		offsetX: number,
		offsetY: number,
		) => {
		const x = Math.floor(zeroBasedIndex % columns) * cardWidth;
		const y = Math.floor(zeroBasedIndex / columns) * cardHeight;
		context.drawImage(
			imgElement,
			offsetX-x,
			-y-offsetY
		);
	};

	const renderBlankImage = async (
		context: CanvasRenderingContext2D,
		image: BlankImage,
		isDisplayHoleBoundary: boolean
	) => {
		const imageElement = await promiseLoadImage(image.src);
		const _canvas = document.createElement('canvas');
		const _context = _canvas.getContext('2d') as CanvasRenderingContext2D;

		_canvas.width = imageElement.width;
		_canvas.height = imageElement.height;
		image.filter && (
			_context.filter = `sapia(${image.filter.sapia}) saturate(${image.filter.saturate})`
		);
		_context.drawImage(imageElement, 
			0, 0, imageElement.width, imageElement.height,
			0, 0, _canvas.width, _canvas.height);

		if (image.hole) {
			removeCircle(
				_context,
				image.hole.x,
				image.hole.y,
				image.hole.radius,
				isDisplayHoleBoundary
			);
		}

		drawRotatedImage(
			context,
			_canvas,
			image.offsetX-(image.adjustWidth/2), -image.offsetY,
			canvas.width+image.adjustWidth, canvas.height+image.adjustHeight,
			image.rotate
		);
	}

	const drawRotatedImage = (
		context: CanvasRenderingContext2D,
		image: HTMLCanvasElement,
		x: number,
		y: number,
		dw: number,
		dh: number,
		rotate: number
	) => {
		context.rotate(rotate * Math.PI / 180);
		context.drawImage(image, x, y, dw, dh);
		context.setTransform(1, 0, 0, 1, 0, 0);
	}

	const removeCircle = (
		context: CanvasRenderingContext2D,
		x: number,
		y: number,
		radius: number,
		isDisplayBoundary = false
	) => {
		if (isDisplayBoundary) {
			context.strokeStyle = '#ff0000';
			context.beginPath();
			context.arc(x, y, radius+1, 0, 2 * Math.PI, false);	
			context.stroke();
		}

		context.save();
		context.filter = "bluer(5px)";
		context.globalCompositeOperation = 'destination-out';
		context.beginPath();
		context.arc(x, y, radius, 0, 2 * Math.PI, false);
		context.fill();
		context.restore();
		context.filter = "";
	}

	const promiseLoadImage = (url: string) => new Promise<HTMLImageElement>((resolve, reject) => {
		const image = new Image();
		image.addEventListener('load', () => resolve(image));
		image.addEventListener('error', () => reject(image));
		image.src = url;
	});

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
	<div class="cutter">
		<canvas
			bind:this={canvas}
			width={cardWidth}
			height={cardHeight}
			style="border: 1px solid black"
		/>
		<div class="control">
			<h3>
				Source Adjustment
			</h3>
			<div>
				<input id="sourceOffsetX" type="number" bind:value={currentCard.offsetX} step="0.1"/>
				<label for="sourceOffsetX">Source offset X</label>
			</div>
			<div>
				<input id="sourceOffsetX" type="number" bind:value={currentCard.offsetY} step="0.1"/>
				<label for="sourceOffsetX">Source offset Y</label>
			</div>
			<br/>
			<h3>
				Blank Title Adjustment
			</h3>
			<div>
				<input id="displayBlankTitle" type="checkbox" bind:checked={currentCard.isDisplayTitle} />
				<label for="displayBlankTitle">Display Blank Title</label>
			</div>
			<div>
				<input id="blankTitleAdjustWidth" type="number" bind:value={currentCard.title.adjustWidth}/>
				<label for="blankTitleAdjustWidth">width adjustment</label>
			</div>
			<div>
				<input id="blankTitleAdjustHeight" type="number" bind:value={currentCard.title.adjustHeight}/>
				<label for="blankTitleAdjustHeight">height adjustment</label>
			</div>
			<div>
				<input id="blankTitleAdjustOffsetX" type="number" bind:value={currentCard.title.offsetX} step="0.1"/>
				<label for="blankTitleAdjustOffsetX">offset X</label>
			</div>
			<div>
				<input id="blankTitleAdjustOffsetY" type="number" bind:value={currentCard.title.offsetY} step="0.1"/>
				<label for="blankTitleAdjustOffsetY">offset Y</label>
			</div>
			<div>
				<input id="blankTitleAdjustRotate" type="number" bind:value={currentCard.title.rotate} step="0.1"/>
				<label for="blankTitleAdjustRotate">rotate</label>
			</div>
			{#if currentCard.title.filter}
			<div>
				<input id="blankTitleFilterSapia" type="number" bind:value={currentCard.title.filter.sapia}/>
				<label for="blankTitleFilterSapia">filter sapia</label>
			</div>
			<div>
				<input id="blankTitleFilterSaturate" type="number" bind:value={currentCard.title.filter.saturate}/>
				<label for="blankTitleFilterSaturate">filter saturate</label>
			</div>
			{/if}
			<div>
				<input id="blankTitleHolePunchingPreview" type="checkbox" bind:checked={currentCard.isDisplayHoleBoundary} />
				<label for="blankTitleHolePunchingPreview">Preview Blank Title Hole Punching</label>
			</div>
			{#if currentCard.title.hole}
			<div>
				<input id="blankTitleHolePunchingX" type="number" bind:value={currentCard.title.hole.x} step="0.1"/>
				<label for="blankTitleHolePunchingX">hole punching X</label>
			</div>
			<div>
				<input id="blankTitleHolePunchingY" type="number" bind:value={currentCard.title.hole.y} step="0.1"/>
				<label for="blankTitleHolePunchingY">hole punching Y</label>
			</div>
			<div>
				<input id="blankTitleHolePunchingRadius" type="number" bind:value={currentCard.title.hole.radius}/>
				<label for="blankTitleHolePunchingRadius">hole punching radius</label>
			</div>
			{/if}
			<br/>
			<h3>
				Blank Sub Title Adjustment
			</h3>
			<div>
				<input id="displayBlankSubTitle" type="checkbox" bind:checked={currentCard.isDisplaySubTitle} />
				<label for="displayBlankSubTitle">Display Blank Sub Title</label>
			</div>
			<div>
				<input id="blankSubTitleAdjustWidth" type="number" bind:value={currentCard.subTitle.adjustWidth}/>
				<label for="blankSubTitleAdjustWidth">width adjustment</label>
			</div>
			<div>
				<input id="blankSubTitleAdjustHeight" type="number" bind:value={currentCard.subTitle.adjustHeight}/>
				<label for="blankSubTitleAdjustHeight">height adjustment</label>
			</div>
			<div>
				<input id="blankSubTitleAdjustOffsetX" type="number" bind:value={currentCard.subTitle.offsetX} step="0.1"/>
				<label for="blankSubTitleAdjustOffsetX">offset X</label>
			</div>
			<div>
				<input id="blankSubTitleAdjustOffsetY" type="number" bind:value={currentCard.subTitle.offsetY} step="0.1"/>
				<label for="blankSubTitleAdjustOffsetY">offset Y</label>
			</div>
			<div>
				<input id="blankSubTitleAdjustRotate" type="number" bind:value={currentCard.subTitle.rotate} step="0.1"/>
				<label for="blankSubTitleAdjustRotate">rotate</label>
			</div>
			<br/>
			<h3>
				Blank Dialog Adjustment
			</h3>
			<div>
				<input id="displayBlankDialog" type="checkbox" bind:checked={currentCard.isDisplayDialog}/>
				<label for="displayBlankDialog">Display blank dialog</label>
			</div>
			<div>
				<input id="blankDialogAdjustWidth" type="number" bind:value={currentCard.dialog.adjustWidth}/>
				<label for="blankDialogAdjustWidth">Dialog width adjustment</label>
			</div>
			<div>
				<input id="blankDialogAdjustHeight" type="number" bind:value={currentCard.dialog.adjustHeight} step="0.1"/>
				<label for="blankDialogAdjustHeight">Dialog height adjustment</label>
			</div>
			<div>
				<input id="blankDialogAdjustOffsetX" type="number" bind:value={currentCard.dialog.offsetX} step="0.1"/>
				<label for="blankDialogAdjustOffsetX">Dialog offset X</label>
			</div>
			<div>
				<input id="blankDialogAdjustOffsetY" type="number" bind:value={currentCard.dialog.offsetY}/>
				<label for="blankDialogAdjustOffsetY">Dialog offset Y</label>
			</div>
			<div>
				<input id="blankDialogAdjustRotate" type="number" bind:value={currentCard.dialog.rotate} step="0.1"/>
				<label for="blankDialogAdjustRotate">Dialog rotate</label>
			</div>
			{#if currentCard.dialog.filter}
			<div>
				<input id="blankDialogFilterSapia" type="number" bind:value={currentCard.dialog.filter.sapia}/>
				<label for="blankDialogFilterSapia">Dialog filter sapia</label>
			</div>
			<div>
				<input id="blankDialogFilterSaturate" type="number" bind:value={currentCard.dialog.filter.saturate}/>
				<label for="blankDialogFilterSaturate">Dialog filter saturate</label>
			</div>
			{/if}
			<br/>
			<div>
				<input id="blankDialogHolePunchingPreview" type="checkbox" bind:checked={currentCard.isDisplayHoleBoundary} />
				<label for="blankDialogHolePunchingPreview">Preview Blank Dialog Hole Punching</label>
			</div>
			{#if currentCard.dialog.hole}
			<div>
				<input id="blankDialogHolePunchingX" type="number" bind:value={currentCard.dialog.hole.x} step="0.1"/>
				<label for="blankDialogHolePunchingX">Dialog hole punching X</label>
			</div>
			<div>
				<input id="blankDialogHolePunchingY" type="number" bind:value={currentCard.dialog.hole.y} step="0.1"/>
				<label for="blankDialogHolePunchingY">Dialog hole punching Y</label>
			</div>
			<div>
				<input id="blankDialogHolePunchingRadius" type="number" bind:value={currentCard.dialog.hole.radius} step="0.1"/>
				<label for="blankDialogHolePunchingRadius">Dialog hole punching radius</label>
			</div>
			{/if}
		</div>
	</div>
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

		.cutter {
			display: flex;
			flex-direction: row;

			.control {
				display: flex;
				flex-direction: column;
			}
		}
		.navBtns {
			display: flex;
			column-gap: 1rem;
		}
		.cutBtn {
			padding: 0.3rem 0.8rem;
		}
	}
</style>
