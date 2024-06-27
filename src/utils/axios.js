import axios from 'axios';
// config
import { HOST_API } from '../config';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: HOST_API });

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

/// ---------------------------- TESTE ----------------------------

export const BASEURL = 'https://intraneteste.caixa.cv:5000';
export const BASEURLCC = 'https://ddocsteste.caixa.cv/aranha';
export const BASEURLDD = 'https://ddocsteste.caixa.cv/forminga';
export const BASEURLSLIM = 'https://intraneteste.caixa.cv:8090';

/// --------------------------- PRODUÇÃo --------------------------

// export const BASEURL = 'https://intranet.caixa.cv:5000';
// export const BASEURLSLIM = 'https://intranet.caixa.cv:8090';
// export const BASEURLCC = 'https://digitaldocs.caixa.cv/aranha';
// export const BASEURLDD = 'https://digitaldocs.caixa.cv/forminga';
