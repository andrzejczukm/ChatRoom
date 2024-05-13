<script>
	export let radius = 16;
	export let width = 4;
	export let light = false;
	$: size = `${radius * 2}px`;
</script>

<span
	class="spinner"
	style={`width: ${size}; height: ${size}; border-width: ${width}px;`}
	class:dark={!light}
	class:light
/>

<style>
	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	.spinner {
		display: inline-block;
		border-radius: 9999px;
		animation: spin 1s linear infinite;
	}

	.spinner.light {
		border: solid whitesmoke;
		border-bottom-color: transparent;
	}

	.spinner.dark {
		border: solid #709692;
		border-bottom-color: transparent;
	}
</style>
