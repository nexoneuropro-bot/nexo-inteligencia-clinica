import { handleSharingStatus } from '../../_lib/editorial-sharing.js';
export const onRequest = context => handleSharingStatus(context);
