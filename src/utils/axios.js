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

// export const BASEURL = 'http://172.17.61.163:5000';
// export const BASEURLDD = 'http://172.17.61.163:9900';
// export const BASEURLSLIM = 'http://172.17.61.163:8090';

/// ---------------------------- TESTE ----------------------------

export const BASEURL = 'https://intraneteste.caixa.cv:5000';
export const BASEURLDD = 'https://ddocsteste.caixa.cv:9900';
export const BASEURLSLIM = 'https://intraneteste.caixa.cv:8090';

/// --------------------------- PRODUÇÃo --------------------------

// export const BASEURL = 'https://intranet.caixa.cv:5000';
// export const BASEURLDD = 'https://digitaldocs.caixa.cv:9900';
// export const BASEURLSLIM = 'https://intranet.caixa.cv:8090';
