<script lang="ts">
	export let src: string;
	let isOpen: boolean;
</script>

<details class="originalImageDetail" bind:open={isOpen}>
	<summary>
		<h2>{src}</h2>
		<span class="originalImageToggle">
			{isOpen ? 'Hide' : 'Show'}
		</span>
	</summary>
	<a href={src} target="_blank"><img class="originalImage" loading="lazy" {src} alt={src} /></a>
</details>

<style lang="scss">
	.originalImageDetail {
		white-space: nowrap;
		cursor: pointer;
		user-select: none;
		background-color: #eee;
		margin: 0 0 2rem 0;
		summary {
			display: flex;
			align-items: center;
			justify-content: space-between;
			&::marker {
				display: inline-flex;
			}
			& > h2 {
				padding: 0 0.5rem;
				word-break: break-all;
				text-overflow: ellipsis;
				overflow: hidden;
			}
			.originalImageToggle {
				min-width: 6rem;
				text-align: center;
			}
		}
		.originalImage {
			width: 100%;
		}
	}
</style>
