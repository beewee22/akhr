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
	let adjustSourceOffsetX = 0;
	let adjustSourceOffsetY = 0;
	let isDisplayBlankTitle = false;
	let isDisplayBlankSubTitle = false;
	let isBlankTitleHolePunchingPreview = false;
	let blankTitleHolePunchingX = 107;
	let blankTitleHolePunchingY = 105;
	let blankTitleHolePunchingRadius = 56;
	let isBlankDialogHolePunchingPreview = false;
	let blankDialogHolePunchingX = 698;
	let blankDialogHolePunchingY = 991;
	let blankDialogHolePunchingRadius = 48;
	let adjustBlankTitleWidth = 68;
	let adjustBlankTitleHeight = 67;
	let adjustBlankTitleOffsetX = -33;
	let adjustBlankTitleOffsetY = 39.2;
	let adjustBlankSubTitleWidth = 2;
	let adjustBlankSubTitleHeight = 20;
	let adjustBlankSubTitleOffsetX = -1;
	let adjustBlankSubTitleOffsetY = 8;
	let adjustBlankTitleFilterSapia = -1;
	let adjustBlankTitleFilterSaturate = 100;
	let isDisplayBlankDialog = false;
	let adjustBlankDialogWidth = 67;
	let adjustBlankDialogHeight = 86;
	let adjustBlankDialogOffsetX = 0;
	let adjustBlankDialogOffsetY = 41;
	let adjustBlankDialogFilterSapia = 0;
	let adjustBlankDialogFilterSaturate = 100;

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
					adjustSourceOffsetX,
					adjustSourceOffsetY
				);

				isDisplayBlankSubTitle && (await renderBlankSubtitle(
					shadowContext,
					adjustBlankSubTitleWidth,
					adjustBlankSubTitleHeight,
					adjustBlankSubTitleOffsetX,
					adjustBlankSubTitleOffsetY
				));

				isDisplayBlankTitle && (await renderBlankTitle(
					shadowContext,
					adjustBlankTitleWidth,
					adjustBlankTitleHeight,
					adjustBlankTitleOffsetX,
					adjustBlankTitleOffsetY,
					isBlankTitleHolePunchingPreview,
					blankTitleHolePunchingX,
					blankTitleHolePunchingY,
					blankTitleHolePunchingRadius,
					adjustBlankTitleFilterSapia,
					adjustBlankTitleFilterSaturate
				));

				isDisplayBlankDialog && (await renderBlankdialog(
					shadowContext,
					isBlankDialogHolePunchingPreview,
					blankDialogHolePunchingX,
					blankDialogHolePunchingY,
					blankDialogHolePunchingRadius,
					adjustBlankDialogWidth,
					adjustBlankDialogHeight,
					adjustBlankDialogOffsetX,
					adjustBlankDialogOffsetY,
					adjustBlankDialogFilterSapia,
					adjustBlankDialogFilterSaturate,
				));

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
		adjustSourceOffsetX: number,
		adjustSourceOffsetY: number,
		) => {
		const x = Math.floor(zeroBasedIndex % columns) * cardWidth;
		const y = Math.floor(zeroBasedIndex / columns) * cardHeight;
		context.drawImage(
			imgElement,
			adjustSourceOffsetX-x,
			-y-adjustSourceOffsetY
		);
	};

	const renderBlankSubtitle = async (
		context: CanvasRenderingContext2D,
		adjustBlankSubTitleWidth: number,
		adjustBlankSubTitleHeight: number,
		adjustBlankSubTitleOffsetX: number,
		adjustBlankSubTitleOffsetY: number
	) => {
		const blankSubTitleImage = await promiseLoadImage('/resources/blank_cards/blank_subtitle_1.png');
		const subTitleCanvas = document.createElement('canvas');
		const subTitleContext = subTitleCanvas.getContext('2d') as CanvasRenderingContext2D;

		subTitleCanvas.width = blankSubTitleImage.width;
		subTitleCanvas.height = blankSubTitleImage.height;
		subTitleContext.filter =`saturate(${adjustBlankTitleFilterSaturate}%) sepia(${adjustBlankTitleFilterSapia}%)`;
		subTitleContext.drawImage(
			blankSubTitleImage, 
			0, 0, blankSubTitleImage.width, blankSubTitleImage.height,
			0, 0, subTitleCanvas.width, subTitleCanvas.height
		);

		context.drawImage(
			subTitleCanvas,
			adjustBlankSubTitleOffsetX, -adjustBlankSubTitleOffsetY,
			canvas.width+adjustBlankSubTitleWidth, canvas.height+adjustBlankSubTitleHeight
		);
	}

	const renderBlankTitle = async (
		context: CanvasRenderingContext2D,
		adjustBlankTitleWidth: number,
		adjustBlankTitleHeight: number,
		adjustBlankTitleOffsetX: number,
		adjustBlankTitleOffsetY: number,
		isBlankTitleHolePunchingPreview: boolean,
		blankTitleHolePunchingX: number,
		blankTitleHolePunchingY: number,
		blankTitleHolePunchingRadius: number,
		adjustBlankTitleFilterSapia: number,
		adjustBlankTitleFilterSaturate: number
	) => {
		const blankTitleImage = await promiseLoadImage('/resources/blank_cards/blank_title_1.png');
		const titleCanvas = document.createElement('canvas');
		const titleContext = titleCanvas.getContext('2d') as CanvasRenderingContext2D;

		titleCanvas.width = blankTitleImage.width;
		titleCanvas.height = blankTitleImage.height;
		titleContext.filter =`saturate(${adjustBlankTitleFilterSaturate}%) sepia(${adjustBlankTitleFilterSapia}%)`;
		titleContext.drawImage(
			blankTitleImage, 
			0, 0, blankTitleImage.width, blankTitleImage.height,
			0, 0, titleCanvas.width, titleCanvas.height
		);
		removeCircle(
			titleContext,
			blankTitleHolePunchingX,
			blankTitleHolePunchingY,
			blankTitleHolePunchingRadius,
			isBlankTitleHolePunchingPreview
		);

		context.drawImage(
			titleCanvas,
			adjustBlankTitleOffsetX, -adjustBlankTitleOffsetY,
			canvas.width+adjustBlankTitleWidth, canvas.height+adjustBlankTitleHeight
		);
	}

	const renderBlankdialog = async (
		context: CanvasRenderingContext2D,
		isBlankDialogHolePunchingPreview: boolean,
		blankDialogHolePunchingX: number,
		blankDialogHolePunchingY: number,
		blankDialogHolePunchingRadius: number,
		adjustBlankDialogWidth: number,
		adjustBlankDialogHeight: number,
		adjustBlankDialogOffsetX: number,
		adjustBlankDialogOffsetY: number,
		adjustBlankDialogFilterSapia: number,
		adjustBlankDialogFilterSaturate: number,
	) => {
		const blankDialogImage = await promiseLoadImage('/resources/blank_cards/blank_dialog_1.png');
		const dialogCanvas = document.createElement('canvas');
		const dialogContext = dialogCanvas.getContext('2d') as CanvasRenderingContext2D;

		dialogCanvas.width = blankDialogImage.width;
		dialogCanvas.height = blankDialogImage.height;
		dialogContext.filter =`saturate(${adjustBlankDialogFilterSaturate}%) sepia(${adjustBlankDialogFilterSapia}%)`;
		dialogContext.drawImage(
			blankDialogImage, 
			0, 0, blankDialogImage.width, blankDialogImage.height,
			0, 0, dialogCanvas.width, dialogCanvas.height
		);

		removeCircle(
			dialogContext,
			blankDialogHolePunchingX,
			blankDialogHolePunchingY,
			blankDialogHolePunchingRadius,
			isBlankDialogHolePunchingPreview
		);

		context.drawImage(
			dialogCanvas, 
			adjustBlankDialogOffsetX-(adjustBlankDialogWidth/2), -adjustBlankDialogOffsetY, 
			canvas.width+adjustBlankDialogWidth, canvas.height+adjustBlankDialogHeight
		);
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
				<input id="sourceOffsetX" type="number" bind:value={adjustSourceOffsetX} />
				<label for="sourceOffsetX">Source offset X</label>
			</div>
			<div>
				<input id="sourceOffsetX" type="number" bind:value={adjustSourceOffsetY} />
				<label for="sourceOffsetX">Source offset Y</label>
			</div>
			<br/>
			<h3>
				Blank Title Adjustment
			</h3>
			<div>
				<input id="displayBlankTitle" type="checkbox" bind:checked={isDisplayBlankTitle} />
				<label for="displayBlankTitle">Display Blank Title</label>
			</div>
			<div>
				<input id="blankTitleAdjustWidth" type="number" bind:value={adjustBlankTitleWidth}/>
				<label for="blankTitleAdjustWidth">width adjustment</label>
			</div>
			<div>
				<input id="blankTitleAdjustHeight" type="number" bind:value={adjustBlankTitleHeight}/>
				<label for="blankTitleAdjustHeight">height adjustment</label>
			</div>
			<div>
				<input id="blankTitleAdjustOffsetX" type="number" bind:value={adjustBlankTitleOffsetX}/>
				<label for="blankTitleAdjustOffsetX">offset X</label>
			</div>
			<div>
				<input id="blankTitleAdjustOffsetY" type="number" bind:value={adjustBlankTitleOffsetY}/>
				<label for="blankTitleAdjustOffsetY">offset Y</label>
			</div>
			<div>
				<input id="blankTitleFilterSapia" type="number" bind:value={adjustBlankTitleFilterSapia}/>
				<label for="blankTitleFilterSapia">filter sapia</label>
			</div>
			<div>
				<input id="blankTitleFilterSaturate" type="number" bind:value={adjustBlankTitleFilterSaturate}/>
				<label for="blankTitleFilterSaturate">filter saturate</label>
			</div>
			<div>
				<input id="blankTitleHolePunchingPreview" type="checkbox" bind:checked={isBlankTitleHolePunchingPreview} />
				<label for="blankTitleHolePunchingPreview">Preview Blank Title Hole Punching</label>
			</div>
			<div>
				<input id="blankTitleHolePunchingX" type="number" bind:value={blankTitleHolePunchingX}/>
				<label for="blankTitleHolePunchingX">hole punching X</label>
			</div>
			<div>
				<input id="blankTitleHolePunchingY" type="number" bind:value={blankTitleHolePunchingY}/>
				<label for="blankTitleHolePunchingY">hole punching Y</label>
			</div>
			<div>
				<input id="blankTitleHolePunchingRadius" type="number" bind:value={blankTitleHolePunchingRadius}/>
				<label for="blankTitleHolePunchingRadius">hole punching radius</label>
			</div>
			<br/>
			<h3>
				Blank Sub Title Adjustment
			</h3>
			<div>
				<input id="displayBlankTitle" type="checkbox" bind:checked={isDisplayBlankSubTitle} />
				<label for="displayBlankTitle">Display Blank Sub Title</label>
			</div>
			<div>
				<input id="blankTitleAdjustWidth" type="number" bind:value={adjustBlankSubTitleWidth}/>
				<label for="blankTitleAdjustWidth">width adjustment</label>
			</div>
			<div>
				<input id="blankTitleAdjustHeight" type="number" bind:value={adjustBlankSubTitleHeight}/>
				<label for="blankTitleAdjustHeight">height adjustment</label>
			</div>
			<div>
				<input id="blankTitleAdjustOffsetX" type="number" bind:value={adjustBlankSubTitleOffsetX}/>
				<label for="blankTitleAdjustOffsetX">offset X</label>
			</div>
			<div>
				<input id="blankTitleAdjustOffsetY" type="number" bind:value={adjustBlankSubTitleOffsetY}/>
				<label for="blankTitleAdjustOffsetY">offset Y</label>
			</div>
			<br/>
			<h3>
				Blank Dialog Adjustment
			</h3>
			<div>
				<input id="displayBlankDialog" type="checkbox" bind:checked={isDisplayBlankDialog}/>
				<label for="displayBlankDialog">Display blank dialog</label>
			</div>
			<div>
				<input id="blankDialogAdjustWidth" type="number" bind:value={adjustBlankDialogWidth}/>
				<label for="blankDialogAdjustWidth">Dialog width adjustment</label>
			</div>
			<div>
				<input id="blankDialogAdjustHeight" type="number" bind:value={adjustBlankDialogHeight}/>
				<label for="blankDialogAdjustHeight">Dialog height adjustment</label>
			</div>
			<div>
				<input id="blankDialogAdjustOffsetX" type="number" bind:value={adjustBlankDialogOffsetX}/>
				<label for="blankDialogAdjustOffsetX">Dialog offset X</label>
			</div>
			<div>
				<input id="blankDialogAdjustOffsetY" type="number" bind:value={adjustBlankDialogOffsetY}/>
				<label for="blankDialogAdjustOffsetY">Dialog offset Y</label>
			</div>
			<div>
				<input id="blankDialogFilterSapia" type="number" bind:value={adjustBlankDialogFilterSapia}/>
				<label for="blankDialogFilterSapia">Dialog filter sapia</label>
			</div>
			<div>
				<input id="blankDialogFilterSaturate" type="number" bind:value={adjustBlankDialogFilterSaturate}/>
				<label for="blankDialogFilterSaturate">Dialog filter saturate</label>
			</div>
			<br/>
			<div>
				<input id="blankDialogHolePunchingPreview" type="checkbox" bind:checked={isBlankDialogHolePunchingPreview} />
				<label for="blankDialogHolePunchingPreview">Preview Blank Dialog Hole Punching</label>
			</div>
			<div>
				<input id="blankDialogHolePunchingX" type="number" bind:value={blankDialogHolePunchingX}/>
				<label for="blankDialogHolePunchingX">Dialog hole punching X</label>
			</div>
			<div>
				<input id="blankDialogHolePunchingY" type="number" bind:value={blankDialogHolePunchingY}/>
				<label for="blankDialogHolePunchingY">Dialog hole punching Y</label>
			</div>
			<div>
				<input id="blankDialogHolePunchingRadius" type="number" bind:value={blankDialogHolePunchingRadius}/>
				<label for="blankDialogHolePunchingRadius">Dialog hole punching radius</label>
			</div>
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
