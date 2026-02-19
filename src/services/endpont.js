import api from '../services/api';

export default {

    getUsuario: async () => {
		const json = await api.get('/usuario');
		return json?.data || [];
    },

	getRecoverPassword: async (cpf) => {
		const json = await api.get('/auth/recuperar-senha', {
			params:{
				cpf: cpf
			}
		})
		return json?.data || [];
    },

	getVerifyToken: async (cpf, token) => {
		const json = await api.get('/auth/validar-token', {
			params:{
				cpf: cpf,
				token: token,
			}
		})
		return json?.data || [];
    },

	postUpdatePassword: async (password, 
		confirm_password,
		id,
		token) => {
		const response = await api.post('/auth/atualizar-senha', {
			password: password,
			confirm_password: confirm_password,
			id: id,
			token: token
		});
		return response?.data || [];
    },

	getAllEvents: async () => {
		const json = await api.get('/events');
		return json?.data || [];
    },

	getUserEvents: async () => {
		const json = await api.get('/events/user');
		return json?.data || [];
    },

	getEvent: async (id) => {
		const json = await api.get(`/events/show/${id}`);
		return json?.data || [];
    },

	getListEventCheckin: async (id) => {
		const json = await api.get(`/checkin/list-event/${id}`);
		return json?.data || [];
    },

	postCheckinEvent: async (id) => {
		const json = await api.get(`/checkin/list-event/${id}`);
		return json?.data || [];
    },

	postCheckinEvent: async (data) => {
		const response = await api.post('/checkin', data, {
			headers: {
				'Content-Type': 'multipart/form-data'
			},
		});
		return response?.data || [];
    },

 	searchCredential: async (eventId, cpf) => {
		const json = await api.get(`/events/${eventId}/credential`, {
			params:{
				cpf: cpf
			}
		})
		return json?.data || [];
    },

	createCredential: async (eventId, data) => {
		const json = await api.post(`/events/${eventId}/credential`, data);
		return json?.data || [];
    },

};
