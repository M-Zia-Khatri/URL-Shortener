import type { FastifyReply } from 'fastify';
import type { UrlService } from './url.service.js';

export class UrlController {
  constructor(private service: UrlService) {}

  create = async (r: any, reply: FastifyReply) => reply.code(201).send({ success: true, data: await this.service.create(r.body) });
  list = async (r: any) => ({ success: true, data: await this.service.list(r.query.page, r.query.limit) });
  get = async (r: any) => ({ success: true, data: await this.service.get(r.params.id) });
  update = async (r: any) => ({ success: true, data: await this.service.update(r.params.id, r.body) });
  remove = async (r: any, reply: FastifyReply) => {
    await this.service.remove(r.params.id);
    return reply.code(204).send();
  };
  redirect = async (r: any, reply: FastifyReply) => {
    const url = await this.service.getByCode(r.params.code, {
      referrer: r.headers.referer,
      userAgent: r.headers['user-agent'],
    });
    return reply.redirect(url.originalUrl, 302);
  };
}
