<script>
	import '../app.css';
</script>

<header>
	<div class="header-right">
		<h1 class="logo">ChatRoom</h1>
		<div class="links">
			<a href="/about">About</a>
			<a class="active" href="/chats">Chat</a>
			<a href="/catalog">Catalog</a>
			<a href="/login">Login / Logout</a>
		</div>
	</div>
</header>
<slot />
<footer>
	<div class="footer-content">
		<p>© 2024 Chat Room. Project created for Cloud Computing.</p>
	</div>
</footer>

<style>
	header {
		background-color: whitesmoke;
		position: sticky;
		margin-bottom: 0;
	}

	.header-right {
		margin-left: 30px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.logo {
		font-size: 2em;
		color: #000;
		font-weight: 1000;
	}

	.links a {
		margin-left: auto;
		margin-left: 30px;
		margin-right: 30px;
		text-decoration: none;
		color: #111111;
		font-weight: bold;
	}
	.links a:hover {
		color: #709692;
		/* rgb(117, 117, 117); */
		transition: background-color 0.3s ease;
	}

	footer {
		background-color: whitesmoke;
		padding: 20px 0;
		text-align: center;
		position: absolute;
		bottom: 0;
		width: 100%;
	}

	.footer-content {
		max-width: 1200px;
		margin: 0 auto;
	}

	.footer-content p {
		margin: 0;
	}
</style>
