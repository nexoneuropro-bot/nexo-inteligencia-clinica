import { handleClinicalRequest } from '../../_lib/momento-clinical.js';

export const onRequest = context => handleClinicalRequest(context);
