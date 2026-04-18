<script>
	import { modalData } from '$lib/stores';

	/** @typedef {{ colour?: string, context: string, is_anchored?: boolean }} NoteCardData */
	/** @type {NoteCardData} */
	export let note;

	/** @type {Record<string, string>} */
	const toneMap = {
		blue: 'bg-[#bad3f4] border-[#9abbe9]',
		yellow: 'bg-[#f4e886] border-[#dfcf61]',
		green: 'bg-[#d6efda] border-[#9dd1aa]',
		purple: 'bg-[#ddd1f5] border-[#bca5e6]'
	};

	/** @type {Record<string, string>} */
	const accentMap = {
		blue: 'text-[#456cc5]',
		yellow: 'text-[#7c6b19]',
		green: 'text-[#2e7b48]',
		purple: 'text-[#7440b8]'
	};

	/** @type {string} */
	let noteColour = '';
	$: noteColour = note.colour ?? '';
</script>

<li
	class={`relative flex min-h-[16rem] flex-col rounded-[1.7rem] border p-5 shadow-[var(--ns-shadow-soft)] transition duration-200 hover:-translate-y-1 hover:shadow-[var(--ns-shadow)] ${
		toneMap[noteColour] || 'bg-white/88 border-white/80'
	}`}
>
	<div class="absolute left-1/2 top-0 h-4 w-16 -translate-x-1/2 -translate-y-1/2 rounded-b-[1.1rem] bg-white/60"></div>

	<div class="flex items-start justify-between gap-3">
		<div class={`badge border-0 bg-white/70 capitalize ${accentMap[noteColour] || 'text-[color:var(--ns-ink-strong)]'}`}>
			{noteColour || 'note'}
		</div>
		{#if note.is_anchored}
			<div class="badge badge-primary">Anchored</div>
		{:else}
			<div class="badge badge-ghost">Unanchored</div>
		{/if}
	</div>

	<p class="mt-5 flex-1 whitespace-pre-wrap text-lg font-semibold leading-8 text-[color:var(--ns-ink-strong)]">
		{note.context}
	</p>

	<div class="mt-6 flex items-end justify-between gap-3">
		<div class="text-sm font-semibold text-[color:var(--ns-ink-soft)]">Tap to refine this note</div>
		<button onclick={() => modalData.set(note)} class="btn btn-warning btn-sm">Edit</button>
	</div>
</li>
