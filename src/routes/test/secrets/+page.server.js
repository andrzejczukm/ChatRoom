import queryCaptioningModel from '../../../captioning/query';

/** @type {import('./$types').Actions} */
export const actions = {
	caption: async ({ request }) => {
		const data = await request.formData();
		const imageUrl = data.get('imageUrl');
		const modelResponse = await queryCaptioningModel(imageUrl);
		return { caption: modelResponse };
	},
};
