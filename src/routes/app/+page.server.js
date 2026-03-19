import { redirect } from "@sveltejs/kit";

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
    if (!locals.user) {
      throw redirect(303, "/auth/login");
    }

    const { data: notedata } = await locals.supabase
      .from("notes")
      .select()
      .eq("owner", locals.user.id);

    const { data: tagdata } = await locals.supabase.from("tags").select().eq("owner", locals.user.id);

    const noteIds = (notedata ?? []).map((note) => note.id);
    const { data: noteTagData } = noteIds.length
      ? await locals.supabase
          .from("note_tags")
          .select("note_id, tag_id")
          .in("note_id", noteIds)
      : { data: [] };

    return {
      notes: notedata ?? [],
      tags: tagdata ?? [],
      noteTags: noteTagData ?? [],
      user: locals.user,
    };
}

  /**
   * 
   * {
   *    "notes": [...],
   *    "tags": [...]
   * }
   * 
   */