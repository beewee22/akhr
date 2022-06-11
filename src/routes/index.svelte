<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<CardEditor
  width={canvasInformation.width} 
  height={canvasInformation.height}
  columns={canvasInformation.columns}
  rows={canvasInformation.rows}
  src={cardsUrl}
  index={canvasInformation.index}/>

<script lang="ts">
  import cardsUrl from "$lib/assets/httpcloud3steamusercontentcomugc960860341956229149FC980D306FA8FE74C552981167CBDF4305821B31.jpg";
  import CardEditor from "./card_editor/CardEditor.svelte";

  const canvasInformation = {
    width: 360,
    height: 280,
    columns: 10,
    rows: 7,
    index: 0,
  }
</script>