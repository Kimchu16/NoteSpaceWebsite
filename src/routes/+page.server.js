import { supabase } from "$lib/supabaseClient";

  export async function load() {
    const { data: notedata } = await supabase.from("notes").select();
    console.log(notedata)

    const {data: tagdata} = await supabase.from("tags").select();
    console.log(tagdata)
    
    return {
        notes: notedata ?? [],
        tags: tagdata ?? []
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