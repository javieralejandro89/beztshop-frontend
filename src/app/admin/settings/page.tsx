// src/app/admin/settings/page.tsx - Gestión de configuración CORREGIDO
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Settings,
  Save,
  Mail,
  CreditCard,
  Truck,
  Tag,
  Globe,
  RefreshCw,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Copy,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Loader2,
  Store,
  Phone,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatPrice, formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import { adminApi } from '@/lib/api'; // CORRECCIÓN: Usar adminApi
import { Send, Users as UsersIcon, Calendar, BarChart3, FileText, User, TrendingUp } from 'lucide-react';

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  contactEmail: string;
  contactPhone: string;
  supportEmail: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    youtube?: string;
  };
  logo?: string;
  favicon?: string;
  currency: string;
  timezone: string;
  language: string;
}

interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  smtpSecure: boolean;
  fromEmail: string;
  fromName: string;
  templates: {
    orderConfirmation: boolean;
    orderStatusUpdate: boolean;
    orderShipped: boolean;
    orderDelivered: boolean;
    newsletter: boolean;
  };
}

interface PaymentSettings {
  stripe: {
    enabled: boolean;
    publicKey: string;
    secretKey: string;
    webhookSecret: string;
  };
  paypal: {
    enabled: boolean;
    clientId: string;
    clientSecret: string;
    sandbox: boolean;
  };
  zelle: {
    enabled: boolean;
    email: string;
    phone: string;
  };
  cashOnDelivery: {
    enabled: boolean;
    fee: number;
  };
}

interface ShippingSettings {
  freeShippingThreshold: number;
  defaultShippingCost: number;
  maxShippingDays: number;
  restrictedCountries: string[];
  zones: {
    id: string;
    name: string;
    countries: string[];
    cost: number;
    estimatedDays: number;
  }[];
}

interface Coupon {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
  value: number;
  minAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
  startsAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const { success, error, promise } = useToast();
  const [activeTab, setActiveTab] = useState('site');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const [isCreatingCoupon, setIsCreatingCoupon] = useState(false);

  // Estados para configuraciones
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteName: '',
    siteDescription: '',
    siteUrl: '',
    contactEmail: '',
    contactPhone: '',
    supportEmail: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Estados Unidos'
    },
    socialMedia: {},
    currency: 'USD',
    timezone: 'America/New_York',
    language: 'es'
  });

  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    smtpSecure: false,
    fromEmail: '',
    fromName: '',
    templates: {
      orderConfirmation: true,
      orderStatusUpdate: true,
      orderShipped: true,
      orderDelivered: true,
      newsletter: false
    }
  });

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    stripe: {
      enabled: false,
      publicKey: '',
      secretKey: '',
      webhookSecret: ''
    },
    paypal: {
      enabled: false,
      clientId: '',
      clientSecret: '',
      sandbox: true
    },
    zelle: {
      enabled: true,
      email: '',
      phone: ''
    },
    cashOnDelivery: {
      enabled: false,
      fee: 0
    }
  });

  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>({
    freeShippingThreshold: 100,
    defaultShippingCost: 10,
    maxShippingDays: 7,
    restrictedCountries: [],
    zones: []
  });

  const [coupons, setCoupons] = useState<Coupon[]>([]);

  // Formulario de cupón
  const [couponForm, setCouponForm] = useState({
    code: '',
    type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING',
    value: 0,
    minAmount: '',
    maxDiscount: '',
    usageLimit: '',
    isActive: true,
    startsAt: '',
    expiresAt: ''
  });

  // Estados para Newsletter
const [newsletterStats, setNewsletterStats] = useState<any>(null);
const [subscribers, setSubscribers] = useState<any[]>([]);
const [campaigns, setCampaigns] = useState<any[]>([]);
const [showCampaignModal, setShowCampaignModal] = useState(false);
const [campaignForm, setCampaignForm] = useState({
  subject: '',
  previewText: '',
  content: '',
  sendNow: false,
  scheduledFor: ''
});
const [isLoadingNewsletter, setIsLoadingNewsletter] = useState(false);
const [showPreviewModal, setShowPreviewModal] = useState(false);
const [previewHtml, setPreviewHtml] = useState('');

  useEffect(() => {
    loadSettings();
    loadCoupons();
    loadNewsletterData();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      
      // CORRECCIÓN: Usar adminApi en lugar de fetch directo
      const [siteRes, emailRes, paymentRes, shippingRes] = await Promise.allSettled([
        adminApi.getSiteSettings(),
        adminApi.getEmailSettings(),
        adminApi.getPaymentSettings(),
        adminApi.getShippingSettings()
      ]);

      if (siteRes.status === 'fulfilled') {
        setSiteSettings(siteRes.value.settings);
      }

      if (emailRes.status === 'fulfilled') {
        setEmailSettings(emailRes.value.settings);
      }

      if (paymentRes.status === 'fulfilled') {
        setPaymentSettings(paymentRes.value.settings);
      }

      if (shippingRes.status === 'fulfilled') {
        setShippingSettings(shippingRes.value.settings);
      }

    } catch (err: any) {
      console.error('Error loading settings:', err);
      error('Error al cargar las configuraciones');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCoupons = async () => {
    try {
      // CORRECCIÓN: Usar adminApi en lugar de fetch directo
      const data = await adminApi.getCoupons();
      setCoupons(data.coupons);

    } catch (err: any) {
      console.error('Error loading coupons:', err);
      error('Error al cargar los cupones');
    }
  };

  const saveSettings = async (type: 'site' | 'email' | 'payment' | 'shipping') => {
    try {
      setIsSaving(true);
      
      const settingsMap = {
        site: siteSettings,
        email: emailSettings,
        payment: paymentSettings,
        shipping: shippingSettings
      };

      const updateMethods = {
        site: adminApi.updateSiteSettings,
        email: adminApi.updateEmailSettings,
        payment: adminApi.updatePaymentSettings,
        shipping: adminApi.updateShippingSettings
      };

      await promise(
        updateMethods[type](settingsMap[type]),
        {
          loading: 'Guardando configuración...',
          success: 'Configuración guardada exitosamente',
          error: 'Error al guardar la configuración'
        }
      );

    } catch (err: any) {
      console.error('Error saving settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const openCouponModal = (coupon?: Coupon) => {
    if (coupon) {
      setCouponForm({
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        minAmount: coupon.minAmount?.toString() || '',
        maxDiscount: coupon.maxDiscount?.toString() || '',
        usageLimit: coupon.usageLimit?.toString() || '',
        isActive: coupon.isActive,
        startsAt: coupon.startsAt ? new Date(coupon.startsAt).toISOString().split('T')[0] : '',
        expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : ''
      });
      setSelectedCoupon(coupon);
      setIsCreatingCoupon(false);
    } else {
      setCouponForm({
        code: '',
        type: 'PERCENTAGE',
        value: 0,
        minAmount: '',
        maxDiscount: '',
        usageLimit: '',
        isActive: true,
        startsAt: '',
        expiresAt: ''
      });
      setSelectedCoupon(null);
      setIsCreatingCoupon(true);
    }
    setShowCouponModal(true);
  };

  const handleCouponSubmit = async () => {
    try {
      const body = {
        ...couponForm,
        value: Number(couponForm.value),
        minAmount: couponForm.minAmount ? Number(couponForm.minAmount) : undefined,
        maxDiscount: couponForm.maxDiscount ? Number(couponForm.maxDiscount) : undefined,
        usageLimit: couponForm.usageLimit ? Number(couponForm.usageLimit) : undefined,
        startsAt: couponForm.startsAt ? new Date(couponForm.startsAt + 'T00:00:00.000Z').toISOString() : undefined,
      expiresAt: couponForm.expiresAt ? new Date(couponForm.expiresAt + 'T23:59:59.999Z').toISOString() : undefined
      };

      if (isCreatingCoupon) {
        await promise(
          adminApi.createCoupon(body),
          {
            loading: 'Creando cupón...',
            success: 'Cupón creado exitosamente',
            error: 'Error al crear cupón'
          }
        );
      } else {
        await promise(
          adminApi.updateCoupon(selectedCoupon!.id, body),
          {
            loading: 'Actualizando cupón...',
            success: 'Cupón actualizado exitosamente',
            error: 'Error al actualizar cupón'
          }
        );
      }

      setShowCouponModal(false);
      loadCoupons();

    } catch (err: any) {
      console.error('Error submitting coupon:', err);
    }
  };

  const handleDeleteCoupon = async () => {
    if (!couponToDelete) return;

    try {
      await promise(
        adminApi.deleteCoupon(couponToDelete.id),
        {
          loading: 'Eliminando cupón...',
          success: 'Cupón eliminado exitosamente',
          error: 'Error al eliminar cupón'
        }
      );

      setShowDeleteDialog(false);
      setCouponToDelete(null);
      loadCoupons();

    } catch (err: any) {
      console.error('Error deleting coupon:', err);
    }
  };

  const toggleCouponStatus = async (coupon: Coupon) => {
    try {
      await promise(
        adminApi.toggleCouponStatus(coupon.id),
        {
          loading: 'Cambiando estado...',
          success: `Cupón ${coupon.isActive ? 'desactivado' : 'activado'} exitosamente`,
          error: 'Error al cambiar estado del cupón'
        }
      );

      loadCoupons();

    } catch (err: any) {
      console.error('Error toggling coupon status:', err);
    }
  };

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    success('Código copiado al portapapeles');
  };

  const getCouponTypeText = (type: string) => {
    const typeMap = {
      PERCENTAGE: 'Porcentaje',
      FIXED_AMOUNT: 'Cantidad Fija',
      FREE_SHIPPING: 'Envío Gratis'
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  const getCouponTypeColor = (type: string) => {
    const colorMap = {
      PERCENTAGE: 'bg-blue-100 text-blue-800',
      FIXED_AMOUNT: 'bg-green-100 text-green-800',
      FREE_SHIPPING: 'bg-purple-100 text-purple-800'
    };
    return colorMap[type as keyof typeof colorMap] || 'bg-gray-100 text-gray-800';
  };

  // Funciones de Newsletter
const loadNewsletterData = async () => {
  try {
    setIsLoadingNewsletter(true);
    
    const [stats, subs, camps] = await Promise.all([
      adminApi.getNewsletterStats(),
      adminApi.getNewsletterSubscribers({ limit: 100 }),
      adminApi.getNewsletterCampaigns()
    ]);
    
    setNewsletterStats(stats.stats);
    setSubscribers(subs.subscribers);
    setCampaigns(camps.campaigns);
    
  } catch (err: any) {
    console.error('Error loading newsletter data:', err);
    error('Error al cargar datos del newsletter');
  } finally {
    setIsLoadingNewsletter(false);
  }
};

const handleSendCampaign = async () => {
  try {
    if (!campaignForm.subject || !campaignForm.content) {
      error('Asunto y contenido son requeridos');
      return;
    }

    await promise(
      adminApi.createNewsletterCampaign(campaignForm),
      {
        loading: 'Enviando campaña...',
        success: campaignForm.sendNow ? 'Campaña enviándose' : 'Campaña guardada',
        error: 'Error al procesar campaña'
      }
    );

    setShowCampaignModal(false);
    setCampaignForm({
      subject: '',
      previewText: '',
      content: '',
      sendNow: false,
      scheduledFor: ''
    });
    loadNewsletterData();

  } catch (err: any) {
    console.error('Error sending campaign:', err);
  }
};

const handlePreviewCampaign = async () => {
  try {
    const response = await adminApi.previewNewsletterCampaign(campaignForm);
    setPreviewHtml(response.preview);
    setShowPreviewModal(true);
  } catch (err: any) {
    error('Error generando preview');
  }
};

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <div className="text-lg">Cargando configuración...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/admin/dashboard')}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Settings className="h-8 w-8 text-primary-600" />
              Configuración del Sistema
            </h1>
            <p className="text-gray-600 mt-2">
              Configura todos los aspectos de tu tienda online
            </p>
          </div>
        </div>

        {/* Tabs de configuración */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
            <TabsTrigger value="site" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              <span className="hidden sm:inline">Sitio</span>
            </TabsTrigger>
            <TabsTrigger value="newsletter" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Newsletter</span>
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Pagos</span>
            </TabsTrigger>
            <TabsTrigger value="shipping" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              <span className="hidden sm:inline">Envíos</span>
            </TabsTrigger>
            <TabsTrigger value="coupons" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span className="hidden sm:inline">Cupones</span>
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">SEO</span>
            </TabsTrigger>            
          </TabsList>

          {/* Configuración del Sitio */}
          <TabsContent value="site" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información Básica del Sitio</CardTitle>
                <CardDescription>
                  Configuración principal de tu tienda online
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="siteName">Nombre del Sitio</Label>
                    <Input
                      id="siteName"
                      value={siteSettings.siteName}
                      onChange={(e) => setSiteSettings({...siteSettings, siteName: e.target.value})}
                      placeholder="ServiPro Garcia LLC"
                    />
                  </div>

                  <div>
                    <Label htmlFor="siteUrl">URL del Sitio</Label>
                    <Input
                      id="siteUrl"
                      value={siteSettings.siteUrl}
                      onChange={(e) => setSiteSettings({...siteSettings, siteUrl: e.target.value})}
                      placeholder="https://servipro.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="siteDescription">Descripción del Sitio</Label>
                  <Textarea
                    id="siteDescription"
                    value={siteSettings.siteDescription}
                    onChange={(e) => setSiteSettings({...siteSettings, siteDescription: e.target.value})}
                    placeholder="Tienda en línea de productos especializados..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="contactEmail">Email de Contacto</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={siteSettings.contactEmail}
                      onChange={(e) => setSiteSettings({...siteSettings, contactEmail: e.target.value})}
                      placeholder="contacto@servipro.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contactPhone">Teléfono de Contacto</Label>
                    <Input
                      id="contactPhone"
                      value={siteSettings.contactPhone}
                      onChange={(e) => setSiteSettings({...siteSettings, contactPhone: e.target.value})}
                      placeholder="+1 832-523-0060"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="supportEmail">Email de Soporte</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={siteSettings.supportEmail}
                    onChange={(e) => setSiteSettings({...siteSettings, supportEmail: e.target.value})}
                    placeholder="soporte@servipro.com"
                  />
                </div>

                {/* Dirección de la Empresa */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Dirección de la Empresa</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <Label htmlFor="addressStreet">Dirección</Label>
                      <Input
                        id="addressStreet"
                        value={siteSettings.address.street}
                        onChange={(e) => setSiteSettings({
                          ...siteSettings,
                          address: { ...siteSettings.address, street: e.target.value }
                        })}
                        placeholder="123 Main Street"
                      />
                    </div>

                    <div>
                      <Label htmlFor="addressCity">Ciudad</Label>
                      <Input
                        id="addressCity"
                        value={siteSettings.address.city}
                        onChange={(e) => setSiteSettings({
                          ...siteSettings,
                          address: { ...siteSettings.address, city: e.target.value }
                        })}
                        placeholder="Houston"
                      />
                    </div>

                    <div>
                      <Label htmlFor="addressState">Estado/Provincia</Label>
                      <Input
                        id="addressState"
                        value={siteSettings.address.state}
                        onChange={(e) => setSiteSettings({
                          ...siteSettings,
                          address: { ...siteSettings.address, state: e.target.value }
                        })}
                        placeholder="TX"
                      />
                    </div>

                    <div>
                      <Label htmlFor="addressZip">Código Postal</Label>
                      <Input
                        id="addressZip"
                        value={siteSettings.address.zipCode}
                        onChange={(e) => setSiteSettings({
                          ...siteSettings,
                          address: { ...siteSettings.address, zipCode: e.target.value }
                        })}
                        placeholder="77001"
                      />
                    </div>

                    <div>
                      <Label htmlFor="addressCountry">País</Label>
                      <Select
                        value={siteSettings.address.country}
                        onValueChange={(value) => setSiteSettings({
                          ...siteSettings,
                          address: { ...siteSettings.address, country: value }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Estados Unidos">Estados Unidos</SelectItem>
                          <SelectItem value="México">México</SelectItem>
                          <SelectItem value="Canadá">Canadá</SelectItem>
                          <SelectItem value="España">España</SelectItem>
                          <SelectItem value="Colombia">Colombia</SelectItem>
                          <SelectItem value="Argentina">Argentina</SelectItem>
                          <SelectItem value="Chile">Chile</SelectItem>
                          <SelectItem value="Perú">Perú</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Redes Sociales */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Redes Sociales</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="facebookUrl">Facebook</Label>
                      <Input
                        id="facebookUrl"
                        type="url"
                        value={siteSettings.socialMedia.facebook || ''}
                        onChange={(e) => setSiteSettings({
                          ...siteSettings,
                          socialMedia: { ...siteSettings.socialMedia, facebook: e.target.value }
                        })}
                        placeholder="https://facebook.com/servipro"
                      />
                    </div>

                    <div>
                      <Label htmlFor="instagramUrl">Instagram</Label>
                      <Input
                        id="instagramUrl"
                        type="url"
                        value={siteSettings.socialMedia.instagram || ''}
                        onChange={(e) => setSiteSettings({
                          ...siteSettings,
                          socialMedia: { ...siteSettings.socialMedia, instagram: e.target.value }
                        })}
                        placeholder="https://instagram.com/servipro"
                      />
                    </div>

                    <div>
                      <Label htmlFor="twitterUrl">Twitter/X</Label>
                      <Input
                        id="twitterUrl"
                        type="url"
                        value={siteSettings.socialMedia.twitter || ''}
                        onChange={(e) => setSiteSettings({
                          ...siteSettings,
                          socialMedia: { ...siteSettings.socialMedia, twitter: e.target.value }
                        })}
                        placeholder="https://twitter.com/servipro"
                      />
                    </div>

                    <div>
                      <Label htmlFor="tiktokUrl">TikTok</Label>
                      <Input
                        id="tiktokUrl"
                        type="url"
                        value={siteSettings.socialMedia.tiktok || ''}
                        onChange={(e) => setSiteSettings({
                          ...siteSettings,
                          socialMedia: { ...siteSettings.socialMedia, tiktok: e.target.value }
                        })}
                        placeholder="https://tiktok.com/@servipro"
                      />
                    </div>

                    <div>
                      <Label htmlFor="youtubeUrl">YouTube</Label>
                      <Input
                        id="youtubeUrl"
                        type="url"
                        value={siteSettings.socialMedia.youtube || ''}
                        onChange={(e) => setSiteSettings({
                          ...siteSettings,
                          socialMedia: { ...siteSettings.socialMedia, youtube: e.target.value }
                        })}
                        placeholder="https://youtube.com/@servipro"
                      />
                    </div>
                  </div>
                </div>

                {/* Configuración Regional */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Configuración Regional</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="currency">Moneda</Label>
                      <Select
                        value={siteSettings.currency}
                        onValueChange={(value) => setSiteSettings({...siteSettings, currency: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD - Dólar Estadounidense</SelectItem>
                          <SelectItem value="MXN">MXN - Peso Mexicano</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="CAD">CAD - Dólar Canadiense</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="timezone">Zona Horaria</Label>
                      <Select
                        value={siteSettings.timezone}
                        onValueChange={(value) => setSiteSettings({...siteSettings, timezone: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                          <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                          <SelectItem value="America/Mexico_City">México Central</SelectItem>
                          <SelectItem value="Europe/Madrid">Madrid, España</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="language">Idioma</Label>
                      <Select
                        value={siteSettings.language}
                        onValueChange={(value) => setSiteSettings({...siteSettings, language: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={() => saveSettings('site')} 
                    disabled={isSaving}
                    className="bg-primary-600 hover:bg-primary-700"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar Configuración
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gestión de Cupones */}
          <TabsContent value="coupons" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Cupones de Descuento</CardTitle>
                    <CardDescription>
                      Gestiona cupones y promociones para tu tienda
                    </CardDescription>
                  </div>
                  <Button onClick={() => openCouponModal()} className="bg-primary-600 hover:bg-primary-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Cupón
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {coupons.length === 0 ? (
                  <div className="text-center py-12">
                    <Tag className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      No hay cupones creados
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Crea tu primer cupón de descuento para ofrecer promociones
                    </p>
                    <Button onClick={() => openCouponModal()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Primer Cupón
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {coupons.map((coupon) => (
                      <div key={coupon.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <code className="bg-gray-100 px-2 py-1 rounded text-lg font-mono font-bold">
                                  {coupon.code}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyCouponCode(coupon.code)}
                                  className="p-1 h-6 w-6"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                                <Badge className={getCouponTypeColor(coupon.type)}>
                                  {getCouponTypeText(coupon.type)}
                                </Badge>
                                <Badge variant={coupon.isActive ? "default" : "secondary"}>
                                  {coupon.isActive ? (
                                    <>
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Activo
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="h-3 w-3 mr-1" />
                                      Inactivo
                                    </>
                                  )}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p>
                                  <strong>Descuento:</strong>{' '}
                                  {coupon.type === 'PERCENTAGE' 
                                    ? `${coupon.value}%` 
                                    : coupon.type === 'FIXED_AMOUNT'
                                      ? formatPrice(coupon.value)
                                      : 'Envío Gratis'
                                  }
                                </p>
                                {coupon.minAmount && (
                                  <p><strong>Compra mínima:</strong> {formatPrice(coupon.minAmount)}</p>
                                )}
                                {coupon.usageLimit && (
                                  <p>
                                    <strong>Usos:</strong> {coupon.usageCount}/{coupon.usageLimit}
                                  </p>
                                )}
                                {coupon.expiresAt && (
                                  <p><strong>Expira:</strong> {formatDate(coupon.expiresAt)}</p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleCouponStatus(coupon)}
                              className={coupon.isActive ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                            >
                              {coupon.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openCouponModal(coupon)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setCouponToDelete(coupon);
                                setShowDeleteDialog(true);
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Newsletter Tab */}
<TabsContent value="newsletter" className="space-y-6">
  {/* Estadísticas mejoradas */}
<div className="grid grid-cols-1 md:grid-cols-5 gap-6">
  {newsletterStats && (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Activos</p>
              <p className="text-2xl font-bold">{newsletterStats.activeSubscribers}</p>
              <p className="text-xs text-green-600 mt-1">
                +{newsletterStats.recentSubscribers} este mes
              </p>
            </div>
            <UsersIcon className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Usuarios Suscritos</p>
              <p className="text-2xl font-bold">{newsletterStats.subscribedUsers}</p>
              <p className="text-xs text-gray-500 mt-1">
                De {newsletterStats.totalUsers} usuarios
              </p>
            </div>
            <User className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Guests Activos</p>
              <p className="text-2xl font-bold">{newsletterStats.activeGuests}</p>
              <p className="text-xs text-gray-500 mt-1">
                De {newsletterStats.totalGuests} guests
              </p>
            </div>
            <Mail className="h-8 w-8 text-yellow-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Campañas Enviadas</p>
              <p className="text-2xl font-bold">{newsletterStats.sentCampaigns}</p>
              <p className="text-xs text-gray-500 mt-1">
                {newsletterStats.draftCampaigns} borradores
              </p>
            </div>
            <Send className="h-8 w-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tasa Crecimiento</p>
              <p className="text-2xl font-bold">{newsletterStats.growthRate}%</p>
              <p className="text-xs text-gray-500 mt-1">Últimos 30 días</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>
    </>
  )}
</div>

  {/* Crear Nueva Campaña */}
  <Card>
    <CardHeader>
      <div className="flex justify-between items-center">
        <div>
          <CardTitle>Enviar Newsletter</CardTitle>
          <CardDescription>
            Crea y envía emails a tus suscriptores
          </CardDescription>
        </div>
        <Button 
          onClick={() => setShowCampaignModal(true)}
          className="bg-primary-600 hover:bg-primary-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Campaña
        </Button>
      </div>
    </CardHeader>
  </Card>

  {/* Lista de Campañas Recientes */}
  <Card>
    <CardHeader>
      <CardTitle>Campañas Recientes</CardTitle>
    </CardHeader>
    <CardContent>
      {campaigns.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay campañas creadas</p>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.slice(0, 5).map((campaign) => (
            <div key={campaign.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{campaign.subject}</h4>
                  <p className="text-sm text-gray-500">
                    {formatDate(campaign.createdAt)} • {campaign._count.recipients} enviados
                  </p>
                </div>
                <Badge className={
                  campaign.status === 'SENT' ? 'bg-green-100 text-green-800' :
                  campaign.status === 'SENDING' ? 'bg-blue-100 text-blue-800' :
                  campaign.status === 'SCHEDULED' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }>
                  {campaign.status === 'SENT' ? 'Enviado' :
                   campaign.status === 'SENDING' ? 'Enviando' :
                   campaign.status === 'SCHEDULED' ? 'Programado' :
                   'Borrador'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>

  {/* Lista de Suscriptores */}
  <Card>
    <CardHeader>
      <CardTitle>Suscriptores Recientes</CardTitle>
      <CardDescription>
        {subscribers.length} suscriptores totales
      </CardDescription>
    </CardHeader>
    <CardContent>
      {isLoadingNewsletter ? (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Cargando suscriptores...</p>
        </div>
      ) : subscribers.length === 0 ? (
        <div className="text-center py-8">
          <UsersIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay suscriptores aún</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="text-left py-2">Email</th>
                <th className="text-left py-2">Nombre</th>
                <th className="text-left py-2">Estado</th>
                <th className="text-left py-2">Suscrito</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.slice(0, 10).map((sub) => (
                <tr key={sub.id} className="border-b">
                  <td className="py-2">{sub.email}</td>
                  <td className="py-2">{sub.name || sub.user?.firstName || '-'}</td>
                  <td className="py-2">
                    <Badge variant={sub.isActive ? "default" : "secondary"}>
                      {sub.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td className="py-2 text-sm text-gray-500">
                    {formatDate(sub.subscribedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </CardContent>
  </Card>
</TabsContent>

          {/* Configuración de Pagos */}
          <TabsContent value="payment" className="space-y-6">
            <div className="grid gap-6">
              {/* Stripe */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Stripe
                      </CardTitle>
                      <CardDescription>
                        Procesamiento de tarjetas de crédito y débito
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="stripeEnabled"
                        checked={paymentSettings.stripe.enabled}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          stripe: { ...paymentSettings.stripe, enabled: e.target.checked }
                        })}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="stripeEnabled">Habilitado</Label>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="stripePublicKey">Clave Pública</Label>
                      <Input
                        id="stripePublicKey"
                        value={paymentSettings.stripe.publicKey}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          stripe: { ...paymentSettings.stripe, publicKey: e.target.value }
                        })}
                        placeholder="pk_test_..."
                        disabled={!paymentSettings.stripe.enabled}
                      />
                    </div>
                    <div>
                      <Label htmlFor="stripeSecretKey">Clave Secreta</Label>
                      <Input
                        id="stripeSecretKey"
                        type="password"
                        value={paymentSettings.stripe.secretKey}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          stripe: { ...paymentSettings.stripe, secretKey: e.target.value }
                        })}
                        placeholder="sk_test_..."
                        disabled={!paymentSettings.stripe.enabled}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="stripeWebhook">Webhook Secret</Label>
                    <Input
                      id="stripeWebhook"
                      type="password"
                      value={paymentSettings.stripe.webhookSecret}
                      onChange={(e) => setPaymentSettings({
                        ...paymentSettings,
                        stripe: { ...paymentSettings.stripe, webhookSecret: e.target.value }
                      })}
                      placeholder="whsec_..."
                      disabled={!paymentSettings.stripe.enabled}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* PayPal */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                        PayPal
                      </CardTitle>
                      <CardDescription>
                        Pagos con PayPal y tarjetas a través de PayPal
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="paypalEnabled"
                        checked={paymentSettings.paypal.enabled}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          paypal: { ...paymentSettings.paypal, enabled: e.target.checked }
                        })}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="paypalEnabled">Habilitado</Label>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="paypalClientId">Client ID</Label>
                      <Input
                        id="paypalClientId"
                        value={paymentSettings.paypal.clientId}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          paypal: { ...paymentSettings.paypal, clientId: e.target.value }
                        })}
                        placeholder="AY..."
                        disabled={!paymentSettings.paypal.enabled}
                      />
                    </div>
                    <div>
                      <Label htmlFor="paypalClientSecret">Client Secret</Label>
                      <Input
                        id="paypalClientSecret"
                        type="password"
                        value={paymentSettings.paypal.clientSecret}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          paypal: { ...paymentSettings.paypal, clientSecret: e.target.value }
                        })}
                        placeholder="EH..."
                        disabled={!paymentSettings.paypal.enabled}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="paypalSandbox"
                      checked={paymentSettings.paypal.sandbox}
                      onChange={(e) => setPaymentSettings({
                        ...paymentSettings,
                        paypal: { ...paymentSettings.paypal, sandbox: e.target.checked }
                      })}
                      className="rounded border-gray-300"
                      disabled={!paymentSettings.paypal.enabled}
                    />
                    <Label htmlFor="paypalSandbox">Modo Sandbox (pruebas)</Label>
                  </div>
                </CardContent>
              </Card>

              {/* Zelle */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Phone className="h-5 w-5 text-purple-600" />
                        Zelle
                      </CardTitle>
                      <CardDescription>
                        Transferencias bancarias instantáneas
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="zelleEnabled"
                        checked={paymentSettings.zelle.enabled}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          zelle: { ...paymentSettings.zelle, enabled: e.target.checked }
                        })}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="zelleEnabled">Habilitado</Label>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="zelleEmail">Email de Zelle</Label>
                      <Input
                        id="zelleEmail"
                        type="email"
                        value={paymentSettings.zelle.email}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          zelle: { ...paymentSettings.zelle, email: e.target.value }
                        })}
                        placeholder="zelle@servipro.com"
                        disabled={!paymentSettings.zelle.enabled}
                      />
                    </div>
                    <div>
                      <Label htmlFor="zellePhone">Teléfono de Zelle</Label>
                      <Input
                        id="zellePhone"
                        value={paymentSettings.zelle.phone}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          zelle: { ...paymentSettings.zelle, phone: e.target.value }
                        })}
                        placeholder="+1 832-523-0060"
                        disabled={!paymentSettings.zelle.enabled}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Efectivo contra entrega */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5 text-green-600" />
                        Efectivo contra Entrega
                      </CardTitle>
                      <CardDescription>
                        Pago en efectivo al recibir el producto
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="codEnabled"
                        checked={paymentSettings.cashOnDelivery.enabled}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          cashOnDelivery: { ...paymentSettings.cashOnDelivery, enabled: e.target.checked }
                        })}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="codEnabled">Habilitado</Label>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="codFee">Tarifa Adicional (USD)</Label>
                    <Input
                      id="codFee"
                      type="number"
                      step="0.01"
                      value={paymentSettings.cashOnDelivery.fee}
                      onChange={(e) => setPaymentSettings({
                        ...paymentSettings,
                        cashOnDelivery: { ...paymentSettings.cashOnDelivery, fee: Number(e.target.value) }
                      })}
                      placeholder="0.00"
                      disabled={!paymentSettings.cashOnDelivery.enabled}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Tarifa adicional por el servicio de efectivo contra entrega
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={() => saveSettings('payment')} 
                disabled={isSaving}
                className="bg-primary-600 hover:bg-primary-700"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Configuración
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Configuración de Envíos */}
          <TabsContent value="shipping" className="space-y-6">
            <div className="grid gap-6">
              {/* Configuración General */}
              <Card>
                <CardHeader>
                  <CardTitle>Configuración General de Envíos</CardTitle>
                  <CardDescription>
                    Políticas y costos generales de envío
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="freeShippingThreshold">Envío Gratis desde (USD)</Label>
                      <Input
                        id="freeShippingThreshold"
                        type="number"
                        step="0.01"
                        value={shippingSettings.freeShippingThreshold}
                        onChange={(e) => setShippingSettings({
                          ...shippingSettings,
                          freeShippingThreshold: Number(e.target.value)
                        })}
                        placeholder="100.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="defaultShippingCost">Costo de Envío por Defecto (USD)</Label>
                      <Input
                        id="defaultShippingCost"
                        type="number"
                        step="0.01"
                        value={shippingSettings.defaultShippingCost}
                        onChange={(e) => setShippingSettings({
                          ...shippingSettings,
                          defaultShippingCost: Number(e.target.value)
                        })}
                        placeholder="10.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxShippingDays">Días Máximos de Entrega</Label>
                      <Input
                        id="maxShippingDays"
                        type="number"
                        value={shippingSettings.maxShippingDays}
                        onChange={(e) => setShippingSettings({
                          ...shippingSettings,
                          maxShippingDays: Number(e.target.value)
                        })}
                        placeholder="7"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Zonas de Envío */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Zonas de Envío</CardTitle>
                      <CardDescription>
                        Configura diferentes zonas con costos y tiempos específicos
                      </CardDescription>
                    </div>
                    <Button 
                      onClick={() => {
                        const newZone = {
                          id: `zone-${Date.now()}`,
                          name: '',
                          countries: [],
                          cost: 0,
                          estimatedDays: 1
                        };
                        setShippingSettings({
                          ...shippingSettings,
                          zones: [...shippingSettings.zones, newZone]
                        });
                      }}
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Zona
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {shippingSettings.zones.length === 0 ? (
                    <div className="text-center py-8">
                      <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No hay zonas configuradas</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {shippingSettings.zones.map((zone, index) => (
                        <div key={zone.id} className="border rounded-lg p-4 space-y-4">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">Zona {index + 1}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newZones = shippingSettings.zones.filter((_, i) => i !== index);
                                setShippingSettings({...shippingSettings, zones: newZones});
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <Label htmlFor={`zoneName-${index}`}>Nombre de la Zona</Label>
                              <Input
                                id={`zoneName-${index}`}
                                value={zone.name}
                                onChange={(e) => {
                                  const newZones = [...shippingSettings.zones];
                                  newZones[index].name = e.target.value;
                                  setShippingSettings({...shippingSettings, zones: newZones});
                                }}
                                placeholder="Estados Unidos"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`zoneCountries-${index}`}>Países (separados por coma)</Label>
                              <Input
                                id={`zoneCountries-${index}`}
                                value={zone.countries.join(', ')}
                                onChange={(e) => {
                                  const newZones = [...shippingSettings.zones];
                                  newZones[index].countries = e.target.value.split(',').map(c => c.trim()).filter(c => c);
                                  setShippingSettings({...shippingSettings, zones: newZones});
                                }}
                                placeholder="Estados Unidos, México"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`zoneCost-${index}`}>Costo (USD)</Label>
                              <Input
                                id={`zoneCost-${index}`}
                                type="number"
                                step="0.01"
                                value={zone.cost}
                                onChange={(e) => {
                                  const newZones = [...shippingSettings.zones];
                                  newZones[index].cost = Number(e.target.value);
                                  setShippingSettings({...shippingSettings, zones: newZones});
                                }}
                                placeholder="10.00"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`zoneDays-${index}`}>Días Estimados</Label>
                              <Input
                                id={`zoneDays-${index}`}
                                type="number"
                                value={zone.estimatedDays}
                                onChange={(e) => {
                                  const newZones = [...shippingSettings.zones];
                                  newZones[index].estimatedDays = Number(e.target.value);
                                  setShippingSettings({...shippingSettings, zones: newZones});
                                }}
                                placeholder="5"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Países Restringidos */}
              <Card>
                <CardHeader>
                  <CardTitle>Países Restringidos</CardTitle>
                  <CardDescription>
                    Países donde no se realizan envíos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="restrictedCountries">Países Restringidos (separados por coma)</Label>
                    <Textarea
                      id="restrictedCountries"
                      value={shippingSettings.restrictedCountries.join(', ')}
                      onChange={(e) => setShippingSettings({
                        ...shippingSettings,
                        restrictedCountries: e.target.value.split(',').map(c => c.trim()).filter(c => c)
                      })}
                      placeholder="Corea del Norte, Irán, Siria"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={() => saveSettings('shipping')} 
                disabled={isSaving}
                className="bg-primary-600 hover:bg-primary-700"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Configuración
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Configuración SEO */}
          <TabsContent value="seo" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración SEO y Meta Tags</CardTitle>
                  <CardDescription>
                    Optimización para motores de búsqueda y redes sociales
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="metaTitle">Título Principal (Meta Title)</Label>
                    <Input
                      id="metaTitle"
                      value={siteSettings.siteName || ''}
                      onChange={(e) => setSiteSettings({...siteSettings, siteName: e.target.value})}
                      placeholder="ServiPro Garcia LLC - Productos de Alta Calidad"
                      maxLength={60}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Máximo 60 caracteres. Este título aparece en los resultados de Google.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="metaDescription">Descripción Meta (Meta Description)</Label>
                    <Textarea
                      id="metaDescription"
                      value={siteSettings.siteDescription || ''}
                      onChange={(e) => setSiteSettings({...siteSettings, siteDescription: e.target.value})}
                      placeholder="Tienda online especializada en productos de alta demanda. Envíos rápidos y seguros. Descubre nuestra selección de productos artesanales y servicios de dropshipping."
                      rows={3}
                      maxLength={160}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Máximo 160 caracteres. Esta descripción aparece bajo el título en Google.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="keywords">Palabras Clave</Label>
                    <Input
                      id="keywords"
                      placeholder="ecommerce, productos artesanales, dropshipping, Houston, Texas"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Separa las palabras clave con comas. Máximo 10 palabras clave.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="ogImage">Imagen para Redes Sociales (URL)</Label>
                      <Input
                        id="ogImage"
                        type="url"
                        placeholder="https://servipro.com/og-image.jpg"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Imagen que aparece cuando compartes tu sitio en redes sociales. Tamaño recomendado: 1200x630px.
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="twitterCard">Tipo de Tarjeta de Twitter</Label>
                      <Select defaultValue="summary_large_image">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="summary">Resumen</SelectItem>
                          <SelectItem value="summary_large_image">Resumen con Imagen Grande</SelectItem>
                          <SelectItem value="app">Aplicación</SelectItem>
                          <SelectItem value="player">Reproductor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Configuración de Sitemap y Robots</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="enableSitemap"
                          defaultChecked={true}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="enableSitemap">Generar sitemap.xml automáticamente</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="allowIndexing"
                          defaultChecked={true}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="allowIndexing">Permitir indexación por motores de búsqueda</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="enableRichSnippets"
                          defaultChecked={true}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="enableRichSnippets">Habilitar Rich Snippets para productos</Label>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Códigos de Seguimiento</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="googleAnalytics">Google Analytics 4 (Measurement ID)</Label>
                        <Input
                          id="googleAnalytics"
                          placeholder="G-XXXXXXXXXX"
                        />
                      </div>

                      <div>
                        <Label htmlFor="googleTagManager">Google Tag Manager (Container ID)</Label>
                        <Input
                          id="googleTagManager"
                          placeholder="GTM-XXXXXXX"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <Label htmlFor="facebookPixel">Facebook Pixel ID</Label>
                      <Input
                        id="facebookPixel"
                        placeholder="123456789012345"
                      />
                    </div>

                    <div className="mt-4">
                      <Label htmlFor="customCode">Código Personalizado (Head)</Label>
                      <Textarea
                        id="customCode"
                        placeholder="<!-- Código personalizado que se insertará en el <head> -->"
                        rows={4}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Código HTML/JavaScript personalizado que se insertará en el head de todas las páginas.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={() => saveSettings('site')} 
                disabled={isSaving}
                className="bg-primary-600 hover:bg-primary-700"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Configuración SEO
                  </>
                )}
              </Button>
            </div>
          </TabsContent>          
        </Tabs>

        {/* Modal de cupón */}
        <Dialog open={showCouponModal} onOpenChange={setShowCouponModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {isCreatingCoupon ? 'Crear Nuevo Cupón' : 'Editar Cupón'}
              </DialogTitle>
              <DialogDescription>
                {isCreatingCoupon 
                  ? 'Configura tu nuevo cupón de descuento'
                  : 'Modifica la configuración del cupón'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="couponCode">Código del Cupón</Label>
                <Input
                  id="couponCode"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})}
                  placeholder="DESCUENTO10"
                />
              </div>

              <div>
                <Label>Tipo de Descuento</Label>
                <Select 
                  value={couponForm.type} 
                  onValueChange={(value: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING') => 
                    setCouponForm({...couponForm, type: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Porcentaje</SelectItem>
                    <SelectItem value="FIXED_AMOUNT">Cantidad Fija</SelectItem>
                    <SelectItem value="FREE_SHIPPING">Envío Gratis</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {couponForm.type !== 'FREE_SHIPPING' && (
                <div>
                  <Label htmlFor="couponValue">
                    {couponForm.type === 'PERCENTAGE' ? 'Porcentaje de Descuento' : 'Monto de Descuento'}
                  </Label>
                  <Input
                    id="couponValue"
                    type="number"
                    step={couponForm.type === 'PERCENTAGE' ? "1" : "0.01"}
                    value={couponForm.value}
                    onChange={(e) => setCouponForm({...couponForm, value: Number(e.target.value)})}
                    placeholder={couponForm.type === 'PERCENTAGE' ? "10" : "5.00"}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minAmount">Compra Mínima (opcional)</Label>
                  <Input
                    id="minAmount"
                    type="number"
                    step="0.01"
                    value={couponForm.minAmount}
                    onChange={(e) => setCouponForm({...couponForm, minAmount: e.target.value})}
                    placeholder="50.00"
                  />
                </div>

                <div>
                  <Label htmlFor="usageLimit">Límite de Usos (opcional)</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    value={couponForm.usageLimit}
                    onChange={(e) => setCouponForm({...couponForm, usageLimit: e.target.value})}
                    placeholder="100"
                  />
                </div>
              </div>

              {couponForm.type === 'PERCENTAGE' && (
                <div>
                  <Label htmlFor="maxDiscount">Descuento Máximo (opcional)</Label>
                  <Input
                    id="maxDiscount"
                    type="number"
                    step="0.01"
                    value={couponForm.maxDiscount}
                    onChange={(e) => setCouponForm({...couponForm, maxDiscount: e.target.value})}
                    placeholder="20.00"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startsAt">Fecha de Inicio (opcional)</Label>
                  <Input
                    id="startsAt"
                    type="date"
                    value={couponForm.startsAt}
                    onChange={(e) => setCouponForm({...couponForm, startsAt: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="expiresAt">Fecha de Expiración (opcional)</Label>
                  <Input
                    id="expiresAt"
                    type="date"
                    value={couponForm.expiresAt}
                    onChange={(e) => setCouponForm({...couponForm, expiresAt: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={couponForm.isActive}
                  onChange={(e) => setCouponForm({...couponForm, isActive: e.target.checked})}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isActive">Cupón activo</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCouponModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCouponSubmit}>
                {isCreatingCoupon ? 'Crear Cupón' : 'Guardar Cambios'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de confirmación de eliminación */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estás seguro de que quieres eliminar el cupón "{couponToDelete?.code}"? 
                Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteCoupon}
                className="bg-red-600 hover:bg-red-700"
              >
                Eliminar Cupón
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      {/* Modal de Nueva Campaña */}
<Dialog open={showCampaignModal} onOpenChange={setShowCampaignModal}>
  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Crear Nueva Campaña de Newsletter</DialogTitle>
      <DialogDescription>
        Envía un email a todos tus suscriptores activos
      </DialogDescription>
    </DialogHeader>
    
    <div className="space-y-4">
      <div>
        <Label htmlFor="campaignSubject">Asunto del Email</Label>
        <Input
          id="campaignSubject"
          value={campaignForm.subject}
          onChange={(e) => setCampaignForm({...campaignForm, subject: e.target.value})}
          placeholder="🎉 Ofertas Especiales de la Semana"
        />
      </div>

      <div>
        <Label htmlFor="campaignPreview">Texto de Preview (opcional)</Label>
        <Input
          id="campaignPreview"
          value={campaignForm.previewText}
          onChange={(e) => setCampaignForm({...campaignForm, previewText: e.target.value})}
          placeholder="Descubre las mejores ofertas..."
          maxLength={200}
        />
      </div>

      <div>
        <Label htmlFor="campaignContent">Contenido del Email (HTML)</Label>
        <Textarea
          id="campaignContent"
          value={campaignForm.content}
          onChange={(e) => setCampaignForm({...campaignForm, content: e.target.value})}
          placeholder="<h2>Hola {nombre}</h2><p>Tenemos increíbles ofertas para ti...</p>"
          rows={10}
          className="font-mono text-sm"
        />
        <p className="text-sm text-gray-500 mt-1">
          Puedes usar HTML. Variables disponibles: {'{nombre}'}, {'{email}'}
        </p>
      </div>

      <div className="space-y-3">
  <Label>Destinatarios</Label>
  <div className="flex items-center space-x-2">
    <input
      type="checkbox"
      id="includeUsers"
      defaultChecked
      className="rounded border-gray-300"
    />
    <Label htmlFor="includeUsers">
      Incluir usuarios registrados suscritos ({newsletterStats?.subscribedUsers || 0})
    </Label>
  </div>
  <div className="flex items-center space-x-2">
    <input
      type="checkbox"
      id="includeGuests"
      defaultChecked
      className="rounded border-gray-300"
    />
    <Label htmlFor="includeGuests">
      Incluir suscriptores guest ({newsletterStats?.activeGuests || 0})
    </Label>
  </div>
</div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="sendNow"
          checked={campaignForm.sendNow}
          onChange={(e) => setCampaignForm({...campaignForm, sendNow: e.target.checked})}
          className="rounded border-gray-300"
        />
        <Label htmlFor="sendNow">Enviar inmediatamente</Label>
      </div>

      {!campaignForm.sendNow && (
        <div>
          <Label htmlFor="scheduledFor">Programar para</Label>
          <Input
            id="scheduledFor"
            type="datetime-local"
            value={campaignForm.scheduledFor}
            onChange={(e) => setCampaignForm({...campaignForm, scheduledFor: e.target.value})}
          />
        </div>
      )}
    </div>

    <DialogFooter>
      <Button variant="outline" onClick={handlePreviewCampaign}>
        <Eye className="h-4 w-4 mr-2" />
        Preview
      </Button>
      <Button variant="outline" onClick={() => setShowCampaignModal(false)}>
        Cancelar
      </Button>
      <Button onClick={handleSendCampaign} className="bg-green-600 hover:bg-green-700">
        <Send className="h-4 w-4 mr-2" />
        {campaignForm.sendNow ? 'Enviar Ahora' : 'Guardar Campaña'}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

{/* Modal de Preview */}
<Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Preview del Email</DialogTitle>
    </DialogHeader>
    <div 
      className="border rounded-lg p-4 bg-gray-50"
      dangerouslySetInnerHTML={{ __html: previewHtml }}
    />
    <DialogFooter>
      <Button onClick={() => setShowPreviewModal(false)}>Cerrar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </div>
  );
}