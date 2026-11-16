import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { toaster } from '@/components/ui/toast';
import { useEffect, useState } from 'react';
import { Demo, Section } from '../Section';

function fakeRequest(fail: boolean) {
  return new Promise<string>((resolve, reject) =>
    setTimeout(
      () => (fail ? reject(new Error('Server returned 500')) : resolve('report.pdf')),
      1500,
    ),
  );
}

export function FeedbackSection() {
  const [progress, setProgress] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setProgress((value) => (value >= 100 ? 0 : value + 15)), 1200);
    return () => clearInterval(id);
  }, []);

  return (
    <Section id="feedback" title="Feedback" description="Toasts, progress and loading states.">
      <Demo title="Toasts">
        <Button
          variant="outline"
          onClick={() => toaster.success({ title: 'Saved', description: 'All changes stored.' })}
        >
          Success
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toaster.error({ title: 'Payment failed', description: 'Card was declined.' })
          }
        >
          Error
        </Button>
        <Button variant="outline" onClick={() => toaster.warning({ title: 'Storage almost full' })}>
          Warning
        </Button>
        <Button variant="outline" onClick={() => toaster.info({ title: 'New version available' })}>
          Info
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toaster.promise(fakeRequest(false), {
              loading: { title: 'Exporting…' },
              success: (file) => ({ title: 'Export ready', description: file }),
              error: (error) => ({ title: 'Export failed', description: String(error) }),
            })
          }
        >
          Promise (resolves)
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toaster.promise(fakeRequest(true), {
              loading: { title: 'Uploading…' },
              success: { title: 'Uploaded' },
              error: (error) => ({ title: 'Upload failed', description: (error as Error).message }),
            })
          }
        >
          Promise (fails)
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            for (let i = 1; i <= 8; i++) toaster.info({ title: `Burst ${i} of 8` });
          }}
        >
          Burst ×8
        </Button>
        <Button variant="ghost" onClick={() => toaster.dismiss()}>
          Dismiss all
        </Button>
      </Demo>
      <Demo title="Progress">
        <div className="grid w-full max-w-md gap-4">
          <Progress value={progress} label="Uploading" showValue />
          <Progress value={null} label="Waiting for server" />
        </div>
      </Demo>
      <Demo title="Skeleton">
        <div className="flex w-full max-w-md items-center gap-4">
          {loading ? (
            <>
              <Skeleton className="size-12 rounded-full" />
              <div className="grid flex-1 gap-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </>
          ) : (
            <p className="text-sm">Loaded content.</p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => setLoading((value) => !value)}>
          {loading ? 'Finish loading' : 'Show skeleton'}
        </Button>
      </Demo>
    </Section>
  );
}
