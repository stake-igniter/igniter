import { cleanEnv, num, str } from 'envalid';

export const env = cleanEnv(process.env, {
    MINIMUM_STAKE_BUFFER: num({
        desc: 'Indicates the buffer that has been removed from minimum stake on chain to allow nodes to operate after slashes. This amount is in uPOKT',
        default: 500000000
    }),
    OWNER_IDENTITY: str({
        desc: 'The user identity of the owner of the middleman app. This is expected to be a single valid pokt address.',
    }),
    APP_IDENTITY: str({
        desc: 'The governance identity of the middleman app. This is expected to be a single valid pokt address.',
    })
});
