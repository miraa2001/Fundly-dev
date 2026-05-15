export default function LoadingScreen({ message }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-5">
      <div className="page-panel max-w-md text-center">
        <p className="section-kicker">Fundly</p>
        <p className="mt-4 text-lg text-ink">{message}</p>
      </div>
    </div>
  );
}
