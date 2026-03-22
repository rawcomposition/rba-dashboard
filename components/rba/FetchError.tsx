type Props = {
  reload: () => void;
  message?: string;
};

export default function FetchError({ reload, message }: Props) {
  return (
    <div className="rounded-xl border border-red-100 bg-red-50 px-6 py-8 text-center mb-8">
      <p className="text-sm font-semibold text-red-800">Something went wrong</p>
      {message && <p className="mt-1 text-xs text-red-600/80">{message}</p>}
      <button
        type="button"
        className="mt-4 rounded-full bg-red-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition-colors"
        onClick={reload}
      >
        Try Again
      </button>
    </div>
  );
}
