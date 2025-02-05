import axios from 'axios';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: 'https://intranet.caixa.cv:5000' });

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Aconteceu algo de errado...')
);

export default axiosInstance;

/// ---------------------------- LOCAL ----------------------------

// export const BASEURL = 'http://172.17.8.78:5000';
// export const BASEURLSLIM = 'http://172.17.8.78:8090';
// export const BASEURLCC = 'http://172.17.8.78:9901/aranha';
// export const BASEURLDD = 'http://172.17.8.78:9900/forminga';
export const BASEURLGAJI9 = 'http://172.17.8.78:9903/gaji9/api';

/// ---------------------------- TESTE ----------------------------

export const BASEURL = 'https://intraneteste.caixa.cv:5000';
export const BASEURLCC = 'https://ddocsteste.caixa.cv/aranha';
export const BASEURLDD = 'https://ddocsteste.caixa.cv/forminga';
export const BASEURLSLIM = 'https://intraneteste.caixa.cv:8090';
// export const BASEURLGAJI9 = 'https://gaji9teste.caixa.cv/gaji9/api';

/// --------------------------- PRODUÇÃo --------------------------

// export const BASEURL = 'https://intranet.caixa.cv:5000';
// export const BASEURLSLIM = 'https://intranet.caixa.cv:8090';
// export const BASEURLCC = 'https://digitaldocs.caixa.cv/aranha';
// export const BASEURLDD = 'https://digitaldocs.caixa.cv/forminga';
