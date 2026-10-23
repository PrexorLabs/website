<script lang="ts">
  import { page } from '$app/state';
  import NotFound from '#lib/NotFound.svelte';

  // Every page is built ahead, so almost any error here is an address that does not exist.
  const message = $derived(page.status === 404 ? undefined : page.error?.message);
</script>

<NotFound status={page.status} {message} />
