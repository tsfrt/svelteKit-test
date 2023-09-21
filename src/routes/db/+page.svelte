<script lang="ts">
	import type { PageData } from "./$types";

	export let data: PageData;
</script>

<svelte:head>
	<title>DB Connection Info</title>
	<meta name="description" content="DB Connection Info" />
</svelte:head>

<div class="text-column">
	<h1>DB Connection Info</h1>

	<p>
		Service bindings allow the environment to provide your service
		configuration at runtime. Developers do no need to be aware of
		connection specifics, only what type of services are available!
	</p>

	<a class="how-to-play" href="https://servicebinding.io/"
		>Service Binding for Kubernetes</a
	>
	<p>Loading binding from {data.bindingName}</p>
	<pre>"{data.connectionInfo}"</pre>
</div>
