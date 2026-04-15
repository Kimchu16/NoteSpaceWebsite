import { createServerClient } from "@supabase/ssr";
import { env } from "$env/dynamic/public";

export async function handle({ event, resolve }) {
  event.locals.supabase = createServerClient(
    env.PUBLIC_SUPABASE_URL,
    env.PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return event.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            event.cookies.set(name, value, { ...options, path: "/" });
          });
        },
      },
    }
  );

  const {
    data: { user },
    error,
  } = await event.locals.supabase.auth.getUser();

  event.locals.user = error ? null : user;

  return resolve(event);
}