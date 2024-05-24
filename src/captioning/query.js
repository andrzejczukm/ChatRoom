export default async function queryCaptioningModel(imageFile) {
	const noCaptionMessage = 'No caption generated';

	try {
		// query a model
		const apiKey = import.meta.env.VITE_BLIP_API_KEY;
		if (apiKey === undefined) {
			throw Error('No API key found');
		}
		const response = await fetch(
			'https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base',
			{
				headers: { Authorization: apiKey },
				method: 'POST',
				body: imageFile,
			}
		);

		const result = await response.json();
		return result[0]?.generated_text ?? noCaptionMessage;
	} catch (err) {
		console.error(err);
		return noCaptionMessage;
	}
}
