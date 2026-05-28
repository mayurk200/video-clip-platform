import DropzoneUploader from "@/components/upload/DropzoneUploader";

/**
 * Upload page — full-page drag and drop uploader.
 */
export default function Upload() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Upload Video</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Upload a long-form video and our AI will generate viral short clips automatically.
        </p>
      </div>
      <DropzoneUploader />
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">What happens next?</h3>
        <ol className="space-y-2 text-sm text-[var(--color-text-secondary)]">
          <li className="flex items-start gap-2"><span className="text-[var(--color-primary)] font-bold">1.</span> Audio extraction & transcription with word timestamps</li>
          <li className="flex items-start gap-2"><span className="text-[var(--color-primary)] font-bold">2.</span> AI analysis to detect viral moments & score engagement</li>
          <li className="flex items-start gap-2"><span className="text-[var(--color-primary)] font-bold">3.</span> Automatic clip generation with vertical reframing</li>
          <li className="flex items-start gap-2"><span className="text-[var(--color-primary)] font-bold">4.</span> Caption rendering, hook generation & thumbnail extraction</li>
        </ol>
      </div>
    </div>
  );
}
