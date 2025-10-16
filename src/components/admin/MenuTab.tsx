import { Plus, Edit2, Trash2 } from 'lucide-react';
import { MenuTabProps } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

export function MenuTab({
  categories,
  products,
  onAddCategory,
  onAddProduct,
  onEditCategory,
  onEditProduct,
  onDeleteCategory,
  onDeleteProduct
}: MenuTabProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 px-2 sm:px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-gray-900">{t('manageMenu')}</h3>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={onAddCategory}
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="whitespace-nowrap">{t('add')} {t('categoryLabel')}</span>
          </button>
          <button
            onClick={onAddProduct}
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="whitespace-nowrap">{t('add')} {t('productLabel')}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-4">{t('categories')}</h4>
          <div className="space-y-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{category.name_en}</p>
                  <p className="text-sm text-gray-600 truncate">{category.name_no}</p>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => onEditCategory(category)}
                    className="p-2 rounded-md hover:bg-gray-100 touch-manipulation"
                    title={t('edit')}
                    aria-label={t('edit')}
                  >
                    <Edit2 className="w-4 h-4 text-blue-600" />
                  </button>
                  <button
                    onClick={() => {
                      const msg = t('confirmDeleteCategoryWithProducts');
                      if (window.confirm(msg)) {
                        onDeleteCategory(category.id);
                      }
                    }}
                    className="p-2 rounded-md hover:bg-gray-100 touch-manipulation"
                    title={t('delete')}
                    aria-label={t('delete')}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-4">{t('productLabel')}</h4>
          <div className="space-y-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex flex-col sm:flex-row sm:items-start justify-between p-3 bg-gray-50 rounded-lg gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{product.name_en}</p>
                  <p className="text-sm text-gray-600 truncate">{product.name_no}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-3">
                    <p className="text-sm text-gray-900">{t('price')}: {product.price} kr</p>
                    <p className="text-xs text-gray-500">{t('prepTime')}: {product.prep_time} {t('minutes')}</p>
                    {product.category_name && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{product.category_name}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-0">
                  <button
                    onClick={() => onEditProduct(product)}
                    className="p-2 rounded-md hover:bg-gray-100 touch-manipulation"
                    title={t('edit')}
                    aria-label={t('edit')}
                  >
                    <Edit2 className="w-4 h-4 text-blue-600" />
                  </button>
                  <button
                    onClick={() => onDeleteProduct(product.id)}
                    className="p-2 rounded-md hover:bg-gray-100 touch-manipulation"
                    title={t('delete')}
                    aria-label={t('delete')}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}