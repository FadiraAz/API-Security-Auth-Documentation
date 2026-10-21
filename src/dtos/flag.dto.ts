import { flagStatuses } from '../db/schema.ts';
import { z } from 'zod';
import { optionalId, requiredError, strictBody } from './common.dto.ts';

const statusError = `status harus salah satu dari: ${flagStatuses.join(', ')}`;

export const updateFlagStatusDto = strictBody({
  status: z.enum(flagStatuses, { error: (issue) => (issue.input === undefined ? requiredError('status')(issue) : statusError) }),
});

export const listFlagQueryDto = z.object({
  status: z.enum(flagStatuses, { error: statusError }).optional(),
  review_id: optionalId('review_id'),
});

export type UpdateFlagStatusInput = z.infer<typeof updateFlagStatusDto>;
export type ListFlagQuery = z.infer<typeof listFlagQueryDto>;
