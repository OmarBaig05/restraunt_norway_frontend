import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, LanguageContextType } from '../types';

const languages: Language[] = [
  { code: 'no', name: 'Norsk' },
  { code: 'en', name: 'English' },
];

const translations: Record<string, Record<string, string>> = {
  no: {
    // Navigation
    home: 'Hjem',
    menu: 'Meny',
    preorder: 'Forhåndsbestill',
    delivery: 'Hjemlevering',
    admin: 'Admin',
    myOrders: 'Mine Bestillinger',

    // Homepage
    welcomeTitle: 'Velkommen til vårt restaurant',
    welcomeDescription: 'Opplev de beste smakene i byen med våre ferske ingredienser og tradisjonelle oppskrifter.',
    viewMenu: 'Se Meny',
    orderNow: 'Bestill Nå',
    contactUs: 'Kontakt Oss',
    workingHours: 'Åpningstider',

    // Menu
    categories: 'Kategorier',
    addToCart: 'Legg i Kurv',
    preparationTime: 'Tilberedningstid',
    minutes: 'min',
    price: 'Pris',

    // Cart & Orders
    cart: 'Kurv',
    total: 'Total',
    checkout: 'Til Kassen',
    confirmOrder: 'Bekreft Bestilling',
    orderSuccess: 'Bestilling Vellykket',
    orderToken: 'Bestillingsnummer',

    // Delivery
    deliveryAddress: 'Leveringsadresse',
    postalCode: 'Postnummer',
    checkDelivery: 'Sjekk Levering',
    deliveryNotAvailable: 'Beklager! Vi leverer ikke til ditt område.',

    // Admin
    login: 'Logg Inn',
    email: 'E-post',
    password: 'Passord',
    dashboard: 'Dashboard',
    orders: 'Bestillinger',
    manageMenu: 'Administrer Meny',

    // Admin Login / placeholders / errors
    accessDashboard: 'Få tilgang til restaurantens dashbord',
    invalidCredentials: 'Ugyldig e-post eller passord',
    signingIn: 'Logger inn...',
    emailPlaceholder: 'admin@restaurant.no',
    passwordPlaceholder: 'Skriv inn passordet ditt',

    // Admin Modal / Forms
    categoryLabel: 'Kategori',
    productLabel: 'Produkt',
    shopInfoLabel: 'Butikkinfo',
    workingHoursLabel: 'Åpningstider',
    savedSuccess: 'Lagret!',
    saved: 'Lagret!',
    nameEn: 'Navn (Engelsk)',
    nameNo: 'Navn (Norsk)',
    descEn: 'Beskrivelse (Engelsk)',
    descNo: 'Beskrivelse (Norsk)',
    selectCategory: 'Velg kategori',
    prepTime: 'Forberedelsestid (minutter)',
    imageUrl: 'Bilde URL',
    shopName: 'Butikknavn',
    latitude: 'Latitude',
    longitude: 'Longitude',
    deliveryRadius: 'Leveringsradius (km)',
    minimumOrder: 'Minimumsordre (kr)',
    dayLabel: 'Dag',
    statusLabel: 'Status',
    openingTimeLabel: 'Åpningstid',
    closingTimeLabel: 'Stengningstid',
    create: 'Opprett',
    update: 'Oppdater',
    openLabel: 'Åpen',
    closedLabel: 'Stengt',
    selectDay: 'Velg en dag',

    // OrdersTab / Admin Orders
    orderManagement: 'Bestillingsadministrasjon',
    totalOrders: 'Totalt antall bestillinger',
    pendingOrders: 'Venter bestillinger',
    totalProducts: 'Totalt produkter',
    recentOrders: 'Siste bestillinger',
    orderId: 'Bestillings-ID',
    customer: 'Kunde',
    type: 'Type',
    items: 'Antall varer',
    token: 'Token',
    status: 'Status',
    actions: 'Handlinger',
    preOrder: 'Forhåndsbestilling',
    deliveryLabel: 'Levering',
    noOrdersFound: 'Ingen bestillinger funnet',
    orderDetails: 'Bestillingsdetaljer',
    viewDetails: 'Vis detaljer',
    loadingProductDetails: 'Laster produktdetaljer...',
    quantityLabel: 'Antall',
    priceLabel: 'Pris',
    subtotal: 'Delsum',
    orderTotal: 'Bestillingssum',
    orderTokenLabel: 'Bestillingsnummer',
    orderCreatedLabel: 'Bestilt',
    approve: 'Godkjenn',
    reject: 'Avslå',
    markAsCompleted: 'Merk som Ferdig',
    markAsDelivered: 'Merk som Levert',
    close: 'Lukk',
    pending: 'Venter',
    approved: 'Godkjent',
    ready: 'Klar',
    completed: 'Fullført',
    delivered: 'Levert',
    rejected: 'Avslått',

    // ShopSettings / Working hours UI
    shopInformation: 'Butikkinformasjon',
    editShopInfo: 'Rediger butikkinfo',
    coordinates: 'Koordinater',
    deliveryRadiusLabel: 'Leveringsradius',
    minimumOrderLabel: 'Minimumsordre',
    noShopInfoFound: 'Ingen butikkinfo funnet. Klikk "Rediger butikkinfo" for å legge til detaljer.',
    workingHoursTitle: 'Åpningstider',
    addUpdateHours: 'Legg til / Oppdater åpningstider',
    hours24DetectedTitle: '24-timers drift oppdaget',
    hours24DetectedDesc: 'Dager merket som "24 timer" vil alltid vises som åpne for kunder.',
    hours24Label: '24 Hours',
    notSet: 'Ikke satt',
    editLabel: 'Rediger',
    tip24Hours: 'Tips: For å sette en dag som 24 timer, bruk 00:00 - 23:59 eller 00:00 - 00:00 som tidsintervall.',

    // Common
    name: 'Navn',
    description: 'Beskrivelse',
    save: 'Lagre',
    cancel: 'Avbryt',
    edit: 'Rediger',
    delete: 'Slett',
    add: 'Legg til',
    closeLabel: 'Lukk',
    loading: 'Laster...',
    error: 'Feil',

    // Preorder / Delivery page strings
    checkingShopStatus: 'Sjekker butikkstatus...',
    preorderTitle: 'Forhåndsbestill',
    reviewOrderDesc: 'Gjennomgå bestillingen din og fullfør kjøpet',
    shopClosedTitle: 'Butikken er stengt',
    shopClosedDesc: 'Bestillinger kan ikke plasseres for øyeblikket. Vennligst kom tilbake i løpet av våre åpningstider.',
    orderSuccessTitle: 'Bestilling Vellykket!',
    preorderConfirmed: 'Din forhåndsbestilling er bekreftet!',
    pickupTokenLabel: 'Hentekode',
    backToHome: 'Tilbake til Hjem',
    cartEmptyTitle: 'Handlekurven er tom',
    cartEmptyDesc: 'Legg til noen deilige retter fra menyen vår',
    browseMenu: 'Bla i Meny',
    yourNamePlaceholder: 'Ditt navn',
    phone: 'Telefon',
    optional: 'Valgfritt',
    pickupTimeInfo: 'Hentetid: Ca. 30 minutter fra nå',
    processing: 'Behandler...',
    confirmOrderBtn: 'Bekreft Bestilling',

    // Delivery-specific
    deliveryTitle: 'Levering',
    deliveryDesc: 'Få dine favorittretter levert til døren',
    deliveryOrderedTitle: 'Levering Bestilt!',
    deliveryConfirmed: 'Din leveringsbestilling er bekreftet!',
    orderTokenLabelDelivery: 'Ordrekode',
    backToHomeDelivery: 'Tilbake til Hjem',
    useCurrentLocationRequired: 'Bruk Nåværende Posisjon (Påkrevd)',
    geolocationNotSupported: 'Geolokalisering støttes ikke av denne nettleseren.',
    allowLocationAccess: 'Vennligst tillat posisjonstilgang i nettleseren for å fortsette.',
    locationRequiredForDelivery: 'Posisjon må være aktivert for levering. Klikk "Bruk Nåværende Posisjon" og tillat tilgang.',
    fillAddressPostal: 'Vennligst fyll inn både adresse og postnummer.',
    subtotalLabel: 'Delsum',
    deliveryFeeLabel: 'Leveringsgebyr',
    freeLabel: 'Gratis',
    orderSummaryLabel: 'Bestillingsoversikt',

    // Admin confirmations
    confirmDeleteCategoryWithProducts: 'Sletting av denne kategorien vil også slette alle produkter som tilhører den. Er du sikker på at du vil fortsette?',
    confirmDeleteCategory: 'Er du sikker på at du vil slette denne kategorien?',
    confirmDeleteProduct: 'Er du sikker på at du vil slette dette produktet?',
  },
  en: {
    // Navigation
    home: 'Home',
    menu: 'Menu',
    preorder: 'Pre-order',
    delivery: 'Delivery',
    admin: 'Admin',
    myOrders: 'My Orders',

    // Homepage
    welcomeTitle: 'Welcome to Our Restaurant',
    welcomeDescription: 'Experience the finest flavors in town with our fresh ingredients and traditional recipes.',
    viewMenu: 'View Menu',
    orderNow: 'Order Now',
    contactUs: 'Contact Us',
    workingHours: 'Working Hours',

    // Menu
    categories: 'Categories',
    addToCart: 'Add to Cart',
    preparationTime: 'Preparation Time',
    minutes: 'min',
    price: 'Price',

    // Cart & Orders
    cart: 'Cart',
    total: 'Total',
    checkout: 'Checkout',
    confirmOrder: 'Confirm Order',
    orderSuccess: 'Order Successful',
    orderToken: 'Order Number',

    // Delivery
    deliveryAddress: 'Delivery Address',
    postalCode: 'Postal Code',
    checkDelivery: 'Check Delivery',
    deliveryNotAvailable: "Sorry! We don't deliver to your area.",

    // Admin
    login: 'Login',
    email: 'Email',
    password: 'Password',
    dashboard: 'Dashboard',
    orders: 'Orders',
    manageMenu: 'Manage Menu',

    // Admin Login / placeholders / errors
    accessDashboard: 'Access the restaurant dashboard',
    invalidCredentials: 'Invalid email or password',
    signingIn: 'Signing in...',
    emailPlaceholder: 'admin@restaurant.no',
    passwordPlaceholder: 'Enter your password',

    // Admin Modal / Forms
    categoryLabel: 'Category',
    productLabel: 'Product',
    shopInfoLabel: 'Shop Information',
    workingHoursLabel: 'Working Hours',
    savedSuccess: 'Saved successfully!',
    saved: 'Saved!',
    nameEn: 'Name (English)',
    nameNo: 'Name (Norwegian)',
    descEn: 'Description (English)',
    descNo: 'Description (Norwegian)',
    selectCategory: 'Select a category',
    prepTime: 'Prep Time (minutes)',
    imageUrl: 'Image URL',
    shopName: 'Shop Name',
    latitude: 'Latitude',
    longitude: 'Longitude',
    deliveryRadius: 'Delivery Radius (km)',
    minimumOrder: 'Minimum Order (kr)',
    dayLabel: 'Day',
    statusLabel: 'Status',
    openingTimeLabel: 'Opening Time',
    closingTimeLabel: 'Closing Time',
    create: 'Create',
    update: 'Update',
    openLabel: 'Open',
    closedLabel: 'Closed',
    selectDay: 'Select a day',

    // OrdersTab / Admin Orders
    orderManagement: 'Order Management',
    totalOrders: 'Total Orders',
    pendingOrders: 'Pending Orders',
    totalProducts: 'Total Products',
    recentOrders: 'Recent Orders',
    orderId: 'Order ID',
    customer: 'Customer',
    type: 'Type',
    items: 'Items',
    token: 'Token',
    status: 'Status',
    actions: 'Actions',
    preOrder: 'Pre-order',
    deliveryLabel: 'Delivery',
    noOrdersFound: 'No orders found',
    orderDetails: 'Order Details',
    viewDetails: 'View Details',
    loadingProductDetails: 'Loading product details...',
    quantityLabel: 'Quantity',
    priceLabel: 'Price',
    subtotal: 'Subtotal',
    orderTotal: 'Order Total',
    orderTokenLabel: 'Order Token',
    orderCreatedLabel: 'Order Created',
    approve: 'Approve',
    reject: 'Reject',
    markAsCompleted: 'Mark as Completed',
    markAsDelivered: 'Mark as Delivered',
    close: 'Close',
    pending: 'Pending',
    approved: 'Approved',
    ready: 'Ready',
    completed: 'Completed',
    delivered: 'Delivered',
    rejected: 'Rejected',

    // ShopSettings / Working hours UI
    shopInformation: 'Shop Information',
    editShopInfo: 'Edit Shop Info',
    coordinates: 'Coordinates',
    deliveryRadiusLabel: 'Delivery Radius',
    minimumOrderLabel: 'Minimum Order',
    noShopInfoFound: 'No shop information found. Click "Edit Shop Info" to add details.',
    workingHoursTitle: 'Working Hours',
    addUpdateHours: 'Add / Update Hours',
    hours24DetectedTitle: '24-Hour Operation Detected',
    hours24DetectedDesc: 'Days marked as "24 Hours" will always show as open to customers.',
    hours24Label: '24 Hours',
    notSet: 'Not set',
    editLabel: 'Edit',
    tip24Hours: 'Tip: To set a day as 24 hours, use 00:00 - 23:59 or 00:00 - 00:00 as the time range.',

    // Common
    name: 'Name',
    description: 'Description',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    add: 'Add',
    closeLabel: 'Close',
    loading: 'Loading...',
    error: 'Error',

    // Preorder / Delivery page strings
    checkingShopStatus: 'Checking shop status...',
    preorderTitle: 'Pre-order',
    reviewOrderDesc: 'Review your order and complete checkout',
    shopClosedTitle: 'Shop is Closed',
    shopClosedDesc: 'Orders cannot be placed at this time. Please come back during our opening hours.',
    orderSuccessTitle: 'Order Successful!',
    preorderConfirmed: 'Your pre-order has been confirmed!',
    pickupTokenLabel: 'Pickup Token',
    backToHome: 'Back to Home',
    cartEmptyTitle: 'Your cart is empty',
    cartEmptyDesc: 'Add some delicious items from our menu',
    browseMenu: 'Browse Menu',
    yourNamePlaceholder: 'Your name',
    phone: 'Phone',
    optional: 'Optional',
    pickupTimeInfo: 'Pickup time: Approx. 30 minutes from now',
    processing: 'Processing...',
    confirmOrderBtn: 'Confirm Order',

    // Delivery-specific
    deliveryTitle: 'Delivery',
    deliveryDesc: 'Get your favorite dishes delivered to your door',
    deliveryOrderedTitle: 'Delivery Ordered!',
    deliveryConfirmed: 'Your delivery order has been confirmed!',
    orderTokenLabelDelivery: 'Order Token',
    backToHomeDelivery: 'Back to Home',
    useCurrentLocationRequired: 'Use Current Location (Required)',
    geolocationNotSupported: 'Geolocation is not supported by this browser.',
    allowLocationAccess: 'Please allow location access in your browser to continue.',
    locationRequiredForDelivery: 'Location must be enabled for delivery. Click "Use Current Location" and allow access.',
    fillAddressPostal: 'Please fill in both address and postal code.',
    subtotalLabel: 'Subtotal',
    deliveryFeeLabel: 'Delivery Fee',
    freeLabel: 'Free',
    orderSummaryLabel: 'Order Summary',

    // Admin confirmations
    confirmDeleteCategoryWithProducts: 'Deleting this category will also delete all products belonging to it. Are you sure you want to continue?',
    confirmDeleteCategory: 'Are you sure you want to delete this category?',
    confirmDeleteProduct: 'Are you sure you want to delete this product?',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0]);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      const language = languages.find(lang => lang.code === savedLanguage);
      if (language) {
        setCurrentLanguage(language);
      }
    }
  }, []);

  const toggleLanguage = () => {
    const newLanguage = currentLanguage.code === 'no' ? languages[1] : languages[0];
    setCurrentLanguage(newLanguage);
    localStorage.setItem('language', newLanguage.code);
  };
  
  const t = (key: string, noText?: string, enText?: string): string => {
    if (noText && enText) {
      return currentLanguage.code === 'no' ? noText : enText;
    }
    
    return translations[currentLanguage.code][key] || key;
  };
  
  // Return short day names for footer/display
  const getDayShort = (day: string): string => {
    if (currentLanguage.code === 'no') {
      const dayMap: Record<string, string> = {
        'Monday': 'Man',
        'Tuesday': 'Tir',
        'Wednesday': 'Ons',
        'Thursday': 'Tor',
        'Friday': 'Fre',
        'Saturday': 'Lør',
        'Sunday': 'Søn'
      };
      return dayMap[day] || day;
    }
    const dayMap: Record<string, string> = {
      'Monday': 'Mon',
      'Tuesday': 'Tue',
      'Wednesday': 'Wed',
      'Thursday': 'Thu',
      'Friday': 'Fri',
      'Saturday': 'Sat',
      'Sunday': 'Sun'
    };
    return dayMap[day] || day;
  };
  
  // Format time strings coming from backend (HH:MM[:SS]) -> HH:MM
  const formatTime = (time?: string): string => {
    if (!time) return '';
    return time.substring(0, 5);
  };

  // Return nav links (all language logic centralized here)
  const getNavLinks = () => {
    return [
      { path: '/', label: t('home') },
      { path: '/menu', label: t('menu') },
      { path: '/preorder', label: t('preorder') },
      { path: '/delivery', label: t('delivery') },
      { path: '/my-orders', label: t('myOrders') },
    ];
  };

  // Short display for language button (EN / NO)
  const getLanguageDisplay = () => currentLanguage.code.toUpperCase();

  return (
    <LanguageContext.Provider value={{ currentLanguage, toggleLanguage, t, getDayShort, formatTime, getNavLinks, getLanguageDisplay }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
   const context = useContext(LanguageContext);
   if (context === undefined) {
     throw new Error('useLanguage must be used within a LanguageProvider');
   }
   return context;
 } 