import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { SeoService } from './seo.service';

@ApiTags('seo')
@Controller('seo')
@Public()
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  @Get('config/:path')
  @ApiOperation({ summary: 'Get SEO config for a path' })
  @ApiResponse({ status: 200, description: 'SEO config' })
  async getSEOConfig(@Param('path') path: string) {
    return this.seoService.getSEOConfig(path);
  }

  @Get('redirect/:fromPath')
  @ApiOperation({ summary: 'Get redirect for a path' })
  @ApiResponse({ status: 200, description: 'Redirect info' })
  async getRedirect(@Param('fromPath') fromPath: string) {
    return this.seoService.getRedirect(fromPath);
  }

  @Get('sitemap')
  @ApiOperation({ summary: 'Generate sitemap' })
  @ApiResponse({ status: 200, description: 'Sitemap XML' })
  async getSitemap(@Res() res: Response) {
    const { urls } = await this.seoService.generateSitemap();

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${process.env.FRONTEND_URL || 'http://localhost:3000'}${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  }

  @Get('robots.txt')
  @ApiOperation({ summary: 'Get robots.txt' })
  @ApiResponse({ status: 200, description: 'Robots.txt content' })
  async getRobotsTxt(@Res() res: Response) {
    const content = await this.seoService.getRobotsTxt();
    res.header('Content-Type', 'text/plain');
    res.send(content);
  }
}
