import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui';
import { buildSubmission } from '@/domain/submission/builder';
import { submissionsService } from '@/services';
import type { FormDefinition } from '@/domain/form/types';
import { useFillerStore } from '../store/fillerStore';
import { useFormState } from '../hooks/useFormState';

interface Props {
  readonly form: FormDefinition;
  readonly onAttemptSubmit: () => void;
}

export const SubmissionToolbar = ({ form, onAttemptSubmit }: Props) => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const { values, visibility, isValid, errors } = useFormState(form);
  const reset = useFillerStore((s) => s.reset);

  const handleSubmit = () => {
    onAttemptSubmit();
    if (!isValid) return;
    setSubmitting(true);
    try {
      const submission = buildSubmission({
        form,
        state: { values, touched: {} },
        visibility,
      });
      submissionsService.save(submission);
      reset();
      navigate(`/submissions/${submission.id}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-between border-t border-slate-200 pt-4">
      <p className="text-xs text-slate-500">
        {errors.size === 0
          ? 'All required fields look good.'
          : `${errors.size} issue${errors.size === 1 ? '' : 's'} to resolve before submitting.`}
      </p>
      <Button onClick={handleSubmit} disabled={submitting}>
        {submitting ? 'Submitting…' : 'Submit'}
      </Button>
    </div>
  );
};
