import { AppError } from '../../lib/errors.js';

export class ShortCodeAllocationError extends AppError {
  constructor() {
    super(500, 'Unable to allocate a unique short code', 'SHORT_CODE_ALLOCATION_FAILED');
  }
}
