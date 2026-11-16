import { Toaster, toaster } from '@/components/ui/toast';
import { act, render, screen } from '@testing-library/react';
import { StrictMode } from 'react';

afterEach(() => {
  act(() => toaster.remove());
});

it.each([false, true])(
  'updates a promise toast when it fails (strict mode: %s)',
  async (strict) => {
    render(
      strict ? (
        <StrictMode>
          <Toaster />
        </StrictMode>
      ) : (
        <Toaster />
      ),
    );
    let reject!: (error: Error) => void;
    act(() => {
      toaster.promise(new Promise((_, r) => (reject = r)), {
        loading: { title: 'Uploading…' },
        success: { title: 'Uploaded' },
        error: (error) => ({ title: 'Upload failed', description: (error as Error).message }),
      });
    });
    expect(await screen.findByText('Uploading…')).toBeInTheDocument();
    await act(async () => reject(new Error('Server returned 500')));
    expect(await screen.findByText('Server returned 500')).toBeInTheDocument();
    expect(screen.getByText('Upload failed')).toBeInTheDocument();
    expect(screen.queryByText('Uploading…')).not.toBeInTheDocument();
  },
);

it('updates a promise toast created behind a burst of toasts', async () => {
  render(<Toaster />);
  let reject!: (error: Error) => void;
  act(() => {
    for (let i = 1; i <= 8; i++) toaster.info({ title: `Burst ${i}` });
    toaster.promise(new Promise((_, r) => (reject = r)), {
      loading: { title: 'Uploading…' },
      error: (error) => ({ title: 'Upload failed', description: (error as Error).message }),
    });
  });
  await act(async () => reject(new Error('Server returned 500')));
  expect(await screen.findByText('Upload failed')).toBeInTheDocument();
  expect(screen.queryByText('Uploading…')).not.toBeInTheDocument();
  const ids = toaster.getVisibleToasts().map((t) => t.id);
  expect(new Set(ids).size).toBe(ids.length);
});
