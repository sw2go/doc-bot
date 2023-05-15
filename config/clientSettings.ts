const NEXT_PUBLIC_READONLY_CONTEXTS = process.env.NEXT_PUBLIC_READONLY_CONTEXTS ? process.env.NEXT_PUBLIC_READONLY_CONTEXTS.split(';') : [ 'MyTopic'];
const NEXT_PUBLIC_EDITABLE_CONTEXTS = process.env.NEXT_PUBLIC_EDITABLE_CONTEXTS ? process.env.NEXT_PUBLIC_EDITABLE_CONTEXTS.split(';') : [ 'Test']

const NEXT_PUBLIC_PROVIDER_NAME = process.env.NEXT_PUBLIC_PROVIDER_NAME ?? 'sw2go';
const NEXT_PUBLIC_PROVIDER_URL = process.env.NEXT_PUBLIC_PROVIDER_URL ?? 'https://github.com/sw2go/doc-bot';


const NEXT_PUBLIC_CONTEXTS = [... NEXT_PUBLIC_READONLY_CONTEXTS, ... NEXT_PUBLIC_EDITABLE_CONTEXTS ];


export { NEXT_PUBLIC_READONLY_CONTEXTS, NEXT_PUBLIC_EDITABLE_CONTEXTS, NEXT_PUBLIC_CONTEXTS, NEXT_PUBLIC_PROVIDER_NAME, NEXT_PUBLIC_PROVIDER_URL  };