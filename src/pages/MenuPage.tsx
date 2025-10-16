import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';
import { Category, Product, ProductUI } from '../types';
import { ProductCard } from '../components/ProductCard';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function MenuPage() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const catContainerRef = useRef<HTMLDivElement | null>(null);
  const autoIndexRef = useRef(0);

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      setLoading(true);
      const [categoriesData, productsData] = await Promise.all([
        api.categories.getAll(),
        api.products.getAll(),
      ]);

      setCategories(categoriesData || []);
      setProducts(productsData || []);
    } catch (error) {
      console.error('Error loading menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const convertToProductUI = (product: Product): ProductUI => {
    return {
      ...product,
      name: t(`product-name-${product.id}`, product.name_no, product.name_en),
      description: t(`product-desc-${product.id}`, product.description_no || '', product.description_en || ''),
      image: product.image_url,
      available: true,
      preparationTime: product.prep_time,
      categoryName: product.category_name,
      nameEn: product.name_en,
      nameNo: product.name_no,
      descriptionEn: product.description_en,
      descriptionNo: product.description_no,
      imageUrl: product.image_url,
      prepTime: product.prep_time
    };
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category_name === selectedCategory;

    const matchesSearch = searchTerm === '' ||
      product.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.name_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description_en && product.description_en.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.description_no && product.description_no.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 leading-tight">
            {t('menu')}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-2">
            {t('menuHeaderDesc',
              'Oppdag vårt deilige utvalg av nytilberedte retter',
              'Discover our delicious selection of freshly prepared dishes')}
          </p>
        </motion.div>

        {/* Search + category controls */}
        <div className="mb-6 sm:mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('searchPlaceholder', 'Søk i menyen...', 'Search menu items...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm sm:text-base"
                aria-label={t('searchPlaceholder', 'Search menu')}
              />
            </div>

            {/* category select for very small screens */}
            <div className="sm:hidden">
              <label htmlFor="category-select" className="sr-only">Select category</label>
              <select
                id="category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full py-3 px-3 border border-gray-200 rounded-xl text-sm bg-white"
                aria-label="Select category"
              >
                <option value="all">{t('allLabel', 'Alle', 'All')}</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name_en}>
                    {t(`category-${cat.id}`, cat.name_no, cat.name_en)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Pills (horizontal scroll when overflow) */}
          <div className="hidden sm:block">
            <div
              ref={catContainerRef}
              className="flex items-center gap-3 overflow-x-auto py-2 px-1 -mx-1 scrollbar-hide"
              style={{
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
              aria-label="Categories"
            >
              <div className="flex-shrink-0">
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    autoIndexRef.current = 0;
                  }}
                  className={`px-3 sm:px-4 py-1.5 rounded-full font-medium text-sm transition-all duration-200 whitespace-nowrap border ${
                    selectedCategory === 'all'
                      ? 'bg-red-600 text-white border-red-600 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {t('allLabel', 'Alle', 'All')}
                </button>
              </div>

              {categories.map((category, idx) => (
                <div key={category.id} className="flex-shrink-0">
                  <button
                    onClick={() => {
                      setSelectedCategory(category.name_en);
                      autoIndexRef.current = idx + 1;
                    }}
                    className={`px-3 sm:px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap border ${
                      selectedCategory === category.name_en
                        ? 'bg-red-600 text-white border-red-600 shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    aria-pressed={selectedCategory === category.name_en}
                  >
                    {t(`category-${category.id}`, category.name_no, category.name_en)}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory + searchTerm}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
          >
            {filteredProducts.map((product) => (
              <div key={product.id} className="w-full">
                <ProductCard
                  product={convertToProductUI(product)}
                />
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-gray-500 text-base sm:text-lg">
              {t('noProductsFound',
                'Ingen produkter funnet som matcher kriteriene dine.',
                'No products found matching your criteria.')}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}