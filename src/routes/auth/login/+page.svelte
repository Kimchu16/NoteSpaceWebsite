<script lang="ts">
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabaseClient.js';

	async function handleLogin(event: SubmitEvent) {
		const form = event.currentTarget as HTMLFormElement;
		const formData = new FormData(form);
		const email = String(formData.get('email') ?? '');
		const password = String(formData.get('password') ?? '');

		try {
			const { error } = await supabase.auth.signInWithPassword({ email, password });
			if (error) throw error;
			await supabase.auth.getSession();
			alert('Login successful! Redirecting to your dashboard...');
			await goto('/app', { invalidateAll: true });
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : 'Unknown error';
			alert('Login failed: ' + message);
		}
	}
</script>

<main class="auth-stage">
	<section class="auth-shell">
		<div class="relative mx-auto w-full max-w-3xl rounded-[2.2rem] border border-white/70 bg-[#f6f4ef] px-6 py-10 shadow-[0_30px_70px_rgba(10,18,30,0.28)] sm:px-10 sm:py-12">
			<div class="absolute left-1/2 top-0 h-10 w-28 -translate-x-1/2 -translate-y-1/2 rounded-[1rem_1rem_0_0] bg-[#7d8697] shadow-[inset_0_0_0_8px_rgba(255,255,255,0.2)]"></div>
			<div class="mx-auto max-w-xl">
				<div class="text-center">
					<h1 class="text-5xl font-black sm:text-6xl">Welcome Back</h1>
					<p class="mt-3 text-lg leading-8 text-[color:var(--ns-ink)]">Sign in to your NoteSpace account</p>
				</div>

				<form class="auth-form" on:submit|preventDefault={handleLogin}>
					<label class="auth-field form-control w-full">
						<div class="label px-0">
							<span class="label-text text-lg font-semibold">Email</span>
						</div>
						<input
							name="email"
							type="email"
							placeholder="you@example.com"
							class="auth-input input input-bordered w-full text-lg"
						/>
					</label>

					<label class="auth-field form-control w-full">
						<div class="label px-0">
							<span class="label-text text-lg font-semibold">Password</span>
						</div>
						<input
							name="password"
							type="password"
							placeholder="Enter your password"
							class="auth-input input input-bordered w-full text-lg"
						/>
					</label>

					<button type="submit" class="auth-submit btn btn-primary w-full">Log In</button>
				</form>

				<p class="mt-6 text-center text-base text-[color:var(--ns-ink)]">
					Don't have an account?
					<a href="/auth/signup" class="link link-primary ml-1 font-semibold">Sign up</a>
				</p>
			</div>
		</div>
	</section>
</main>
