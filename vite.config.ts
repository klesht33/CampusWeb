import fs from 'node:fs'
import path from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const UNNE_LSI_ROOT = 'C:\\Users\\cuent\\Documents\\UNNE\\UNNE-LSI-main\\UNNE-LSI-main'

const MIME_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.c': 'text/plain; charset=utf-8',
  '.cpp': 'text/plain; charset=utf-8',
  '.h': 'text/plain; charset=utf-8',
  '.cs': 'text/plain; charset=utf-8',
  '.lsp': 'text/plain; charset=utf-8',
  '.lisp': 'text/plain; charset=utf-8',
  '.sql': 'text/plain; charset=utf-8',
  '.s': 'text/plain; charset=utf-8',
  '.r': 'text/plain; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.yaml': 'text/yaml; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.jfif': 'image/jpeg',
  '.webp': 'image/webp',
  '.heic': 'image/heic',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.odt': 'application/vnd.oasis.opendocument.text',
  '.rtf': 'application/rtf',
  '.zip': 'application/zip',
  '.rar': 'application/vnd.rar',
  '.drawio': 'application/xml; charset=utf-8',
  '.excalidraw': 'application/json; charset=utf-8',
}

function createUnneLsiMiddleware() {
  const resolvedRoot = path.resolve(UNNE_LSI_ROOT)
  return (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const rawUrl = req.url || ''
    if (!rawUrl.startsWith('/unne-files/')) {
      next()
      return
    }
    try {
      const cleanUrl = rawUrl.split('?')[0].slice('/unne-files/'.length)
      const decodedRel = decodeURIComponent(cleanUrl)
      const targetPath = path.resolve(resolvedRoot, decodedRel)

      if (!targetPath.startsWith(resolvedRoot + path.sep) && targetPath !== resolvedRoot) {
        res.statusCode = 403
        res.end('Forbidden')
        return
      }

      if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isFile()) {
        res.statusCode = 404
        res.end('File not found')
        return
      }

      const ext = path.extname(targetPath).toLowerCase()
      const contentType = MIME_TYPES[ext] || 'application/octet-stream'
      res.setHeader('Content-Type', contentType)
      res.setHeader('X-Frame-Options', 'SAMEORIGIN')
      res.setHeader('X-Content-Type-Options', 'nosniff')
      res.setHeader('Content-Disposition', 'inline')
      fs.createReadStream(targetPath).pipe(res)
    } catch {
      res.statusCode = 400
      res.end('Bad request')
    }
  }
}

function serveUnneLsiPlugin(): Plugin {
  return {
    name: 'serve-unne-lsi-files',
    configureServer(server) {
      server.middlewares.use(createUnneLsiMiddleware())
    },
    configurePreviewServer(server) {
      server.middlewares.use(createUnneLsiMiddleware())
    },
  }
}

const securityHeaders = {
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
}

export default defineConfig({
  base: './',
  plugins: [react(), serveUnneLsiPlugin()],
  server: {
    headers: securityHeaders,
  },
  preview: {
    headers: securityHeaders,
  },
})
