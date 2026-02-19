export const formatFone = (number) => {
    if(number.length > 9){
      const cleanedNumber = number.replace(/\D/g, '');
      if (cleanedNumber.length === 11) {
        return `(${cleanedNumber.slice(0, 2)}) ${cleanedNumber.slice(2, 7)}-${cleanedNumber.slice(7)}`;
      } else if (cleanedNumber.length === 10) {
        return `(${cleanedNumber.slice(0, 2)}) ${cleanedNumber.slice(2, 6)}-${cleanedNumber.slice(6)}`;
      }
      return number;
    }
    return number;
};
  
export const formatCPF = (cpf) => {
    const cleanedCPF = cpf.replace(/\D/g, '');
    if (cleanedCPF.length === 11) {
      return `${cleanedCPF.slice(0, 3)}.${cleanedCPF.slice(3, 6)}.${cleanedCPF.slice(6, 9)}-${cleanedCPF.slice(9)}`;
    }
    return cpf;
};

export const mapSituation = (situation) => {
    const situationsMap = {
      '1': 'Aguardando',
      '2': 'Em Atendimento',
      '3': 'Realizada',
      '4': 'Desistência',
      '5': 'Cancelou',
    };
    return situationsMap[situation] || situation;
};

export const formatPhoneNumber = (text) => {
    const cleaned = ('' + text).replace(/\D/g, '');
    if (cleaned.length <= 10) {
        return cleaned.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else {
        return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
};

export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
  