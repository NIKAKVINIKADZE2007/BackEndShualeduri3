import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { isValidObjectId } from 'mongoose';
import { Observable } from 'rxjs';

@Injectable()
export class hasUserId implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.headers.userid;
    if (!userId || !isValidObjectId(userId)) {
      throw new BadRequestException('permiton denied');
    }

    return true;
  }
}
