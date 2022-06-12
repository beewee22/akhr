<script lang="ts">
import { browser } from '$app/env';


	export let loading = false;

  $: {
    if (browser) {
      document.documentElement.style.overflow = loading ? 'hidden' : 'auto';
    }
  }
</script>

{#if loading}
	<div class="loadingBackDrop">
		<div class="loadingImage">
			<img class="loadingImg" src="img/loading.svg" alt="loading... please wait" />
		</div>
    <div class="loadingText">
      <p>Please wait...</p>
      </div>
	</div>
{/if}

<style lang="scss">
  .loadingBackDrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    user-select: none;
    .loadingText {
      color: white
    }
  }

</style>
