<script>
  import Notecard from "../../components/notecard.svelte";
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient.js";
  import { modalData } from "$lib/stores";

  /** @typedef {import("@supabase/supabase-js").User} User */
  /** @typedef {{ id: number, context: string, colour: string, is_anchored?: boolean }} Note */
  /** @typedef {{ note_id: number, tag_id: number }} NoteTag */
  /** @typedef {{ tag_id: number, tag_name: string, description: string }} Tag */

  let new_note_context = "";
  $: new_note_context = $modalData ? $modalData.context : "";
  let new_note_colour = "";


  let colours = ["green", "blue", "yellow", "purple"];
  let selected_tag_ids = /** @type {string[]} */ ([]);
  $: new_note_colour = $modalData ? $modalData.colour : "";
  $: selected_tag_ids = $modalData
    ? note_tags
        .filter((item) => item.note_id === $modalData.id)
        .map((item) => String(item.tag_id))
    : [];

  /** @type {Record<string, string>} */
  let colour_map = {
    green: "bg-[#4B644A]",
    blue: "bg-[#304C89]",
    yellow: "bg-[#FFC857]",
    purple: "bg-[#342140]",
  };

  const tag_surface_classes = ["sticky-note-blue", "sticky-note-cream", "sticky-note-yellow"];

  let create_note = false;
  let created_context = "";
  let created_colour = "";

  let create_tag = false;
  let created_tag_name = "";
  let created_tag_description = "";

  /** @type {import("./$types").PageData} */
  export let data;
  /** @type {Note[]} */
  let notes = data.notes;
  /** @type {Tag[]} */
  let tags = data.tags;
  /** @type {NoteTag[]} */
  let note_tags = data.noteTags ?? [];
  let user_email = "";
  /** @type {User | null} */
  let current_user = data.user ?? null;

  let viewingNotes = true;
  let loaded = false;

  /** @type {Note[]} */
  let filtered_notes = notes;
  /** @type {Tag[]} */
  let filtered_tags = tags;

  let editing_tag = false;
  let edited_tag_name = "";
  let edited_tag_description = "";
  /** @type {number | null} */
  let edited_tag_id = null;

  let note_search_value = "";
  let tag_search_value = "";

  function filterNotes() {
    if (note_search_value.trim() === "") {
      filtered_notes = notes;
    } else {
      const lowerSearch = note_search_value.toLowerCase();
      filtered_notes = notes.filter((note) =>
        note.context.toLowerCase().includes(lowerSearch)
      );
    }
  }

  function filterTags() {
    if (tag_search_value.trim() === "") {
      filtered_tags = tags;
    } else {
      const lowerSearch = tag_search_value.toLowerCase();
      filtered_tags = tags.filter((tag) =>
        tag.tag_name.toLowerCase().includes(lowerSearch) ||
        (tag.description ?? "").toLowerCase().includes(lowerSearch)
      );
    }
  }

  /**
   * @param {string} tagId
   */
  function toggleTagSelection(tagId) {
    selected_tag_ids = selected_tag_ids.includes(tagId)
      ? selected_tag_ids.filter((id) => id !== tagId)
      : [...selected_tag_ids, tagId];
  }

  /**
   * @param {number} index
   */
  function getTagSurfaceClass(index) {
    return tag_surface_classes[index % tag_surface_classes.length];
  }

  async function updateNote() {
    const { error } = await supabase
      .from("notes")
      .update({ context: new_note_context, colour: new_note_colour })
      .eq("id", $modalData.id);

    if (error) {
      console.error(error);
      return;
    }

    const { error: deleteTagError } = await supabase
      .from("note_tags")
      .delete()
      .eq("note_id", $modalData.id);

    if (deleteTagError) {
      console.error(deleteTagError);
      return;
    }

    if (selected_tag_ids.length > 0) {
      const tagRows = selected_tag_ids.map((tag_id) => ({
        note_id: $modalData.id,
        tag_id: Number(tag_id),
      }));

      const { error: insertTagError } = await supabase.from("note_tags").insert(tagRows);

      if (insertTagError) {
        console.error(insertTagError);
        return;
      }
    }

    modalData.set(null);
    location.reload();
  }

  async function createNote() {
    let owner_id = current_user?.id || "";
    const { error } = await supabase.from("notes").insert({
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
    const { error } = await supabase
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
    const { error } = await supabase.from("tags").insert({
      tag_name: created_tag_name,
      description: created_tag_description,
      owner: current_user?.id || "",
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

  /** @param {Tag} tag */
  function editTag(tag) {
    editing_tag = true;
    edited_tag_name = tag.tag_name;
    edited_tag_description = tag.description;
    edited_tag_id = tag.tag_id;
  }

  async function updateTag() {
    if (edited_tag_id === null) return;

    const { error } = await supabase
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
    if (edited_tag_id === null) return;

    const { error } = await supabase
      .from("tags")
      .delete()
      .eq("tag_id", edited_tag_id);

    if (error) console.error(error);
    else {
      location.reload();
    }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error signing out:", error);
    else window.location.href = "/auth/login";
  }

  onMount(async () => {
    let fragment = window.location.hash;
    current_user = (await supabase.auth.getUser()).data.user;
    let email = current_user?.email ?? "Unknown User";
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
  <main class="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
    <section class="mx-auto w-full max-w-7xl">
      <div class="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside class="clipboard-panel px-5 py-7 sm:px-6">
          <div class="flex items-center justify-between gap-4">
            <div class="badge badge-primary">NoteSpace</div>

            <button class="btn btn-outline btn-error shrink-0" onclick={() => signOut()}>
              Sign Out
            </button>
          </div>

          <div class="mt-5 min-w-0">
            <div class="min-w-0">
              <h1 class="text-3xl font-black">My Workspace</h1>
              <p class="mt-2 overflow-hidden text-ellipsis whitespace-nowrap text-sm leading-7 text-[color:var(--ns-ink)]">
                {user_email}
              </p>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-2 gap-4">
            <div class="sticky-note sticky-note-blue p-4">
              <p class="text-sm font-bold uppercase tracking-[0.2em] text-[color:var(--ns-blue-deep)]">Notes</p>
              <p class="mt-3 text-4xl font-black">{notes.length}</p>
            </div>

            <div class="sticky-note sticky-note-yellow p-4">
              <p class="text-sm font-bold uppercase tracking-[0.2em] text-[color:var(--ns-ink-soft)]">Tags</p>
              <p class="mt-3 text-4xl font-black">{tags.length}</p>
            </div>
          </div>

          <div class="mt-6 mb-6 space-y-3">
            <button class="btn btn-warning w-full" onclick={() => toggleView()}>
              {#if viewingNotes}Switch To Tags{:else}Switch To Notes{/if}
            </button>

            {#if viewingNotes}
              <button class="btn btn-primary w-full" onclick={() => (create_note = !create_note)}>
                Create Note
              </button>
            {:else}
              <button class="btn btn-secondary w-full" onclick={() => (create_tag = !create_tag)}>
                Create Tag
              </button>
            {/if}
          </div>

          {#if viewingNotes}
            <label class="form-control w-full">
              <input
                type="text"
                placeholder="Search note text..."
                class="input input-bordered w-full"
                oninput={() => filterNotes()}
                bind:value={note_search_value}
              />
            </label>
          {:else}
            <label class="form-control w-full">
              <input
                type="text"
                placeholder="Search tags..."
                class="input input-bordered w-full"
                oninput={() => filterTags()}
                bind:value={tag_search_value}
              />
            </label>
          {/if}

          <div class="mt-6 rounded-[1.5rem] bg-white/58 p-4">
            <p class="text-sm font-bold uppercase tracking-[0.2em] text-[color:var(--ns-ink-soft)]">Workflow</p>
            <p class="mt-3 leading-7 text-[color:var(--ns-ink)]">
              Create or edit note text here, then later view the finished notes in the headset where they were placed.
            </p>
          </div>
        </aside>

        <div class="space-y-6">
          <div class="flex justify-center xl:justify-start">
            <div class="control-pill">
              <span class="control-pill-dot">N</span>
              <span class="control-pill-divider"></span>
              <span class="control-pill-dot">T</span>
              <span class="control-pill-divider"></span>
              <span class="text-sm font-semibold tracking-[0.2em] uppercase">
                {#if viewingNotes}Notes Board{:else}Tags Board{/if}
              </span>
            </div>
          </div>

          {#if viewingNotes}
            {#if notes.length > 0}
              <div class="sticky-note sticky-note-cream p-4 sm:p-5">
                <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 class="text-2xl font-black">Saved Notes</h2>
                    <p class="mt-2 text-sm leading-7 text-[color:var(--ns-ink)]">
                      Edit note content here before viewing it around your home in mixed reality.
                    </p>
                  </div>
                  <div class="badge badge-ghost">{filtered_notes.length} visible</div>
                </div>
              </div>

              {#if filtered_notes.length > 0}
                <ul class="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
                  {#each filtered_notes as note}
                    <Notecard {note} />
                  {/each}
                </ul>
              {:else}
                <div class="sticky-note sticky-note-cream p-8 text-center">
                  <h2 class="text-2xl font-black">No matching notes</h2>
                  <p class="mx-auto mt-3 max-w-md leading-7 text-[color:var(--ns-ink)]">
                    Try a different search term or clear the search bar to see all notes again.
                  </p>
                </div>
              {/if}
            {:else}
              <div class="sticky-note sticky-note-cream p-8 text-center">
                <h2 class="text-2xl font-black">No notes found</h2>
                <p class="mx-auto mt-3 max-w-md leading-7 text-[color:var(--ns-ink)]">
                  Create your first note on the website, then return to the headset when you want to place or review it.
                </p>
              </div>
            {/if}
          {:else if tags.length > 0}
            <div class="sticky-note sticky-note-cream p-4 sm:p-5">
              <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 class="text-2xl font-black">Saved Tags</h2>
                  <p class="mt-2 text-sm leading-7 text-[color:var(--ns-ink)]">
                    Use tags to organise related notes by topic, room, class, or language.
                  </p>
                </div>
                <div class="badge badge-ghost">{filtered_tags.length} visible</div>
              </div>
            </div>

            {#if filtered_tags.length > 0}
              <ul class="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
                {#each filtered_tags as tag, index}
                  <li class={`sticky-note ${getTagSurfaceClass(index)} p-5 transition duration-200 hover:-translate-y-1 hover:shadow-[var(--ns-shadow)]`}>
                    <div class="flex items-start justify-between gap-3">
                      <div class="badge badge-secondary">Tag</div>
                      <button onclick={() => editTag(tag)} class="btn btn-warning btn-sm">Edit</button>
                    </div>

                    <h3 class="mt-5 text-2xl font-black">{tag.tag_name}</h3>
                    <p class="mt-3 min-h-24 leading-7 text-[color:var(--ns-ink)]">
                      {tag.description || "No description"}
                    </p>
                  </li>
                {/each}
              </ul>
            {:else}
              <div class="sticky-note sticky-note-cream p-8 text-center">
                <h2 class="text-2xl font-black">No matching tags</h2>
                <p class="mx-auto mt-3 max-w-md leading-7 text-[color:var(--ns-ink)]">
                  Try a different search term or clear the search bar to see all tags again.
                </p>
              </div>
            {/if}
          {:else}
            <div class="sticky-note sticky-note-cream p-8 text-center">
              <h2 class="text-2xl font-black">No tags found</h2>
              <p class="mx-auto mt-3 max-w-md leading-7 text-[color:var(--ns-ink)]">
                Create your first tag to group related notes before you review them in the headset.
              </p>
            </div>
          {/if}
        </div>
      </div>
    </section>
  </main>
{:else}
  <div class="flex items-center justify-center h-screen">
    <span class="loading loading-spinner loading-lg"></span>
  </div>
{/if}
{#if $modalData}
  <dialog class="modal modal-open">
    <div class="modal-box editor-modal-shell w-11/12 max-w-4xl overflow-hidden p-0">
      <div class={"h-2 w-full " + (colour_map[new_note_colour] || "bg-base-300")}></div>
      <div class="editor-modal-header px-5 py-5 sm:px-7">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div class="space-y-2">
            <div class="badge badge-primary badge-outline">Edit Note</div>
            <div>
              <h3 class="text-2xl font-black sm:text-3xl">Update note details</h3>
              <p class="editor-helper mt-2 max-w-2xl">
                Refine the note text, adjust its colour, and control which tags are attached to it.
              </p>
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            {#if $modalData.is_anchored}
              <div class="badge badge-primary badge-outline">Anchored</div>
            {:else}
              <div class="badge badge-outline">Unanchored</div>
            {/if}
            <div class="badge badge-ghost">ID {$modalData.id}</div>
          </div>
        </div>
      </div>

      <div class="editor-modal-content space-y-6 px-5 py-5 sm:px-7 sm:py-6">
        <div class="editor-modal-card p-4 sm:p-5">
          <label class="form-control w-full">
            <span class="editor-label">Note text</span>
            <p class="editor-helper mb-4">Make the content concise enough to read comfortably in mixed reality.</p>
          <textarea
            class="editor-input textarea textarea-bordered min-h-36 w-full resize-y"
            placeholder="Type the note content here"
            bind:value={new_note_context}
          ></textarea>
          </label>
        </div>

        <div class="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div class="editor-modal-card p-4 sm:p-5">
            <span class="editor-label">Note colour</span>
            <p class="editor-helper mb-4">Pick a note style that helps it stand out in the room.</p>
            <div class="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
              {#each colours as colour}
                <button
                  type="button"
                  class={`editor-choice-btn ${
                    new_note_colour === colour ? "is-selected" : ""
                  }`}
                  onclick={() => (new_note_colour = colour)}
                >
                  <span class={"h-4 w-4 rounded-full border border-black/10 " + colour_map[colour]}></span>
                  <span class="capitalize">{colour}</span>
                </button>
              {/each}
            </div>
          </div>

          <div class="editor-modal-card p-4 sm:p-5">
            <div class="flex items-center justify-between gap-3">
              <span class="editor-label mb-0">Tags</span>
              <div class="badge badge-ghost">
                {selected_tag_ids.length} selected
              </div>
            </div>
            <p class="editor-helper mb-4">Attach tags so the note stays easy to find and organise later.</p>

            {#if tags.length > 0}
              <div class="editor-tag-grid sm:grid-cols-2">
                {#each tags as tag}
                  <label
                    class={`editor-tag-option cursor-pointer ${selected_tag_ids.includes(String(tag.tag_id)) ? "is-selected" : ""}`}
                  >
                    <input
                      type="checkbox"
                      class="checkbox checkbox-sm mt-1"
                      checked={selected_tag_ids.includes(String(tag.tag_id))}
                      onchange={() => toggleTagSelection(String(tag.tag_id))}
                    />
                    <span class="min-w-0">
                      <span class="block font-medium leading-tight">{tag.tag_name}</span>
                      <span class="mt-1 block text-sm text-base-content/70">
                        {tag.description || "No description"}
                      </span>
                    </span>
                  </label>
                {/each}
              </div>
            {:else}
              <div class="rounded-box border border-dashed border-[rgba(152,161,178,0.28)] bg-white/46 px-4 py-6 text-sm text-[color:var(--ns-ink-soft)]">
                No tags available yet. Create a tag first if you want to organise this note.
              </div>
            {/if}
          </div>
        </div>
      </div>

      <div class="editor-modal-footer px-5 py-4 sm:px-7">
        <div class="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" onclick={() => deleteNote()} class="btn btn-error btn-outline w-full sm:w-auto">
            Delete Note
          </button>

          <div class="flex flex-col gap-3 sm:flex-row">
            <button type="button" onclick={() => modalData.set(null)} class="btn w-full sm:w-auto">
              Cancel
            </button>
            <button type="button" onclick={() => updateNote()} class="btn btn-success w-full sm:w-auto">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button onclick={() => modalData.set(null)}>close</button>
    </form>
  </dialog>
{/if}

{#if create_note}
  <dialog class="modal modal-open">
    <div class="modal-box w-11/12 max-w-2xl overflow-hidden p-0">
      <div class={"h-2 w-full " + (colour_map[created_colour] || "bg-base-300")}></div>
      <div class="border-b border-base-300 px-5 py-5 sm:px-6">
        <div class="space-y-2">
          <div class="badge badge-primary badge-outline">Create Note</div>
          <div>
            <h3 class="text-xl font-bold sm:text-2xl">Add a new note</h3>
            <p class="mt-1 text-sm text-base-content/70">
              Write the note content here, choose a colour, and save it to your workspace.
            </p>
          </div>
        </div>
      </div>

      <div class="space-y-6 bg-base-100 px-5 py-5 sm:px-6">
        <label class="form-control w-full">
          <div class="label px-0">
            <span class="label-text font-semibold">Note text</span>
          </div>
          <textarea
            class="textarea textarea-bordered min-h-32 w-full resize-y"
            placeholder="Type the note content here"
            bind:value={created_context}
          ></textarea>
        </label>

        <div class="space-y-3">
          <div class="flex items-center justify-between gap-3">
            <div class="label px-0 pb-0">
              <span class="label-text font-semibold">Note colour</span>
            </div>
            <div class="badge badge-ghost capitalize">
              {created_colour || "Not selected"}
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {#each colours as colour}
              <button
                type="button"
                class={`btn h-auto min-h-0 justify-start gap-3 px-3 py-3 ${
                  created_colour === colour ? "btn-neutral" : "btn-outline"
                }`}
                onclick={() => (created_colour = colour)}
              >
                <span class={"h-4 w-4 rounded-full border border-black/10 " + colour_map[colour]}></span>
                <span class="capitalize">{colour}</span>
              </button>
            {/each}
          </div>
        </div>
      </div>

      <div class="border-t border-base-300 bg-base-100 px-5 py-4 sm:px-6">
        <div class="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button type="button" onclick={() => (create_note = false)} class="btn w-full sm:w-auto">
            Cancel
          </button>
          <button type="button" onclick={() => createNote()} class="btn btn-success w-full sm:w-auto">
            Create Note
          </button>
        </div>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button onclick={() => (create_note = false)}>close</button>
    </form>
  </dialog>
{/if}

{#if create_tag}
  <dialog class="modal modal-open">
    <div class="modal-box w-11/12 max-w-2xl overflow-hidden p-0">
      <div class="h-2 w-full bg-secondary"></div>
      <div class="border-b border-base-300 px-5 py-5 sm:px-6">
        <div class="space-y-2">
          <div class="badge badge-secondary badge-outline">Create Tag</div>
          <div>
            <h3 class="text-xl font-bold sm:text-2xl">Add a new tag</h3>
            <p class="mt-1 text-sm text-base-content/70">
              Create a label to group related notes by topic, language, or reminder type.
            </p>
          </div>
        </div>
      </div>

      <div class="space-y-6 bg-base-100 px-5 py-5 sm:px-6">
        <label class="form-control w-full">
          <div class="label px-0">
            <span class="label-text font-semibold">Tag name</span>
          </div>
          <input
            type="text"
            class="input input-bordered w-full"
            placeholder="For example: Spanish, Kitchen, Revision"
            bind:value={created_tag_name}
          />
        </label>

        <label class="form-control w-full">
          <div class="label px-0">
            <span class="label-text font-semibold">Description</span>
          </div>
          <textarea
            class="textarea textarea-bordered min-h-28 w-full resize-y"
            placeholder="Add a short description for what this tag is used for"
            bind:value={created_tag_description}
          ></textarea>
        </label>
      </div>

      <div class="border-t border-base-300 bg-base-100 px-5 py-4 sm:px-6">
        <div class="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button type="button" onclick={() => (create_tag = false)} class="btn w-full sm:w-auto">
            Cancel
          </button>
          <button type="button" onclick={() => createTag()} class="btn btn-success w-full sm:w-auto">
            Create Tag
          </button>
        </div>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button onclick={() => (create_tag = false)}>close</button>
    </form>
  </dialog>
{/if}

{#if editing_tag}
  <dialog class="modal modal-open">
    <div class="modal-box editor-modal-shell w-11/12 max-w-2xl overflow-hidden p-0">
      <div class="h-2 w-full bg-[#ef3a98]"></div>
      <div class="editor-modal-header px-5 py-5 sm:px-7">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div class="space-y-2">
            <div class="badge badge-secondary badge-outline">Edit Tag</div>
            <div>
              <h3 class="text-2xl font-black sm:text-3xl">Update tag details</h3>
              <p class="editor-helper mt-2 max-w-xl">
                Refine the tag name and description so your notes stay easy to organise.
              </p>
            </div>
          </div>
          {#if edited_tag_id !== null}
            <div class="badge badge-ghost">ID {edited_tag_id}</div>
          {/if}
        </div>
      </div>

      <div class="editor-modal-content space-y-5 px-5 py-5 sm:px-7 sm:py-6">
        <div class="editor-modal-card p-4 sm:p-5">
          <label class="form-control w-full">
            <span class="editor-label">Tag name</span>
            <p class="editor-helper mb-4">Use a short label that is easy to recognise later.</p>
          <input
            type="text"
            class="editor-input input input-bordered w-full"
            placeholder="For example: Spanish, Kitchen, Revision"
            bind:value={edited_tag_name}
          />
          </label>
        </div>

        <div class="editor-modal-card p-4 sm:p-5">
          <label class="form-control w-full">
            <span class="editor-label">Description</span>
            <p class="editor-helper mb-4">Add a short explanation so it is obvious what belongs in this tag.</p>
          <textarea
            class="editor-input textarea textarea-bordered min-h-36 w-full resize-y"
            placeholder="Add a short description for what this tag is used for"
            bind:value={edited_tag_description}
          ></textarea>
          </label>
        </div>
      </div>

      <div class="editor-modal-footer px-5 py-4 sm:px-7">
        <div class="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" onclick={() => deleteTag()} class="btn btn-error btn-outline w-full sm:w-auto">
            Delete Tag
          </button>

          <div class="flex flex-col gap-3 sm:flex-row">
            <button type="button" onclick={() => (editing_tag = false)} class="btn w-full sm:w-auto">
              Cancel
            </button>
            <button type="button" onclick={() => updateTag()} class="btn btn-success w-full sm:w-auto">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button onclick={() => (editing_tag = false)}>close</button>
    </form>
  </dialog>
{/if}
