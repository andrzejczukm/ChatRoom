export default async function queryCaptioningModel(imageUrl) {
	// convert image url to a file
	const imageResponse = await fetch(imageUrl);
	const data = await imageResponse.blob();
	// query a model
	const apiKey = import.meta.env.VITE_BLIP_API_KEY;
	const response = await fetch(
		'https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base',
		{
			headers: { Authorization: apiKey },
			method: 'POST',
			body: data,
		}
	);
	const result = await response.json();
	return result[0].generated_text;
}
