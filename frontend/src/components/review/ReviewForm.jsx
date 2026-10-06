import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Alert, Button, FormField } from '../ui/index.js';
import { reviewSchema } from '../../validation/schemas.js';

const REVIEW_FIELDS = ['rating', 'comment'];

/** Creates or edits a review and displays server eligibility and conflict messages. */
export default function ReviewForm({ review, onSave, onCancel }) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(reviewSchema),
    mode: 'onBlur',
    defaultValues: {
      rating: review?.rating ?? 5,
      comment: review?.comment ?? '',
    },
  });

  async function submit(values) {
    try {
      await onSave({
        rating: values.rating,
        comment: values.comment?.trim() ?? '',
      });
    } catch (error) {
      const unhandledErrors = [];
      for (const [field, message] of Object.entries(error?.fieldErrors ?? {})) {
        if (REVIEW_FIELDS.includes(field)) {
          setError(field, { type: 'server', message });
        } else {
          unhandledErrors.push(message);
        }
      }
      if (
        unhandledErrors.length ||
        !Object.keys(error?.fieldErrors ?? {}).length
      ) {
        setError('root.serverError', {
          type: 'server',
          message: error?.message ?? 'Unable to save your review. Try again.',
        });
      }
    }
  }

  return (
    <form className="review-form" onSubmit={handleSubmit(submit)} noValidate>
      <h3>{review ? 'Edit your review' : 'Write a review'}</h3>
      {errors.root?.serverError?.message && (
        <Alert>{errors.root.serverError.message}</Alert>
      )}
      <FormField label="Rating" htmlFor="review-rating" error={errors.rating}>
        <select className="ui-input" id="review-rating" {...register('rating')}>
          <option value="">Choose a rating</option>
          {[5, 4, 3, 2, 1].map((rating) => (
            <option key={rating} value={rating}>
              {rating} {rating === 1 ? 'star' : 'stars'}
            </option>
          ))}
        </select>
      </FormField>
      <FormField
        label="Comment (optional)"
        htmlFor="review-comment"
        error={errors.comment}
        hint="Up to 1000 characters."
      >
        <textarea
          className="ui-input review-form__comment"
          id="review-comment"
          maxLength={1000}
          rows={5}
          {...register('comment')}
        />
      </FormField>
      <div className="review-form__actions">
        <Button
          type="submit"
          loading={isSubmitting}
          loadingLabel="Saving review"
        >
          {review ? 'Save review' : 'Submit review'}
        </Button>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
