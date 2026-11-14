import {handleFollowupRequest} from '../../_lib/momento-followups.js';

export const onRequest=context=>handleFollowupRequest(context);
