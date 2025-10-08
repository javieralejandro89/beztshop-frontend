// src/app/admin/settings/page.tsx - Configuración simplificada (Cupones y Newsletter)
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
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Copy,
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
  Tag,
  Send,
  Users as UsersIcon,
  User,
  Mail,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatPrice, formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import { adminApi } from '@/lib/api';

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
  const [activeTab, setActiveTab] = useState('coupons');
  const [isLoading, setIsLoading] = useState(true);

  // Estados para Cupones
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const [isCreatingCoupon, setIsCreatingCoupon] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
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
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        loadCoupons(),
        loadNewsletterData()
      ]);
    } catch (err: any) {
      console.error('Error loading data:', err);
      error('Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== FUNCIONES DE CUPONES ====================
  const loadCoupons = async () => {
    try {
      const data = await adminApi.getCoupons();
      setCoupons(data.coupons);
    } catch (err: any) {
      console.error('Error loading coupons:', err);
      error('Error al cargar los cupones');
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
      PERCENTAGE: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      FIXED_AMOUNT: 'bg-green-500/20 text-green-400 border-green-500/30',
      FREE_SHIPPING: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    };
    return colorMap[type as keyof typeof colorMap] || 'bg-[#1F1F1F] text-gray-400 border-[#1F1F1F]';
  };

  // ==================== FUNCIONES DE NEWSLETTER ====================
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
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#FFD700]" />
          <div className="text-lg text-white">Cargando configuración...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/admin/dashboard')}
            className="p-2 text-white hover:bg-[#1F1F1F] hover:text-[#FFD700]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Settings className="h-8 w-8 text-[#FFD700]" />
              Configuración
            </h1>
            <p className="text-gray-400 mt-2">
              Gestiona cupones de descuento y campañas de newsletter
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-[#1F1F1F] border border-[#FFD700]/20">
            <TabsTrigger 
              value="coupons" 
              className="flex items-center gap-2 data-[state=active]:bg-[#FFD700] data-[state=active]:text-[#0D0D0D] text-gray-400"
            >
              <Tag className="h-4 w-4" />
              Cupones
            </TabsTrigger>
            <TabsTrigger 
              value="newsletter" 
              className="flex items-center gap-2 data-[state=active]:bg-[#FFD700] data-[state=active]:text-[#0D0D0D] text-gray-400"
            >
              <Send className="h-4 w-4" />
              Newsletter
            </TabsTrigger>
          </TabsList>

          {/* TAB DE CUPONES */}
          <TabsContent value="coupons" className="space-y-6">
            <Card className="bg-[#1F1F1F] border-[#FFD700]/20">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white">Cupones de Descuento</CardTitle>
                    <CardDescription className="text-gray-400">
                      Gestiona cupones y promociones para tu tienda
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => openCouponModal()} 
                    className="bg-[#FFD700] hover:bg-[#00C8FF] text-[#0D0D0D] font-semibold"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Cupón
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {coupons.length === 0 ? (
                  <div className="text-center py-12">
                    <Tag className="h-16 w-16 text-gray-600 mx-auto mb-6" />
                    <h2 className="text-xl font-semibold text-white mb-4">
                      No hay cupones creados
                    </h2>
                    <p className="text-gray-400 mb-6">
                      Crea tu primer cupón de descuento para ofrecer promociones
                    </p>
                    <Button onClick={() => openCouponModal()} className="bg-[#FFD700] hover:bg-[#00C8FF] text-[#0D0D0D]">
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Primer Cupón
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {coupons.map((coupon) => (
                      <div key={coupon.id} className="border border-[#FFD700]/20 rounded-lg p-4 hover:bg-[#0D0D0D] transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <code className="bg-[#0D0D0D] px-2 py-1 rounded text-lg font-mono font-bold text-[#FFD700]">
                                  {coupon.code}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyCouponCode(coupon.code)}
                                  className="p-1 h-6 w-6 text-gray-400 hover:text-[#FFD700]"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                                <Badge className={getCouponTypeColor(coupon.type)}>
                                  {getCouponTypeText(coupon.type)}
                                </Badge>
                                <Badge 
                                  variant={coupon.isActive ? "default" : "secondary"} 
                                  className={coupon.isActive ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}
                                >
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
                              <div className="text-sm text-gray-400 space-y-1">
                                <p>
                                  <strong className="text-white">Descuento:</strong>{' '}
                                  {coupon.type === 'PERCENTAGE' 
                                    ? `${coupon.value}%` 
                                    : coupon.type === 'FIXED_AMOUNT'
                                      ? formatPrice(coupon.value)
                                      : 'Envío Gratis'
                                  }
                                </p>
                                {coupon.minAmount && (
                                  <p><strong className="text-white">Compra mínima:</strong> {formatPrice(coupon.minAmount)}</p>
                                )}
                                {coupon.usageLimit && (
                                  <p>
                                    <strong className="text-white">Usos:</strong> {coupon.usageCount}/{coupon.usageLimit}
                                  </p>
                                )}
                                {coupon.expiresAt && (
                                  <p><strong className="text-white">Expira:</strong> {formatDate(coupon.expiresAt)}</p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleCouponStatus(coupon)}
                              className={coupon.isActive ? "text-red-400 hover:text-red-300" : "text-green-400 hover:text-green-300"}
                            >
                              {coupon.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openCouponModal(coupon)}
                              className="text-gray-400 hover:text-[#FFD700]"
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
                              className="text-red-400 hover:text-red-300"
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

          {/* TAB DE NEWSLETTER */}
          <TabsContent value="newsletter" className="space-y-6">
            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {newsletterStats && (
                <>
                  <Card className="bg-[#1F1F1F] border-green-500/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Total Activos</p>
                          <p className="text-2xl font-bold text-white">{newsletterStats.activeSubscribers}</p>
                          <p className="text-xs text-green-400 mt-1">
                            +{newsletterStats.recentSubscribers} este mes
                          </p>
                        </div>
                        <UsersIcon className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#1F1F1F] border-blue-500/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Usuarios Suscritos</p>
                          <p className="text-2xl font-bold text-white">{newsletterStats.subscribedUsers}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            De {newsletterStats.totalUsers} usuarios
                          </p>
                        </div>
                        <User className="h-8 w-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#1F1F1F] border-yellow-500/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Guests Activos</p>
                          <p className="text-2xl font-bold text-white">{newsletterStats.activeGuests}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            De {newsletterStats.totalGuests} guests
                          </p>
                        </div>
                        <Mail className="h-8 w-8 text-yellow-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#1F1F1F] border-purple-500/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Campañas Enviadas</p>
                          <p className="text-2xl font-bold text-white">{newsletterStats.sentCampaigns}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {newsletterStats.draftCampaigns} borradores
                          </p>
                        </div>
                        <Send className="h-8 w-8 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#1F1F1F] border-[#FFD700]/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Tasa Crecimiento</p>
                          <p className="text-2xl font-bold text-white">{newsletterStats.growthRate}%</p>
                          <p className="text-xs text-gray-500 mt-1">Últimos 30 días</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-[#FFD700]" />
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Crear Nueva Campaña */}
            <Card className="bg-[#1F1F1F] border-[#FFD700]/20">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white">Enviar Newsletter</CardTitle>
                    <CardDescription className="text-gray-400">
                      Crea y envía emails a tus suscriptores
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => setShowCampaignModal(true)}
                    className="bg-[#FFD700] hover:bg-[#00C8FF] text-[#0D0D0D] font-semibold"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Campaña
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Lista de Campañas Recientes */}
            <Card className="bg-[#1F1F1F] border-[#FFD700]/20">
              <CardHeader>
                <CardTitle className="text-white">Campañas Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                {campaigns.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No hay campañas creadas</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {campaigns.slice(0, 5).map((campaign) => (
                      <div key={campaign.id} className="border border-[#FFD700]/20 rounded-lg p-4 bg-[#0D0D0D]">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-white">{campaign.subject}</h4>
                            <p className="text-sm text-gray-400">
                              {formatDate(campaign.createdAt)} • {campaign._count.recipients} enviados
                            </p>
                          </div>
                          <Badge className={
                            campaign.status === 'SENT' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                            campaign.status === 'SENDING' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                            campaign.status === 'SCHEDULED' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                            'bg-gray-500/20 text-gray-400 border-gray-500/30'
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
            <Card className="bg-[#1F1F1F] border-[#FFD700]/20">
              <CardHeader>
                <CardTitle className="text-white">Suscriptores Recientes</CardTitle>
                <CardDescription className="text-gray-400">
                  {subscribers.length} suscriptores totales
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingNewsletter ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#FFD700]" />
                    <p className="text-gray-400">Cargando suscriptores...</p>
                  </div>
                ) : subscribers.length === 0 ? (
                  <div className="text-center py-8">
                    <UsersIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No hay suscriptores aún</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-[#FFD700]/20">
                        <tr>
                          <th className="text-left py-2 text-white">Email</th>
                          <th className="text-left py-2 text-white">Nombre</th>
                          <th className="text-left py-2 text-white">Estado</th>
                          <th className="text-left py-2 text-white">Suscrito</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscribers.slice(0, 10).map((sub) => (
                          <tr key={sub.id} className="border-b border-[#FFD700]/10">
                            <td className="py-2 text-gray-300">{sub.email}</td>
                            <td className="py-2 text-gray-300">{sub.name || sub.user?.firstName || '-'}</td>
                            <td className="py-2">
                              <Badge 
                                variant={sub.isActive ? "default" : "secondary"} 
                                className={sub.isActive ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}
                              >
                                {sub.isActive ? 'Activo' : 'Inactivo'}
                              </Badge>
                            </td>
                            <td className="py-2 text-sm text-gray-400">
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
        </Tabs>

        {/* MODALES */}

        {/* Modal de Cupón */}
        <Dialog open={showCouponModal} onOpenChange={setShowCouponModal}>
          <DialogContent className="max-w-md bg-[#1F1F1F] border-[#FFD700]/30">
            <DialogHeader>
              <DialogTitle className="text-white">
                {isCreatingCoupon ? 'Crear Nuevo Cupón' : 'Editar Cupón'}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                {isCreatingCoupon 
                  ? 'Configura tu nuevo cupón de descuento'
                  : 'Modifica la configuración del cupón'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="couponCode" className="text-white">Código del Cupón</Label>
                <Input
                  id="couponCode"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})}
                  placeholder="DESCUENTO10"
                  className="bg-[#0D0D0D] border-[#FFD700]/30 text-white placeholder:text-gray-500"
                />
              </div>

              <div>
                <Label className="text-white">Tipo de Descuento</Label>
                <Select 
                  value={couponForm.type} 
                  onValueChange={(value: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING') => 
                    setCouponForm({...couponForm, type: value})
                  }
                >
                  <SelectTrigger className="bg-[#0D0D0D] border-[#FFD700]/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1F1F1F] border-[#FFD700]/30">
                    <SelectItem value="PERCENTAGE" className="text-white hover:bg-[#FFD700]/20">Porcentaje</SelectItem>
                    <SelectItem value="FIXED_AMOUNT" className="text-white hover:bg-[#FFD700]/20">Cantidad Fija</SelectItem>
                    <SelectItem value="FREE_SHIPPING" className="text-white hover:bg-[#FFD700]/20">Envío Gratis</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {couponForm.type !== 'FREE_SHIPPING' && (
                <div>
                  <Label htmlFor="couponValue" className="text-white">
                    {couponForm.type === 'PERCENTAGE' ? 'Porcentaje de Descuento' : 'Monto de Descuento'}
                  </Label>
                  <Input
                    id="couponValue"
                    type="number"
                    step={couponForm.type === 'PERCENTAGE' ? "1" : "0.01"}
                    value={couponForm.value}
                    onChange={(e) => setCouponForm({...couponForm, value: Number(e.target.value)})}
                    placeholder={couponForm.type === 'PERCENTAGE' ? "10" : "5.00"}
                    className="bg-[#0D0D0D] border-[#FFD700]/30 text-white placeholder:text-gray-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minAmount" className="text-white">Compra Mínima (opcional)</Label>
                  <Input
                    id="minAmount"
                    type="number"
                    step="0.01"
                    value={couponForm.minAmount}
                    onChange={(e) => setCouponForm({...couponForm, minAmount: e.target.value})}
                    placeholder="50.00"
                    className="bg-[#0D0D0D] border-[#FFD700]/30 text-white placeholder:text-gray-500"
                  />
                </div>

                <div>
                  <Label htmlFor="usageLimit" className="text-white">Límite de Usos (opcional)</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    value={couponForm.usageLimit}
                    onChange={(e) => setCouponForm({...couponForm, usageLimit: e.target.value})}
                    placeholder="100"
                    className="bg-[#0D0D0D] border-[#FFD700]/30 text-white placeholder:text-gray-500"
                  />
                </div>
              </div>

              {couponForm.type === 'PERCENTAGE' && (
                <div>
                  <Label htmlFor="maxDiscount" className="text-white">Descuento Máximo (opcional)</Label>
                  <Input
                    id="maxDiscount"
                    type="number"
                    step="0.01"
                    value={couponForm.maxDiscount}
                    onChange={(e) => setCouponForm({...couponForm, maxDiscount: e.target.value})}
                    placeholder="20.00"
                    className="bg-[#0D0D0D] border-[#FFD700]/30 text-white placeholder:text-gray-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startsAt" className="text-white">Fecha de Inicio (opcional)</Label>
                  <Input
                    id="startsAt"
                    type="date"
                    value={couponForm.startsAt}
                    onChange={(e) => setCouponForm({...couponForm, startsAt: e.target.value})}
                    className="bg-[#0D0D0D] border-[#FFD700]/30 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="expiresAt" className="text-white">Fecha de Expiración (opcional)</Label>
                  <Input
                    id="expiresAt"
                    type="date"
                    value={couponForm.expiresAt}
                    onChange={(e) => setCouponForm({...couponForm, expiresAt: e.target.value})}
                    className="bg-[#0D0D0D] border-[#FFD700]/30 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={couponForm.isActive}
                  onChange={(e) => setCouponForm({...couponForm, isActive: e.target.checked})}
                  className="rounded border-[#FFD700]/30"
                />
                <Label htmlFor="isActive" className="text-white">Cupón activo</Label>
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowCouponModal(false)} 
                className="bg-[#0D0D0D] border-[#FFD700]/30 text-white hover:bg-[#1F1F1F]"
              >
                Cancelar
              </Button>
              <Button onClick={handleCouponSubmit} className="bg-[#FFD700] hover:bg-[#00C8FF] text-[#0D0D0D]">
                {isCreatingCoupon ? 'Crear Cupón' : 'Guardar Cambios'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de eliminación de cupón */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="bg-[#1F1F1F] border-[#FFD700]/30">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">¿Confirmar eliminación?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                ¿Estás seguro de que quieres eliminar el cupón "{couponToDelete?.code}"? 
                Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-[#0D0D0D] border-[#FFD700]/30 text-white hover:bg-[#1F1F1F]">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteCoupon}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Eliminar Cupón
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Modal de Nueva Campaña */}
        <Dialog open={showCampaignModal} onOpenChange={setShowCampaignModal}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-[#1F1F1F] border-[#FFD700]/30">
            <DialogHeader>
              <DialogTitle className="text-white">Crear Nueva Campaña de Newsletter</DialogTitle>
              <DialogDescription className="text-gray-400">
                Envía un email a todos tus suscriptores activos
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="campaignSubject" className="text-white">Asunto del Email</Label>
                <Input
                  id="campaignSubject"
                  value={campaignForm.subject}
                  onChange={(e) => setCampaignForm({...campaignForm, subject: e.target.value})}
                  placeholder="🎉 Ofertas Especiales de la Semana"
                  className="bg-[#0D0D0D] border-[#FFD700]/30 text-white placeholder:text-gray-500"
                />
              </div>

              <div>
                <Label htmlFor="campaignPreview" className="text-white">Texto de Preview (opcional)</Label>
                <Input
                  id="campaignPreview"
                  value={campaignForm.previewText}
                  onChange={(e) => setCampaignForm({...campaignForm, previewText: e.target.value})}
                  placeholder="Descubre las mejores ofertas..."
                  maxLength={200}
                  className="bg-[#0D0D0D] border-[#FFD700]/30 text-white placeholder:text-gray-500"
                />
              </div>

              <div>
                <Label htmlFor="campaignContent" className="text-white">Contenido del Email (HTML)</Label>
                <Textarea
                  id="campaignContent"
                  value={campaignForm.content}
                  onChange={(e) => setCampaignForm({...campaignForm, content: e.target.value})}
                  placeholder="<h2>Hola {nombre}</h2><p>Tenemos increíbles ofertas para ti...</p>"
                  rows={10}
                  className="font-mono text-sm bg-[#0D0D0D] border-[#FFD700]/30 text-white placeholder:text-gray-500"
                />
                <p className="text-sm text-gray-400 mt-1">
                  Puedes usar HTML. Variables disponibles: {'{nombre}'}, {'{email}'}
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-white">Destinatarios</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeUsers"
                    defaultChecked
                    className="rounded border-[#FFD700]/30"
                  />
                  <Label htmlFor="includeUsers" className="text-white">
                    Incluir usuarios registrados suscritos ({newsletterStats?.subscribedUsers || 0})
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeGuests"
                    defaultChecked
                    className="rounded border-[#FFD700]/30"
                  />
                  <Label htmlFor="includeGuests" className="text-white">
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
                  className="rounded border-[#FFD700]/30"
                />
                <Label htmlFor="sendNow" className="text-white">Enviar inmediatamente</Label>
              </div>

              {!campaignForm.sendNow && (
                <div>
                  <Label htmlFor="scheduledFor" className="text-white">Programar para</Label>
                  <Input
                    id="scheduledFor"
                    type="datetime-local"
                    value={campaignForm.scheduledFor}
                    onChange={(e) => setCampaignForm({...campaignForm, scheduledFor: e.target.value})}
                    className="bg-[#0D0D0D] border-[#FFD700]/30 text-white"
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={handlePreviewCampaign} 
                className="bg-[#0D0D0D] border-[#FFD700]/30 text-white hover:bg-[#1F1F1F]"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowCampaignModal(false)} 
                className="bg-[#0D0D0D] border-[#FFD700]/30 text-white hover:bg-[#1F1F1F]"
              >
                Cancelar
              </Button>
              <Button onClick={handleSendCampaign} className="bg-green-600 hover:bg-green-700 text-white">
                <Send className="h-4 w-4 mr-2" />
                {campaignForm.sendNow ? 'Enviar Ahora' : 'Guardar Campaña'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Preview */}
        <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-[#1F1F1F] border-[#FFD700]/30">
            <DialogHeader>
              <DialogTitle className="text-white">Preview del Email</DialogTitle>
            </DialogHeader>
            <div 
              className="border border-[#FFD700]/20 rounded-lg p-4 bg-[#0D0D0D]"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
            <DialogFooter>
              <Button 
                onClick={() => setShowPreviewModal(false)} 
                className="bg-[#FFD700] hover:bg-[#00C8FF] text-[#0D0D0D]"
              >
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}