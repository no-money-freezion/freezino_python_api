import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import showToast from '../utils/toast';

// Zod validation schema
const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Имя должно быть не менее 2 символов')
    .max(255, 'Имя не должно превышать 255 символов')
    .trim(),
  email: z
    .string()
    .email('Введите корректный email')
    .max(255, 'Email не должен превышать 255 символов'),
  message: z
    .string()
    .min(10, 'Сообщение должно быть не менее 10 символов')
    .max(2000, 'Сообщение не должно превышать 2000 символов')
    .trim(),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const ContactForm = () => {
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    mode: 'onBlur',
  });

  const messageValue = watch('message', '');

  // Handle form submission
  const onSubmit = async (data: ContactFormData) => {
    setSubmitSuccess(false);

    try {
      const response = await axios.post('/api/contact', data);

      if (response.data.success) {
        setSubmitSuccess(true);
        showToast.success('Спасибо! Ваше сообщение отправлено.');
        reset();

        // Hide success message after 5 seconds
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 5000);
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
        'Произошла ошибка при отправке сообщения. Попробуйте позже.';
      showToast.error(errorMessage);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border-2 border-gray-700 shadow-2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name Field */}
        <div>
          <label
            htmlFor="name"
            className="block text-gray-300 font-semibold mb-2"
          >
            Имя *
          </label>
          <input
            type="text"
            id="name"
            {...register('name')}
            className={`w-full px-4 py-3 bg-gray-700 border ${
              errors.name ? 'border-red-500' : 'border-gray-600'
            } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary transition-colors`}
            placeholder="Ваше имя"
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="mt-2 text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block text-gray-300 font-semibold mb-2"
          >
            Email *
          </label>
          <input
            type="email"
            id="email"
            {...register('email')}
            className={`w-full px-4 py-3 bg-gray-700 border ${
              errors.email ? 'border-red-500' : 'border-gray-600'
            } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary transition-colors`}
            placeholder="your@email.com"
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="mt-2 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Message Field */}
        <div>
          <label
            htmlFor="message"
            className="block text-gray-300 font-semibold mb-2"
          >
            Сообщение *
          </label>
          <textarea
            id="message"
            {...register('message')}
            rows={6}
            className={`w-full px-4 py-3 bg-gray-700 border ${
              errors.message ? 'border-red-500' : 'border-gray-600'
            } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary transition-colors resize-none`}
            placeholder="Ваше сообщение..."
            disabled={isSubmitting}
          />
          <div className="flex justify-between items-center mt-2">
            {errors.message && (
              <p className="text-sm text-red-500">{errors.message.message}</p>
            )}
            <p
              className={`text-sm ${
                messageValue.length > 2000 ? 'text-red-500' : 'text-gray-400'
              } ml-auto`}
            >
              {messageValue.length}/2000
            </p>
          </div>
        </div>

        {/* Success Message */}
        {submitSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-600/20 border border-green-500 rounded-lg p-4"
          >
            <p className="text-green-400 flex items-center">
              <span className="text-2xl mr-2">✅</span>
              Спасибо! Ваше сообщение отправлено. Мы свяжемся с вами в ближайшее время.
            </p>
          </motion.div>
        )}

        {/* Submit Button */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isSubmitting}
          className={`w-full font-bold py-4 rounded-xl transition-all ${
            isSubmitting
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg hover:shadow-primary/50'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin h-5 w-5 mr-3"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Отправка...
            </span>
          ) : (
            '📧 Отправить сообщение'
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default ContactForm;
