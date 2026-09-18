import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const port = Number(process.env.PORT ?? 8080)
const root = join(fileURLToPath(new URL('.', import.meta.url)), 'dist')
const backendUrl = process.env.BACKEND_URL ?? 'http://todo-backend:8080'

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
}

async function serveFile(request, response) {
  const requestedPath = normalize(request.url.split('?')[0]).replace(/^\/+/, '')
  const filePath = join(root, requestedPath)
  const candidate = requestedPath ? filePath : join(root, 'index.html')

  try {
    const fileStat = await stat(candidate)
    if (!fileStat.isFile()) throw new Error('Not a file')
    response.writeHead(200, {
      'Content-Type': contentTypes[extname(candidate)] ?? 'application/octet-stream',
    })
    createReadStream(candidate).pipe(response)
  } catch {
    createReadStream(join(root, 'index.html')).pipe(response)
  }
}

const server = createServer(async (request, response) => {
  if (request.url.startsWith('/api/')) {
    const target = new URL(request.url, backendUrl)
    const proxyRequest = await fetch(target, {
      method: request.method,
      headers: request.headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : request,
      duplex: 'half',
    })
    response.writeHead(proxyRequest.status, Object.fromEntries(proxyRequest.headers))
    response.end(Buffer.from(await proxyRequest.arrayBuffer()))
    return
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405).end()
    return
  }

  await serveFile(request, response)
})

server.listen(port, '0.0.0.0', () => {
  console.log(`Frontend listening on port ${port}`)
})
