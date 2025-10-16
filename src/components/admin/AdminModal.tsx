import { motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Upload, Link as LinkIcon } from 'lucide-react';
import { AdminModalProps } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useState, useRef } from 'react';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

export function AdminModal({
  isOpen,
  modalType,
  editingItem,
  categories,
  saveSuccess,
  saveError,
  onClose,
  onSubmit
}: AdminModalProps) {
  const { t } = useLanguage();
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const getTitle = () => {
    const action = editingItem ? t('edit') : t('add');
    const thing =
      modalType === 'category' ? t('categoryLabel') :
      modalType === 'product' ? t('productLabel') :
      modalType === 'shopInfo' ? t('shopInfoLabel') :
      t('workingHoursLabel');
    return `${action} ${thing}`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError('');
    
    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError('Invalid file type. Please select a JPEG, PNG, GIF, or WebP image.');
      setSelectedFile(null);
      setImagePreview('');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setUploadError('File size too large. Maximum size is 10MB.');
      setSelectedFile(null);
      setImagePreview('');
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearFileSelection = () => {
    setSelectedFile(null);
    setImagePreview('');
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg"
      >
        <div className="flex justify-between items-start mb-4 gap-4">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 break-words">
            {getTitle()}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded"
            aria-label={t('close') || 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {saveSuccess && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span className="text-sm">{t('savedSuccess')}</span>
          </div>
        )}
        
        {saveError && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span className="text-sm">{saveError}</span>
          </div>
        )}
        
        <form className="space-y-4" onSubmit={onSubmit}>
          {modalType === 'category' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('nameEn')}</label>
                <input
                  type="text"
                  name="nameEn"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  defaultValue={editingItem?.name_en || ''}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('nameNo')}</label>
                <input
                  type="text"
                  name="nameNo"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  defaultValue={editingItem?.name_no || ''}
                />
              </div>
            </>
          )}
          
          {modalType === 'product' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('nameEn')}</label>
                <input
                  type="text"
                  name="nameEn"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  defaultValue={editingItem?.name_en || ''}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('nameNo')}</label>
                <input
                  type="text"
                  name="nameNo"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  defaultValue={editingItem?.name_no || ''}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('descEn')}</label>
                <textarea
                  rows={3}
                  name="descriptionEn"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  defaultValue={editingItem?.description_en || ''}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('descNo')}</label>
                <textarea
                  rows={3}
                  name="descriptionNo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  defaultValue={editingItem?.description_no || ''}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('price')} (kr)</label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  defaultValue={editingItem?.price || ''}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('categoryLabel')}</label>
                <select
                  name="categoryName"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  defaultValue={editingItem?.category_name || ''}
                >
                  <option value="">{t('selectCategory')}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name_en}>
                      {cat.name_en}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('prepTime')}</label>
                <input
                  type="number"
                  name="prepTime"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  defaultValue={editingItem?.prep_time || 30}
                />
              </div>
              
              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                
                {/* Mode Selection */}
                <div className="flex flex-col sm:flex-row gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setImageMode('url');
                      clearFileSelection();
                    }}
                    className={`flex-1 px-3 py-2 rounded-lg border-2 transition-colors text-sm text-center ${
                      imageMode === 'url'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <LinkIcon className="w-4 h-4 inline mr-2" />
                    Image URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode('upload')}
                    className={`flex-1 px-3 py-2 rounded-lg border-2 transition-colors text-sm text-center ${
                      imageMode === 'upload'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <Upload className="w-4 h-4 inline mr-2" />
                    Upload File
                  </button>
                </div>

                {/* URL Input */}
                {imageMode === 'url' && (
                  <input
                    type="text"
                    name="imageUrl"
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                    defaultValue={editingItem?.image_url || ''}
                  />
                )}

                {/* File Upload */}
                {imageMode === 'upload' && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex flex-col sm:flex-row items-center sm:items-center justify-center w-full min-h-[120px] sm:h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-red-500 hover:bg-red-50 transition-colors overflow-hidden p-3"
                    >
                      {imagePreview ? (
                        <div className="relative w-full h-full">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-contain rounded"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              clearFileSelection();
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            aria-label={t('removeImage') || 'Remove image'}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <div className="text-sm text-gray-600">Click to upload image</div>
                          <div className="text-xs text-gray-400 mt-1">JPEG, PNG, GIF, WebP (Max 10MB)</div>
                        </div>
                      )}
                    </label>
                    
                    {uploadError && (
                      <p className="mt-2 text-sm text-red-600">{uploadError}</p>
                    )}
                    
                    {selectedFile && (
                      <p className="mt-2 text-sm text-gray-600 break-words">
                        Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                    
                    {/* Hidden input to store uploaded image URL */}
                    <input type="hidden" name="imageUrl" value={imagePreview ? 'UPLOADED' : editingItem?.image_url || ''} />
                    <input type="hidden" name="uploadedFile" value={selectedFile ? 'true' : 'false'} />
                  </div>
                )}
              </div>
            </>
          )}

          {modalType === 'shopInfo' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('shopName')}</label>
                <input
                  type="text"
                  name="shopName"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  defaultValue={editingItem?.shop_name || ''}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('address')}</label>
                <input
                  type="text"
                  name="address"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  defaultValue={editingItem?.address || ''}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('phone')}</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  defaultValue={editingItem?.phone || ''}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  defaultValue={editingItem?.email || ''}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('latitude')}</label>
                  <input
                    type="number"
                    step="0.000001"
                    name="lat"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                    defaultValue={editingItem?.lat || ''}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('longitude')}</label>
                  <input
                    type="number"
                    step="0.000001"
                    name="lng"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                    defaultValue={editingItem?.lng || ''}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('deliveryRadius')}</label>
                <input
                  type="number"
                  step="0.1"
                  name="deliveryRadius"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  defaultValue={editingItem?.delivery_radius || ''}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('minimumOrder')}</label>
                <input
                  type="number"
                  step="0.01"
                  name="minimumOrder"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  defaultValue={editingItem?.minimum_order || ''}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('deliveryFeeLabel')}</label>
                <input
                  type="number"
                  step="0.01"
                  name="deliveryCharges"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  defaultValue={editingItem?.delivery_charges || ''}
                />
              </div>
            </>
          )}

          {modalType === 'workingHours' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('dayLabel')}</label>
                <select
                  name="day"
                  required
                  disabled={!!editingItem?.day}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100 text-sm"
                  defaultValue={editingItem?.day || ''}
                >
                  <option value="">{t('selectDay')}</option>
                  {DAYS_OF_WEEK.map((day) => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
                {editingItem?.day && (
                  <input type="hidden" name="day" value={editingItem.day} />
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('statusLabel')}</label>
                <select
                  name="isOpen"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  defaultValue={editingItem?.is_open !== undefined ? String(editingItem.is_open) : 'true'}
                >
                  <option value="true">{t('openLabel')}</option>
                  <option value="false">{t('closedLabel')}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('openingTimeLabel')}</label>
                <input
                  type="time"
                  name="openingTime"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  defaultValue={editingItem?.opening_time || '09:00'}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('closingTimeLabel')}</label>
                <input
                  type="time"
                  name="closingTime"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  defaultValue={editingItem?.closing_time || '22:00'}
                />
              </div>
            </>
          )}
          
          <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={saveSuccess}
              className="w-full sm:flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 text-sm"
            >
              {saveSuccess ? t('saved') : (editingItem ? t('update') : t('create'))}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}