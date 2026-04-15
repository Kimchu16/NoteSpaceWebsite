<script>
import { modalData } from '$lib/stores';
export let note;
let showModal = false;
</script>

<li class="card bg-base-100 shadow-md transition hover:shadow-lg">
  <div class="card-body">
    <h2 class="card-title">Note</h2>
    <p class="text-base-content/80">{note.context}</p>
    <div class="card-actions mt-2">
      {#if note.is_anchored}
        <div class="badge badge-primary badge-outline">Anchored</div>
      {:else}
        <div class="badge badge-outline">Unanchored</div>
      {/if}
    </div>
    <button onclick={() => {modalData.set(note)}} class="btn btn-warning w-32 ml-auto">Edit</button>
  </div>


</li>
