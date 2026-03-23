import fundlyLogo from '../../../fundly-logo.png';

export default function AuthLoadingScreen({ message = 'Checking your Fundly session...' }) {
  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#011826] px-4 py-6">
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,#011826_0%,#0C2A46_52%,#011826_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(166,122,83,0.14),transparent_22%),radial-gradient(circle_at_82%_20%,rgba(12,42,70,0.2),transparent_18%),radial-gradient(circle_at_74%_78%,rgba(64,31,20,0.1),transparent_16%)]" />
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(1,24,38,0.88),rgba(12,42,70,0.76))] p-8 text-center shadow-[0_30px_80px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
        <img
          src={fundlyLogo}
          alt="Fundly"
          className="mx-auto h-auto w-[9rem] drop-shadow-[0_14px_28px_rgba(0,0,0,0.32)]"
        />
        <h1 className="mt-8 text-3xl font-bold tracking-[-0.03em] text-white">Loading Fundly</h1>
        <p className="mt-3 text-base text-white/72">{message}</p>
        <div className="mt-8 flex justify-center">
          <span
            className="h-10 w-10 animate-spin rounded-full border-[3px] border-white/20 border-t-[#A67A53]"
            aria-hidden="true"
          />
        </div>
      </div>
    </main>
  );
}
