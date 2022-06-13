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
	let isBlankTitleHolePunchingPreview = false;
	let blankTitleHolePunchingX = 107;
	let blankTitleHolePunchingY = 105;
	let blankTitleHolePunchingRadius = 56;
	let adjustBlankTitleWidth = 68;
	let adjustBlankTitleHeight = 67;
	let adjustBlankTitleOffsetX = -33;
	let adjustBlankTitleOffsetY = 39.2;
	let adjustBlankTitleFilterSapia = -1;
	let adjustBlankTitleFilterSaturate = 100;
	let isDisplayBlankDialog = false;
	let adjustBlankDialogWidth = 67;
	let adjustBlankDialogHeight = 86;
	let adjustBlankDialogOffsetX = 0;
	let adjustBlankDialogOffsetY = 41;

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
				renderCard(
					zeroBasedIndex,
					adjustSourceOffsetX,
					adjustSourceOffsetY,
					adjustBlankTitleWidth,
					adjustBlankTitleHeight,
					adjustBlankTitleOffsetX,
					adjustBlankTitleOffsetY,
					isBlankTitleHolePunchingPreview,
					blankTitleHolePunchingX,
					blankTitleHolePunchingY,
					blankTitleHolePunchingRadius,
					adjustBlankTitleFilterSapia,
					adjustBlankTitleFilterSaturate,
					adjustBlankDialogWidth,
					adjustBlankDialogHeight,
					adjustBlankDialogOffsetX,
					adjustBlankDialogOffsetY,
					isDisplayBlankTitle,
					isDisplayBlankDialog
				);
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
		zeroBasedIndex: number,
		adjustSourceOffsetX: number,
		adjustSourceOffsetY: number,
		adjustBlankTitleWidth: number,
		adjustBlankTitleHeight: number,
		adjustBlankTitleOffsetX: number,
		adjustBlankTitleOffsetY: number,
		isBlankTitleHolePunchingPreview: boolean,
		blankTitleHolePunchingX: number,
		blankTitleHolePunchingY: number,
		blankTitleHolePunchingRadius: number,
		adjustBlankTitleFilterSapia: number,
		adjustBlankTitleFilterSaturate: number,
		adjustBlankDialogWidth: number,
		adjustBlankDialogHeight: number,
		adjustBlankDialogOffsetX: number,
		adjustBlankDialogOffsetY: number,
		isRenderBlankTitle: boolean,
		isRenderBlankDialog: boolean
		) => {
		const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
		const x = Math.floor(zeroBasedIndex % columns) * cardWidth;
		const y = Math.floor(zeroBasedIndex / columns) * cardHeight;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(
			imgElement,
			adjustSourceOffsetX-x,
			-y-adjustSourceOffsetY
		);

		if (isRenderBlankTitle) {
			const blankTitle = new Image();
			blankTitle.src = '/resources/blank_cards/blank_title_2.png';
			blankTitle.addEventListener('load', () => {
				const titleCanvas = document.createElement('canvas');
				const titleContext = titleCanvas.getContext('2d') as CanvasRenderingContext2D;
				titleCanvas.width = blankTitle.width;
				titleCanvas.height = blankTitle.height;
				titleContext.filter =`saturate(${adjustBlankTitleFilterSaturate}%) sepia(${adjustBlankTitleFilterSapia}%)`;
				titleContext.drawImage(
					blankTitle, 
					0, 0, blankTitle.width, blankTitle.height,
					0, 0, titleCanvas.width, titleCanvas.height
				);
				
				if (isBlankTitleHolePunchingPreview) {
					titleContext.strokeStyle = '#ff0000';
					titleContext.beginPath();
					titleContext.arc(blankTitleHolePunchingX, blankTitleHolePunchingY, blankTitleHolePunchingRadius+1, 0, 2 * Math.PI, false);	
					titleContext.stroke();
				}

				titleContext.save();
				titleContext.globalCompositeOperation = 'destination-out';
				titleContext.beginPath();
				titleContext.arc(blankTitleHolePunchingX, blankTitleHolePunchingY, blankTitleHolePunchingRadius, 0, 2 * Math.PI, false);
				titleContext.fill();
				titleContext.restore();

				ctx.drawImage(
					titleCanvas,
					adjustBlankTitleOffsetX, -adjustBlankTitleOffsetY,
					canvas.width+adjustBlankTitleWidth, canvas.height+adjustBlankTitleHeight
				);
			});
		}

		if (isRenderBlankDialog) {
			const blankDialog = new Image();
			blankDialog.src = '/resources/blank_cards/blank_dialog_1.png';
			blankDialog.addEventListener('load', () => {
				ctx.drawImage(
					blankDialog, 
					adjustBlankDialogOffsetX-(adjustBlankDialogWidth/2), -adjustBlankDialogOffsetY, 
					canvas.width+adjustBlankDialogWidth, canvas.height+adjustBlankDialogHeight
				);
			});
		}
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
				<label for="blankTitleAdjustWidth">Title width adjustment</label>
			</div>
			<div>
				<input id="blankTitleAdjustHeight" type="number" bind:value={adjustBlankTitleHeight}/>
				<label for="blankTitleAdjustHeight">Title height adjustment</label>
			</div>
			<div>
				<input id="blankTitleAdjustOffsetX" type="number" bind:value={adjustBlankTitleOffsetX}/>
				<label for="blankTitleAdjustOffsetX">Title offset X</label>
			</div>
			<div>
				<input id="blankTitleAdjustOffsetY" type="number" bind:value={adjustBlankTitleOffsetY}/>
				<label for="blankTitleAdjustOffsetY">Title offset Y adjustment</label>
			</div>
			<div>
				<input id="blankTitleFilterSapia" type="number" bind:value={adjustBlankTitleFilterSapia}/>
				<label for="blankTitleFilterSapia">Title filter sapia</label>
			</div>
			<div>
				<input id="blankTitleFilterSaturate" type="number" bind:value={adjustBlankTitleFilterSaturate}/>
				<label for="blankTitleFilterSaturate">Title filter saturate</label>
			</div>
			<br/>
			<div>
				<input id="blankTitleHolePunchingPreview" type="checkbox" bind:checked={isBlankTitleHolePunchingPreview} />
				<label for="blankTitleHolePunchingPreview">Preview Blank Title Hole Punching</label>
			</div>
			<div>
				<input id="blankTitleHolePunchingX" type="number" bind:value={blankTitleHolePunchingX}/>
				<label for="blankTitleHolePunchingX">Title hole punching X</label>
			</div>
			<div>
				<input id="blankTitleHolePunchingY" type="number" bind:value={blankTitleHolePunchingY}/>
				<label for="blankTitleHolePunchingY">Title hole punching Y</label>
			</div>
			<div>
				<input id="blankTitleHolePunchingRadius" type="number" bind:value={blankTitleHolePunchingRadius}/>
				<label for="blankTitleHolePunchingRadius">Title hole punching radius</label>
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
				<label for="blankDialogAdjustOffsetY">Dialog offset Y adjustment</label>
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
