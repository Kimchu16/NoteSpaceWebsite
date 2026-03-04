<script>
import Notecard from '../components/notecard.svelte';
  export let data;
  let notes = data.notes;
  let tags = data.tags;
  let viewingNotes = true;
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

    <div class="flex justify-start gap-4">
      <button class="btn btn-primary" onclick={() => (viewingNotes = !viewingNotes)}>
        {#if viewingNotes}View Tags{:else}View Notes{/if}
      </button>
    </div>

    {#if viewingNotes}
      {#if notes.length > 0}
        <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {#each notes as note}
            <Notecard note={note} />
          {/each}
        </ul>
      {:else}
        <div class="card bg-base-100 shadow-md">
          <div class="card-body items-center text-center">
            <h2 class="card-title">No notes found</h2>
            <p class="text-base-content/70">Create your first note to see it here.</p>
          </div>
        </div>
      {/if}
    {:else}
      {#if tags.length > 0}
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
            <p class="text-base-content/70">Create your first tag to see it here.</p>
          </div>
        </div>
      {/if}
    {/if}
  </section>
</main>
