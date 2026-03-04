<script>
  import Notecard from "../components/notecard.svelte";
  import { supabase } from "$lib/supabaseClient.js";
  import { modalData } from "$lib/stores";

  let new_note_context = "";
  $: new_note_context = $modalData ? $modalData.context : "";
  let new_note_colour = "";

  let colours = ["green", "blue", "yellow", "purple"];
  $: new_note_colour = $modalData ? $modalData.colour : "";

  let colour_map = {
    green: "bg-[#4B644A]",
    blue: "bg-[#304C89]",
    yellow: "bg-[#FFC857]",
    purple: "bg-[#342140]",
  };

  let create_note = false;
  let created_context = "";
  let created_colour = "";

  export let data;
  let notes = data.notes;
  let tags = data.tags;
  let viewingNotes = true;

  async function updateNote() {
    const { data, error } = await supabase
      .from("notes")
      .update({ context: new_note_context, colour: new_note_colour })
      .eq("id", $modalData.id);

    if (error) console.error(error);
    else {
      modalData.set(null);
      location.reload();
    }
  }

  async function createNote() {
    const { data, error } = await supabase.from("notes").insert({
      context: created_context,
      colour: created_colour,
    });

    if (error) console.error(error);
    else {
      create_note = false;
      location.reload();
    }
}

  async function deleteNote() {
    const { data, error } = await supabase
      .from("notes")
      .delete()
      .eq("id", $modalData.id);

    if (error) console.error(error);
    else {
      modalData.set(null);
      location.reload();
    }
  }
</script>

<main class="min-h-screen bg-base-200 px-4 py-10">
  <section class="mx-auto w-full max-w-6xl space-y-6">
    <div class="hero rounded-box bg-base-100 shadow-sm">
      <div class="hero-content w-full flex-col items-start p-8">
        <span class="badge badge-primary badge-outline">NoteSpace</span>
        <h1 class="text-4xl font-bold">My Workspace</h1>
        <p class="text-base-content/70">Browse your saved notes and tags.</p>
        <div class="stats stats-horizontal w-full bg-base-200 shadow">
          <div class="stat">
            <div class="stat-title">Notes</div>
            <div class="stat-value text-primary">{notes.length}</div>
          </div>
          <div class="stat">
            <div class="stat-title">Tags</div>
            <div class="stat-value text-secondary">{tags.length}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-row justify-between w-full">
      <div class="flex justify-start gap-4">
        <button
          class="btn btn-primary"
          onclick={() => (viewingNotes = !viewingNotes)}
        >
          {#if viewingNotes}View Tags{:else}View Notes{/if}
        </button>
      </div>

      <div class="flex justify-end gap-4">
        <button
          class="btn btn-primary"
          onclick={() => (create_note = !create_note)}
        >
          Create Note
        </button>
      </div>
    </div>

    {#if viewingNotes}
      {#if notes.length > 0}
        <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {#each notes as note}
            <Notecard {note} />
          {/each}
        </ul>
      {:else}
        <div class="card bg-base-100 shadow-md">
          <div class="card-body items-center text-center">
            <h2 class="card-title">No notes found</h2>
            <p class="text-base-content/70">
              Create your first note to see it here.
            </p>
          </div>
        </div>
      {/if}
    {:else if tags.length > 0}
      <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each tags as tag}
          <li class="card bg-base-100 shadow-md transition hover:shadow-lg">
            <div class="card-body">
              <h2 class="card-title">
                <span class="badge badge-secondary badge-outline">Tag</span>
                {tag.tag_name}
              </h2>
              <p class="text-base-content/80">{tag.description}</p>
            </div>
          </li>
        {/each}
      </ul>
    {:else}
      <div class="card bg-base-100 shadow-md">
        <div class="card-body items-center text-center">
          <h2 class="card-title">No tags found</h2>
          <p class="text-base-content/70">
            Create your first tag to see it here.
          </p>
        </div>
      </div>
    {/if}
  </section>
</main>

{#if $modalData}
  <dialog class="modal modal-open">
    <div class={"modal-box " + colour_map[new_note_colour]}>
      <h3 class="font-bold text-lg mb-4">Edit Note</h3>
      <input
        type="text"
        class="input"
        placeholder="note context"
        bind:value={new_note_context}
      />
      <select class="select mt-4" bind:value={new_note_colour}>
        <option disabled selected>Pick a color</option>
        {#each colours as colour}
          <option value={colour}>{colour}</option>
        {/each}
      </select>
      <div class="modal-action">
        <button onclick={() => modalData.set(null)} class="btn btn-error"
          >Close</button
        >
        <button onclick={() => updateNote()} class="btn btn-success"
          >Update</button
        >
        <button onclick={() => deleteNote()} class="btn btn-error"
          >Delete</button
        >
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button onclick={() => modalData.set(null)}>close</button>
    </form>
  </dialog>
{/if}

{#if create_note}
  <dialog class="modal modal-open">
    <div class={"modal-box " + colour_map[created_colour]}>
      <h3 class="font-bold text-lg mb-4">Create Note</h3>
      <input
        type="text"
        class="input"
        placeholder="note context"
        bind:value={created_context}
      />
      <select class="select mt-4" bind:value={created_colour}>
        <option disabled selected>Pick a color</option>
        {#each colours as colour}
          <option value={colour}>{colour}</option>
        {/each}
      </select>
      <div class="modal-action">
        <button onclick={() => create_note = false} class="btn btn-error"
          >Close</button
        >
        <button onclick={() => createNote()} class="btn btn-success"
          >Create</button
        >
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button onclick={() => create_note = false}>close</button>
    </form>
  </dialog>
{/if}
