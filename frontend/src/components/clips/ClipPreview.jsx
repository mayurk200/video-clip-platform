/**
 * Clip preview — video player with active caption overlay.
 */
export default function ClipPreview({ clip, videoRef }) {
  if (!clip) return null;

  return (
    <div className="relative aspect-[9/16] max-h-[70vh] bg-black rounded-xl overflow-hidden mx-auto">
      <video
        ref={videoRef}
        src={clip.videoUrl}
        className="w-full h-full object-contain"
        playsInline
      />

      {/* Caption overlay placeholder */}
      <div className="absolute bottom-8 left-4 right-4 text-center">
        <p className="text-white text-lg font-bold drop-shadow-lg">
          {/* Captions rendered here during playback */}
        </p>
      </div>
    </div>
  );
}
