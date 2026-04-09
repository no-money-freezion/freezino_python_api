import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface ErrorPageProps {
  statusCode?: number;
  message?: string;
}

const ErrorPage = ({ statusCode = 500, message }: ErrorPageProps) => {
  const { t } = useTranslation();

  const errorMessages: Record<number, { title: string; description: string }> = {
    500: {
      title: t('error.500.title', 'Internal Server Error'),
      description: t('error.500.description', 'Something went wrong on our end. Please try again later.'),
    },
    503: {
      title: t('error.503.title', 'Service Unavailable'),
      description: t('error.503.description', 'The service is temporarily unavailable. Please try again in a few moments.'),
    },
  };

  const errorContent = errorMessages[statusCode] || errorMessages[500];

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark">
      <div className="text-center px-4">
        <h1 className="text-9xl font-bold text-primary mb-4">{statusCode}</h1>
        <h2 className="text-3xl font-semibold text-white mb-4">
          {message || errorContent.title}
        </h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          {errorContent.description}
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-700 text-white font-semibold py-3 px-8 rounded-lg hover:bg-gray-600 transition-colors"
          >
            {t('error.retry', 'Try Again')}
          </button>
          <Link
            to="/dashboard"
            className="bg-primary text-white font-semibold py-3 px-8 rounded-lg hover:bg-red-700 transition-colors inline-block"
          >
            {t('error.goHome', 'Go Home')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
