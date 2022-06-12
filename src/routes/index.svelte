<script lang="ts">
	import OriginalImageCollapsible from '../components/original_image_collapsible.svelte';
	import CardEditor from './card_editor/CardCutter.svelte';

	let width: number;
	let height: number;

	const canvasInformation = {
		columns: 10,
		rows: 7,
		src: '/img/httpcloud3steamusercontentcomugc960860341956229149FC980D306FA8FE74C552981167CBDF4305821B31.jpg'
	};
</script>

<div>
	<OriginalImageCollapsible src={canvasInformation.src} />
</div>
<div>
	<CardEditor {...canvasInformation} bind:width bind:height />
</div>
