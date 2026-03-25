export const formatDateToBr = dateString => {
  if (!dateString) return '';
  try {
    const [year, month, day] = dateString.split('-');
    if (!year || !month || !day) return dateString;
    return `${day}/${month}/${year}`;
  } catch (e) {
    return dateString;
  }
};

export const formatForBackend = dateStr => {
  if (!dateStr || dateStr.length !== 10) return dateStr;
  const [d, m, y] = dateStr.split('/');
  return `${y}-${m}-${d}`;
};

export const formatCPF = v =>
  v
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');

export const maskTelefone = v =>
  v
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15);

export const formatarData = t => {
  let c = t.replace(/\D/g, '');
  if (c.length > 8) c = c.slice(0, 8);

  if (c.length >= 2) {
    let dia = parseInt(c.slice(0, 2), 10);
    if (dia > 31) c = '31' + c.slice(2);
    if (dia === 0) c = '01' + c.slice(2);
  }

  if (c.length >= 4) {
    let mes = parseInt(c.slice(2, 4), 10);
    if (mes > 12) c = c.slice(0, 2) + '12' + c.slice(4);
    if (mes === 0) c = c.slice(0, 2) + '01' + c.slice(4);
  }

  if (c.length >= 5) return `${c.slice(0, 2)}/${c.slice(2, 4)}/${c.slice(4)}`;
  if (c.length >= 3) return `${c.slice(0, 2)}/${c.slice(2)}`;
  return c;
};

export const isValidDate = dateString => {
  if (!dateString || dateString.length !== 10) return false;
  const [day, month, year] = dateString.split('/').map(Number);
  if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900)
    return false;
  const dt = new Date(year, month - 1, day);
  return (
    dt.getDate() === day &&
    dt.getMonth() === month - 1 &&
    dt.getFullYear() === year
  );
};

export const calcularIdade = d => {
  if (!d || d.length !== 10 || !isValidDate(d)) return '';
  const [D, M, A] = d.split('/').map(Number);
  const dt = new Date(A, M - 1, D);
  const h = new Date();
  if (isNaN(dt.getTime())) return '';
  let i = h.getFullYear() - dt.getFullYear();
  const m = h.getMonth() - dt.getMonth();
  if (m < 0 || (m === 0 && h.getDate() < dt.getDate())) i--;
  return i >= 0 ? i.toString() : '0';
};
