import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PhraseDemo from '@/components/PhraseDemo';

describe('PhraseDemo', () => {
  it('renders with EN example', () => {
    render(<PhraseDemo />);
    const textarea = screen.getByRole('textbox');
    expect((textarea as HTMLTextAreaElement).value).toContain('delve into');
  });

  it('shows findings counter', async () => {
    render(<PhraseDemo />);
    await waitFor(
      () => expect(screen.getByText(/findings/i)).toBeInTheDocument(),
      { timeout: 1000 },
    );
  });

  it('updates findings when text changes', async () => {
    render(<PhraseDemo />);
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'A clean sentence with no AI tells.' },
    });
    await waitFor(
      () => expect(screen.getByText(/0 findings/i)).toBeInTheDocument(),
      { timeout: 1000 },
    );
  });
});
