import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) {}

  @Get(':orderId')
  async getInvoiceByOrderId(
    @Param('orderId') orderId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.invoicesService.findByOrderId(orderId, user);
  }
}
