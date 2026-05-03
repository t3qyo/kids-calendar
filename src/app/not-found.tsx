import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
      <h2 className="text-xl font-semibold">ページが見つかりません</h2>
      <p className="text-sm text-gray-600">
        お探しのページは存在しないか、削除された可能性があります。
      </p>
      <Link
        href="/"
        className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
      >
        トップに戻る
      </Link>
    </main>
  );
}
