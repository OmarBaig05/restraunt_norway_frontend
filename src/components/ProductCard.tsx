import { motion } from 'framer-motion';
import { ShoppingCart, Clock, ImageOff } from 'lucide-react';
import { ProductCardProps } from '../types';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useState } from 'react';

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = () => {
    addToCart(product.id, 1);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow min-h-full flex flex-col"
    >
      <div className="relative bg-gray-200 h-44 sm:h-48 md:h-56 lg:h-48 xl:h-56 flex-shrink-0">
        {product.image && !imageError ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <ImageOff className="w-12 h-12 text-gray-300" />
          </div>
        )}
        {!product.available && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold">
              {t('outOfStock')}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        <div className="mb-3">
          <h3 className="text-base sm:text-lg md:text-lg font-semibold text-gray-900 mb-2 truncate">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-sm sm:text-sm text-gray-600 mb-0 max-h-[3.6rem] overflow-hidden">
              {product.description}
            </p>
          )}
        </div>

        <div className="mt-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg sm:text-xl font-bold text-red-600">
              {product.price} kr
            </span>

            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              <span className="text-sm">{product.preparationTime} min</span>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!product.available}
            aria-label={t('addToCart')}
            className={`w-full py-2 sm:py-3 px-4 sm:px-5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500 ${
              product.available
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{t('addToCart')}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}