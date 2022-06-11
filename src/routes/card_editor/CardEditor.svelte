<div style="display:flex; flex-direction: column; align-items: center;">
  <span>Current Index: {index + 1}</span>
  <div style="display:flex; flex-direction: row">
    <button 
      disabled={index <= 0}
      on:click={onLeftClick}>⬅️</button>
    <button 
      disabled={index > (columns * rows - 1)}
      on:click={onRightClick}>➡️</button>
  </div>
  <canvas width={cardWidth}
    height={cardHeight}
    style="border: 1px solid black"/>
</div>

<script lang="ts">
  export let width = 7500;
  export let height = 7350;
  export let columns = 10;
  export let rows = 7;
  export let src:string;
  export let index = 0;

  import { onMount } from "svelte";
  let cardWidth = width / columns;
  let cardHeight = height / rows;

  const onLeftClick = () => {
    if (index > 0) {
      index--;
      renderOriginalCard(index);
    }
  };

  const onRightClick = () => {
    if (index < columns * rows - 1) {
      index++;
      renderOriginalCard(index);
    }
  };

  const renderOriginalCard = (index: number) => {
    const canvas: HTMLCanvasElement = document.querySelector("canvas") as HTMLCanvasElement;
    const x = Math.floor(index % columns) * cardWidth;
    const y = Math.floor(index / columns) * cardHeight;
    const _img = new Image();
    _img.src = src;
    _img.onload = () => {
      if (_img) {
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(_img, -x, -y);
      }
    };
  }

  onMount(async () => {
    const img = document.createElement<"img">("img");
    img.src = src;
    img.onload = () => {
      img && (
        width = img.width,
        height = img.height,
        cardWidth = width / columns,
        cardHeight = height / rows
      );
    };

    renderOriginalCard(index);
  });
</script>