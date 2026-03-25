import api from '../services/api';

export default {
  getUsuario: async () => {
    const json = await api.get('/usuario');
    return json?.data || [];
  },

  getRecoverPassword: async cpf => {
    const json = await api.get('/auth/recuperar-senha', {
      params: {
        cpf: cpf,
      },
    });
    return json?.data || [];
  },

  getVerifyToken: async (cpf, token) => {
    const json = await api.get('/auth/validar-token', {
      params: {
        cpf: cpf,
        token: token,
      },
    });
    return json?.data || [];
  },

  postUpdatePassword: async (password, confirm_password, id, token) => {
    const response = await api.post('/auth/atualizar-senha', {
      password: password,
      confirm_password: confirm_password,
      id: id,
      token: token,
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

  getEvent: async id => {
    const json = await api.get(`/events/show/${id}`);
    return json?.data || [];
  },

  getListEventCheckin: async id => {
    const json = await api.get(`/checkin/list-event/${id}`);
    return json?.data || [];
  },

  postCheckinEvent: async id => {
    const json = await api.get(`/checkin/list-event/${id}`);
    return json?.data || [];
  },

  postCheckinEventData: async data => {
    const response = await api.post('/checkin', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response?.data || [];
  },

  searchCredential: async (eventId, cpf) => {
    const json = await api.get(`/events/${eventId}/credential`, {
      params: {
        cpf: cpf,
      },
    });
    return json?.data || [];
  },

  createCredential: async (eventId, data) => {
    const json = await api.post(`/events/${eventId}/credential`, data);
    return json?.data || [];
  },

  checkGendersViaCpf: async (eventId, cpf) => {
    try {
      const response = await api.post(`/checkin/${eventId}/cpf`, { cpf });
      return response?.data;
    } catch (error) {
      if (error?.response?.data?.genders) {
        return error.response.data;
      }
      throw error;
    }
  },

  getEventTerm: async eventId => {
    const response = await api.get(`/events/${eventId}/term`);
    return response?.data || {};
  },

  getParentescos: async () => {
    const response = await api.get('/parentesco');
    return response?.data || [];
  },

  getTiposParticipantes: async () => {
    const response = await api.get('/tipos-participantes');
    return response?.data || [];
  },

  postFreeListCheckin: async (eventId, formData, customToken) => {
    const headers = {
      'Content-Type': 'multipart/form-data',
    };

    if (customToken) {
      headers['Authorization'] = customToken;
    }

    const response = await api.post(`/checkin/${eventId}/free-list`, formData, {
      headers,
    });
    return response?.data || {};
  },
};
