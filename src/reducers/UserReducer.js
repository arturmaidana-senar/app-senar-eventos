export const initialState = {
    avatar: '',
    email: '',
    name: '',
    telefone: '',
    userId: ''
};

export const UserReducer = (state, action) => {
    switch(action.type) {
        case 'setName':
            return { ...state, name: action.payload.name };
        break;
        case 'setTelefone':
            return { ...state, telefone: action.payload.telefone };
        break;  
        case 'setUserId':
            return { ...state, userId: action.payload.userId };
        break;                       
        case 'setEmail':
            return { ...state, email: action.payload.email };
        break; 
        default:
            return state;
    }
}