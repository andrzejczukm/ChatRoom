import queryCaptioningModel from '../../../captioning/query';

/** @type {import('./$types').Actions} */
export const actions = {
	caption: async ({ request }) => {
		const formData = await request.formData();
		const image = formData.get('imageInput');
		const modelResponse = await queryCaptioningModel(image);
		return { caption: modelResponse };
	},
};
