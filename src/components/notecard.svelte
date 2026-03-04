<script>
export let note;
let showModal = false;
import { modalData } from '$lib/stores';
</script>

<li class="card bg-base-100 shadow-md transition hover:shadow-lg">
  <div class="card-body">
    <h2 class="card-title">Note</h2>
    <p class="text-base-content/80">{note.context}</p>
    <div class="card-actions mt-2">
      <div class="badge badge-outline">x: {note.pos_x}</div>
      <div class="badge badge-outline">y: {note.pos_y}</div>
      <div class="badge badge-outline">z: {note.pos_z}</div>
    </div>
  </div>
<button onclick={() => {modalData.set(note)}} class="btn">open modal</button>


</li>
