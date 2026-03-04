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
      <div class="badge badge-outline">x: {Number(note.pos_x).toFixed(3)}</div>
      <div class="badge badge-outline">y: {Number(note.pos_y).toFixed(3)}</div>
      <div class="badge badge-outline">z: {Number(note.pos_z).toFixed(3)}</div>
    </div>
    <button onclick={() => {modalData.set(note)}} class="btn btn-warning w-32 ml-auto">Edit</button>
  </div>


</li>
