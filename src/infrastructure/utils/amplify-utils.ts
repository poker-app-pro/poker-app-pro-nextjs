import { generateServerClientUsingCookies } from '@aws-amplify/adapter-nextjs/api';
import { cookies } from 'next/headers';
import config from '@/amplify_outputs.json';

export const cookieBasedClient = generateServerClientUsingCookies({
  config,
  cookies,
});
