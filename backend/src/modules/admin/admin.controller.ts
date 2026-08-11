import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Request, UseGuards, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminService } from './admin.service';
import { UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminController {
  constructor(private readonly svc: AdminService) {}

  @Get('dashboard') async dash() { return this.svc.getDashboardStats(); }
  @Get('recent-activity') async rec(@Query('limit') l?: number) { return this.svc.getRecentActivity(l ? +l : 10); }
  @Get('users') async users(@Query('page') p?: number, @Query('limit') l?: number, @Query('search') s?: string) { return this.svc.getUsers(p ? +p : 1, l ? +l : 20, s); }
  @Get('users/admin') async admins() { return this.svc.getAdminUsers(); }
  @Post('users/admin') @Roles(UserRole.SUPER_ADMIN) async ca(@Body() b: { phone: string; firstName: string; lastName: string; role?: UserRole }) { return this.svc.createAdminUser(b.phone, b.firstName, b.lastName, b.role); }
  @Patch('users/admin/:id') @Roles(UserRole.SUPER_ADMIN) async ua(@Param('id') id: string, @Body() b: { firstName?: string; lastName?: string; role?: UserRole; isActive?: boolean }) { return this.svc.updateAdminUser(id, b); }
  @Get('audit-logs') async al(@Query('page') p?: number, @Query('limit') l?: number, @Query('action') a?: string, @Query('userId') u?: string, @Query('entityType') e?: string) { return this.svc.getAuditLogs(p ? +p : 1, l ? +l : 20, a, u, e); }

  // ==================== Chatbot Q&A Management ====================

  @Get('tax-questions') async tq() { return this.svc.getTaxQuestions(); }
  @Post('tax-questions') async ctq(@Body() b: { question: string; description?: string; sortOrder?: number; isActive?: boolean }) { return this.svc.createTaxQuestion(b); }
  @Patch('tax-questions/:id') async utq(@Param('id') id: string, @Body() b: { question?: string; description?: string; sortOrder?: number; isActive?: boolean }) { return this.svc.updateTaxQuestion(id, b); }
  @Delete('tax-questions/:id') async dtq(@Param('id') id: string) { return this.svc.deleteTaxQuestion(id); }

  @Post('tax-question-options') async ctqo(@Body() b: { questionId: string; label: string; value: string; sortOrder?: number; isActive?: boolean }) { return this.svc.createTaxQuestionOption(b); }
  @Patch('tax-question-options/:id') async utqo(@Param('id') id: string, @Body() b: { label?: string; value?: string; sortOrder?: number; isActive?: boolean }) { return this.svc.updateTaxQuestionOption(id, b); }
  @Delete('tax-question-options/:id') async dtqo(@Param('id') id: string) { return this.svc.deleteTaxQuestionOption(id); }

  @Get('tax-question-flows') async tqf() { return this.svc.getTaxQuestionFlows(); }
  @Post('tax-question-flows') async ctqf(@Body() b: { fromQuestionId: string; toQuestionId: string; optionId?: string; condition?: string; sortOrder?: number }) { return this.svc.createTaxQuestionFlow(b); }
  @Delete('tax-question-flows/:id') async dtqf(@Param('id') id: string) { return this.svc.deleteTaxQuestionFlow(id); }

  @Get('tax-assistant-results') async tar() { return this.svc.getTaxAssistantResults(); }
  @Post('tax-assistant-results') async ctar(@Body() b: { name: string; title: string; description: string; ruleIds?: string[]; action?: string; severity?: string; isActive?: boolean }) { return this.svc.createTaxAssistantResult(b); }
  @Patch('tax-assistant-results/:id') async utar(@Param('id') id: string, @Body() b: { name?: string; title?: string; description?: string; ruleIds?: string[]; action?: string; severity?: string; isActive?: boolean }) { return this.svc.updateTaxAssistantResult(id, b); }
  @Delete('tax-assistant-results/:id') async dtar(@Param('id') id: string) { return this.svc.deleteTaxAssistantResult(id); }

  // ==================== Articles Management ====================

  @Get('articles') async ga(@Query('page') p?: number, @Query('limit') l?: number, @Query('search') s?: string) { return this.svc.getArticles(p ? +p : 1, l ? +l : 20, s); }
  @Get('articles/:id') async gai(@Param('id') id: string) { return this.svc.getArticleById(id); }
  @Post('articles') async caA(@Body() b: { title: string; slug?: string; excerpt?: string; content: string; featuredImage?: string; status?: string; metaTitle?: string; metaDescription?: string; categoryId?: string }, @Request() req: any) { if (!req.user?.id) throw new UnauthorizedException('کاربر احراز هویت نشده'); return this.svc.createArticle({ ...b, authorId: req.user.id }, req.user.id, req.ip); }
  @Patch('articles/:id') async uaA(@Param('id') id: string, @Body() b: { title?: string; excerpt?: string; content?: string; featuredImage?: string; status?: string; metaTitle?: string; metaDescription?: string; categoryId?: string }, @Request() req: any) { return this.svc.updateArticle(id, b, req.user?.id, req.ip); }
  @Delete('articles/:id') async da(@Param('id') id: string, @Request() req: any) { return this.svc.deleteArticle(id, req.user?.id, req.ip); }
  @Get('categories') async gc() { return this.svc.getCategories(); }

  // ==================== Videos Management ====================

  @Get('videos') async gv(@Query('page') p?: number, @Query('limit') l?: number, @Query('search') s?: string) { return this.svc.getVideos(p ? +p : 1, l ? +l : 20, s); }
  @Post('videos') async cvA(@Body() b: { title: string; slug?: string; description?: string; url: string; thumbnail?: string; duration?: number; status?: string; categoryId?: string }, @Request() req: any) { if (!req.user?.id) throw new UnauthorizedException('کاربر احراز هویت نشده'); return this.svc.createVideo({ ...b, authorId: req.user.id }, req.user.id, req.ip); }
  @Patch('videos/:id') async uvA(@Param('id') id: string, @Body() b: { title?: string; description?: string; url?: string; thumbnail?: string; duration?: number; status?: string; categoryId?: string }, @Request() req: any) { return this.svc.updateVideo(id, b, req.user?.id, req.ip); }
  @Delete('videos/:id') async dv(@Param('id') id: string, @Request() req: any) { return this.svc.deleteVideo(id, req.user?.id, req.ip); }

  // ==================== MiniBooks Management ====================

  @Get('minibooks') async gmb(@Query('page') p?: number, @Query('limit') l?: number, @Query('search') s?: string) { return this.svc.getMiniBooks(p ? +p : 1, l ? +l : 20, s); }
  @Post('minibooks') async cmb(@Body() b: { title: string; slug?: string; description?: string; fileUrl: string; coverImage?: string; pageCount?: number; status?: string; categoryId?: string }, @Request() req: any) { if (!req.user?.id) throw new UnauthorizedException('کاربر احراز هویت نشده'); return this.svc.createMiniBook({ ...b, authorId: req.user.id }, req.user.id, req.ip); }
  @Patch('minibooks/:id') async umb(@Param('id') id: string, @Body() b: { title?: string; description?: string; fileUrl?: string; coverImage?: string; pageCount?: number; status?: string; categoryId?: string }, @Request() req: any) { return this.svc.updateMiniBook(id, b, req.user?.id, req.ip); }
  @Delete('minibooks/:id') async dmb(@Param('id') id: string, @Request() req: any) { return this.svc.deleteMiniBook(id, req.user?.id, req.ip); }

  // ==================== Consultation Services Management ====================

  @Get('consultation-services') async gcs() { return this.svc.getConsultationServices(); }
  @Post('consultation-services') async ccs(@Body() b: { name: string; slug?: string; description: string; duration: number; price?: number; isActive?: boolean; sortOrder?: number }, @Request() req: any) { return this.svc.createConsultationService(b, req.user?.id, req.ip); }
  @Patch('consultation-services/:id') async ucs(@Param('id') id: string, @Body() b: { name?: string; description?: string; duration?: number; price?: number; isActive?: boolean; sortOrder?: number }, @Request() req: any) { return this.svc.updateConsultationService(id, b, req.user?.id, req.ip); }
  @Delete('consultation-services/:id') async dcs(@Param('id') id: string, @Request() req: any) { return this.svc.deleteConsultationService(id, req.user?.id, req.ip); }

  // ==================== Tax Topics Management ====================

  @Get('tax-topics') async gtt() { return this.svc.getTaxTopics(); }
  @Post('tax-topics') async ctt(@Body() b: { name: string; slug?: string; description?: string; sortOrder?: number; isActive?: boolean }, @Request() req: any) { return this.svc.createTaxTopic(b, req.user?.id, req.ip); }
  @Patch('tax-topics/:id') async utt(@Param('id') id: string, @Body() b: { name?: string; description?: string; sortOrder?: number; isActive?: boolean }, @Request() req: any) { return this.svc.updateTaxTopic(id, b, req.user?.id, req.ip); }
  @Delete('tax-topics/:id') async dtt(@Param('id') id: string, @Request() req: any) { return this.svc.deleteTaxTopic(id, req.user?.id, req.ip); }

  // ==================== Tax Sources Management ====================

  @Get('tax-sources') async gts() { return this.svc.getTaxSources(); }
  @Post('tax-sources') async cts(@Body() b: { name: string; url?: string; officialName?: string; description?: string; isActive?: boolean }, @Request() req: any) { return this.svc.createTaxSource(b, req.user?.id, req.ip); }
  @Patch('tax-sources/:id') async uts(@Param('id') id: string, @Body() b: { name?: string; url?: string; officialName?: string; description?: string; isActive?: boolean }, @Request() req: any) { return this.svc.updateTaxSource(id, b, req.user?.id, req.ip); }
  @Delete('tax-sources/:id') async dts(@Param('id') id: string, @Request() req: any) { return this.svc.deleteTaxSource(id, req.user?.id, req.ip); }

  // ==================== Tax Rules Management ====================

  @Get('tax-rules') async gtr(@Query('topicId') tid?: string, @Query('page') p?: number, @Query('limit') l?: number) { return this.svc.getTaxRulesAdmin(tid, p ? +p : 1, l ? +l : 50); }
  @Post('tax-rules') async ctr(@Body() b: { topicId: string; name: string; slug?: string; description?: string; content: string; sourceId: string; effectiveFrom: string; effectiveTo?: string; status?: string }, @Request() req: any) { return this.svc.createTaxRule(b, req.user?.id, req.ip); }
  @Patch('tax-rules/:id') async utr(@Param('id') id: string, @Body() b: { topicId?: string; name?: string; description?: string; status?: string }, @Request() req: any) { return this.svc.updateTaxRule(id, b, req.user?.id, req.ip); }
  @Delete('tax-rules/:id') async dtr(@Param('id') id: string, @Request() req: any) { return this.svc.deleteTaxRule(id, req.user?.id, req.ip); }

  // ==================== Tax Rule Versions Management ====================

  @Post('tax-rule-versions') async ctrv(@Body() b: { ruleId: string; content: string; sourceId: string; effectiveFrom: string; effectiveTo?: string; status?: string; reviewNotes?: string }) { return this.svc.createTaxRuleVersion(b); }
  @Patch('tax-rule-versions/:id') async utrv(@Param('id') id: string, @Body() b: { content?: string; status?: string; effectiveFrom?: string; effectiveTo?: string; reviewNotes?: string; publishedById?: string }, @Request() req: any) { return this.svc.updateTaxRuleVersion(id, { ...b, publishedById: req.user?.id }); }
  @Delete('tax-rule-versions/:id') async dtrv(@Param('id') id: string) { return this.svc.deleteTaxRuleVersion(id); }
}
