<main class="min-h-screen bg-base-200 flex items-center justify-center p-4">
	<div class="card w-full max-w-md bg-base-100 shadow-xl">
		<div class="card-body">
			<div class="text-center mb-2">
				<h1 class="text-3xl font-bold">Welcome Back</h1>
				<p class="text-base-content/70">Sign in to your NoteSpace account</p>
			</div>

			<form class="space-y-4" on:submit|preventDefault={handleLogin}>
				<label class="form-control w-full">
					<div class="label">
						<span class="label-text">Email</span>
					</div>
					<input name="email" type="email" placeholder="you@example.com" class="input input-bordered w-full" />
				</label>

				<label class="form-control w-full">
					<div class="label">
						<span class="label-text">Password</span>
					</div>
					<input name="password" type="password" placeholder="••••••••" class="input input-bordered w-full" />
				</label>

				<button type="submit" class="btn btn-primary w-full">Log In</button>
			</form>

			<p class="text-center text-sm mt-2">
				Don’t have an account?
				<a href="/auth/signup" class="link link-primary ml-1">Sign up</a>
			</p>
		</div>
	</div>
</main>
<script lang="ts">
	import { goto } from "$app/navigation";
	import { supabase } from "$lib/supabaseClient.js";

	async function handleLogin(event: SubmitEvent) {
		const form = event.currentTarget as HTMLFormElement;
		const formData = new FormData(form);
		const email = String(formData.get("email") ?? "");
		const password = String(formData.get("password") ?? "");

		try {
			const { error } = await supabase.auth.signInWithPassword({ email, password });
			if (error) throw error;
			await supabase.auth.getSession();
			alert("Login successful! Redirecting to your dashboard...");
			await goto("/app", { invalidateAll: true });
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : "Unknown error";
			alert("Login failed: " + message);
		}
	}
</script>