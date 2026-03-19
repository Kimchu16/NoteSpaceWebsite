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

    return {
      notes: notedata ?? [],
      tags: tagdata ?? [],
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