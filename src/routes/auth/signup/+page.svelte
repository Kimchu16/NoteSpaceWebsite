<main class="min-h-screen bg-base-200 flex items-center justify-center p-4">
	<div class="card w-full max-w-md bg-base-100 shadow-xl">
		<div class="card-body">
			<div class="text-center mb-2">
				<h1 class="text-3xl font-bold">Create Account</h1>
				<p class="text-base-content/70">Join NoteSpace and start organizing your notes</p>
			</div>

			<form class="space-y-4" on:submit|preventDefault={handleSignup}>
				<label class="form-control w-full">
					<div class="label">
						<span class="label-text">Full Name</span>
					</div>
					<input name="fullName" type="text" placeholder="Jane Doe" class="input input-bordered w-full" />
				</label>

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
					<input
						name="password"
						type="password"
						placeholder="At least 8 characters"
						class="input input-bordered w-full"
					/>
				</label>

				<label class="label cursor-pointer justify-start gap-3">
					<input type="checkbox" class="checkbox checkbox-primary" />
					<span class="label-text">I agree to the Terms and Privacy Policy</span>
				</label>

				<button type="submit" class="btn btn-primary w-full">Sign Up</button>
			</form>

			<p class="text-center text-sm mt-2">
				Already have an account?
				<a href="/auth/login" class="link link-primary ml-1">Log in</a>
			</p>
		</div>
	</div>
</main>
<script lang="ts">
	import { supabase } from "$lib/supabaseClient.js";

	async function handleSignup(event: SubmitEvent) {
		const form = event.currentTarget as HTMLFormElement;
		const formData = new FormData(form);
		const email = String(formData.get("email") ?? "");
		const password = String(formData.get("password") ?? "");

		try {
			const { error } = await supabase.auth.signUp({ email, password });
			if (error) throw error;
			window.location.href = "/app";
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : "Unknown error";
			alert(`Error signing up: ${message}`);
		}
	}
</script>

