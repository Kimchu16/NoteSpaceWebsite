<script>
  import Notecard from "../../components/notecard.svelte";
  import { onMount } from "svelte";
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

  let create_tag = false;
  let created_tag_name = "";
  let created_tag_description = "";

  export let data;
  let notes = data.notes;
  let tags = data.tags;
  let user_email = "";
  let current_user = data.user;

  let viewingNotes = true;
  let loaded = false;

  let filtered_notes = notes;

  let editing_tag = false;
  let edited_tag_name = "";
  let edited_tag_description = "";
  let edited_tag_id = null;

  let search_value = "";

  function filterNotes() {
    if (search_value.trim() === "") {
      filtered_notes = notes;
    } else {
      const lowerSearch = search_value.toLowerCase();
      filtered_notes = notes.filter((note) =>
        note.context.toLowerCase().includes(lowerSearch)
      );
    }
  }

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

    let owner_id = current_user?.id || "";
    const { data, error } = await supabase.from("notes").insert({
      context: created_context,
      colour: created_colour,
      owner: owner_id,
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

  async function createTag() {
    const { data, error } = await supabase.from("tags").insert({
      tag_name: created_tag_name,
      description: created_tag_description,
    });

    if (error) console.error(error);
    else {
      create_tag = false;
      location.reload();
    }
  }
  function toggleView() {
    viewingNotes = !viewingNotes;
    if (viewingNotes) {
      window.location.hash = "#notes";
    } else {
      window.location.hash = "#tags";
    }
  }

  function editTag(tag) {
    editing_tag = true;
    edited_tag_name = tag.tag_name;
    edited_tag_description = tag.description;
    edited_tag_id = tag.tag_id;
  }

  async function updateTag() {
    const { data, error } = await supabase
      .from("tags")
      .update({
        tag_name: edited_tag_name,
        description: edited_tag_description,
      })
      .eq("tag_id", edited_tag_id);

    if (error) console.error(error);
    else {
      editing_tag = false;
      location.reload();
    }
  }

  async function deleteTag() {
    const { data, error } = await supabase
      .from("tags")
      .delete()
      .eq("tag_id", edited_tag_id);

    if (error) console.error(error);
    else {
      location.reload();
    }
  }

  onMount(async () => {
    let fragment = window.location.hash;
    current_user = (await supabase.auth.getUser()).data.user;
    let email = current_user ? current_user.email : "Unknown User";
    user_email = email;
    console.log("User email:", email);
    if (fragment === "#tags") {
      viewingNotes = false;
    } else if (fragment === "#notes") {
      viewingNotes = true;
    }
    loaded = true;
  });
</script>

{#if loaded}
  <main class="min-h-screen bg-base-200 px-4 py-10">
    <section class="mx-auto w-full max-w-6xl space-y-6">
      <div class="hero rounded-box bg-base-100 shadow-sm">
        <div class="hero-content w-full flex-col items-start p-8">
          <span class="badge badge-primary badge-outline">NoteSpace</span>
          <h1 class="text-4xl font-bold">My Workspace ({user_email})</h1>
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
          <button class="btn btn-primary" onclick={() => toggleView()}>
            {#if viewingNotes}View Tags{:else}View Notes{/if}
          </button>
        </div>

        {#if viewingNotes}
          <div class="flex justify-end gap-4">
            <button
              class="btn btn-primary"
              onclick={() => (create_note = !create_note)}
            >
              Create Note
            </button>
          </div>
        {:else}
          <div class="flex justify-end gap-4">
            <button
              class="btn btn-primary"
              onclick={() => (create_tag = !create_tag)}
            >
              Create Tag
            </button>
          </div>
        {/if}
      </div>

      {#if viewingNotes}
        {#if notes.length > 0}
        <input type="text" placeholder="Search notes..." class="input w-full mb-4" oninput={() => filterNotes()} bind:value={search_value} />
          <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {#each filtered_notes as note}
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
                <button onclick={() => editTag(tag)} class="btn btn-warning">Edit</button>
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
{:else}
  <div class="flex items-center justify-center h-screen">
    <span class="loading loading-spinner loading-lg"></span>
  </div>
{/if}
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
        <button onclick={() => (create_note = false)} class="btn btn-error"
          >Close</button
        >
        <button onclick={() => createNote()} class="btn btn-success"
          >Create</button
        >
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button onclick={() => (create_note = false)}>close</button>
    </form>
  </dialog>
{/if}

{#if create_tag}
  <dialog class="modal modal-open">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">Create Tag</h3>
      <input
        type="text"
        class="input"
        placeholder="tag name"
        bind:value={created_tag_name}
      />
      <input
        type="text"
        class="input mt-4"
        placeholder="tag description"
        bind:value={created_tag_description}
      />

      <div class="modal-action">
        <button onclick={() => (create_tag = false)} class="btn btn-error"
          >Close</button
        >
        <button onclick={() => createTag()} class="btn btn-success"
          >Create</button
        >
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button onclick={() => (create_tag = false)}>close</button>
    </form>
  </dialog>
{/if}

{#if editing_tag}
  <dialog class="modal modal-open">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">Edit Tag</h3>
      <input
        type="text"
        class="input"
        placeholder="tag name"
        bind:value={edited_tag_name}
      />
      <input
        type="text"
        class="input mt-4"
        placeholder="tag description"
        bind:value={edited_tag_description}
      />

      <div class="modal-action">
        <button onclick={() => (editing_tag = false)} class="btn btn-error"
          >Close</button
        >
        <button onclick={() => updateTag()} class="btn btn-success"
          >Update</button
        >
        <button onclick={() => deleteTag()} class="btn btn-error"
          >Delete</button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button onclick={() => (editing_tag = false)}>close</button>
    </form>
  </dialog>
{/if}
