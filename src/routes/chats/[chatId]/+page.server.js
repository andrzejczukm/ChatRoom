import queryCaptioningModel from '../../../captioning/query';

/** @type {import('./$types').Actions} */
export const actions = {
	caption: async ({ request }) => {
		const formData = await request.formData();
		const image = formData.get('file-input');

		const modelResponse = await queryCaptioningModel(image);

		const fileId = formData.get('file-id-container');
		const response = { fileId, caption: modelResponse };
		return response;
	},
};
