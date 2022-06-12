<script lang="ts">
import { globalLoading } from '$lib/store/ui';
import Loading from '../components/loading.svelte';



</script>

<Loading loading={$globalLoading} />

<slot></slot>
