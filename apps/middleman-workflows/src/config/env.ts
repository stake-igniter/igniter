import { cleanEnv, str } from 'envalid';

export const env = cleanEnv(process.env, {
    APP_IDENTITY: str({
        desc: 'The governance identity of the middleman app. This is expected to be a single valid pokt address.',
    })
});
