import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stock')
  async getStock() {
    return this.adminService.getStockDashboard();
  }

  @Get('audit-logs')
  async getAuditLogs(@Query('limit') limit?: string) {
    const parsed = limit ? parseInt(limit, 10) : 50;
    return this.adminService.getAuditLogs(parsed);
  }

  @Get('stock-logs')
  async getStockLogs(@Query('limit') limit?: string) {
    const parsed = limit ? parseInt(limit, 10) : 50;
    return this.adminService.getStockLogs(parsed);
  }
}
