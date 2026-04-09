import { Link } from 'react-router-dom';

interface ComingSoonProps {
  /** What feature is temporarily unavailable. Displayed in the heading. */
  feature?: string;
}

/**
 * Full-page placeholder shown for features whose backend endpoints have
 * not been implemented yet in the Python API rewrite. Replaces the
 * original page at the route level so nothing mounts that might try to
 * call a 404-ing endpoint.
 *
 * Tracked under FE-003. Remove the corresponding route override in
 * App.tsx once the backing endpoints ship (see BE-013/014/015/020/021+).
 */
export default function ComingSoon({ feature = 'This section' }: ComingSoonProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-6xl mb-2" aria-hidden="true">
          🚧
        </div>
        <h1 className="text-3xl font-bold text-white">
          {feature} — Coming Soon
        </h1>
        <p className="text-gray-400 leading-relaxed">
          Мы переписываем бэкенд на Python и этот раздел пока не подключён.
          Он вернётся, как только соответствующие endpoint&apos;ы будут реализованы.
        </p>
        <Link
          to="/dashboard"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
