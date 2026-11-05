// En développement uniquement (`vite` / `pnpm dev`) : fait tourner les routes
// du dossier /api comme sur Vercel, pour tester la page /admin en local.
// Sans BLOB_READ_WRITE_TOKEN, les données vont dans .local-storage/.
// Mot de passe de test : variable ADMIN_PASSWORD, sinon « admin-local ».
import type { Plugin } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';

async function toRequest(req: IncomingMessage): Promise<Request> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const body = chunks.length ? Buffer.concat(chunks) : undefined;
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === 'string') headers.set(key, value);
    else if (Array.isArray(value)) headers.set(key, value.join(', '));
  }
  const method = req.method ?? 'GET';
  return new Request(`http://${req.headers.host ?? 'localhost'}${req.url ?? '/'}`, {
    method,
    headers,
    body: method === 'GET' || method === 'HEAD' ? undefined : body,
  });
}

async function send(res: ServerResponse, response: Response) {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  res.end(Buffer.from(await response.arrayBuffer()));
}

export function apiDevServer(): Plugin {
  return {
    name: 'raleurs-api-dev',
    apply: 'serve',
    configureServer(server) {
      process.env.ADMIN_PASSWORD ??= 'admin-local';
      server.middlewares.use(async (req, res, next) => {
        const match = req.url?.match(/^\/api\/([a-z-]+)(?:\?|$)/);
        if (!match) return next();
        try {
          const mod = await server.ssrLoadModule(`/api/${match[1]}.ts`);
          const response: Response = await mod.default.fetch(await toRequest(req));
          await send(res, response);
        } catch (error) {
          server.config.logger.error(String((error as Error).stack ?? error));
          res.statusCode = 500;
          res.end('Erreur API locale');
        }
      });
    },
  };
}
