// src/app/admin/users/page.tsx - Gestión de usuarios Dark Tech
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Users,
  Search,
  Filter,
  UserPlus,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  Mail,
  Phone,
  Calendar,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import { adminApi } from '@/lib/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'ADMIN' | 'CLIENT';
  userLevel: 'REGULAR' | 'VIP' | 'WHOLESALE';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    orders: number;
  };
}

interface UserFilters {
  search: string;
  role: string;
  userLevel: string;
  isActive: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { success, error, promise } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false
  });

  // Filtros
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: '',
    userLevel: '',
    isActive: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Formulario de usuario
  const [userForm, setUserForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'CLIENT' as 'ADMIN' | 'CLIENT',
    userLevel: 'REGULAR' as 'REGULAR' | 'VIP' | 'WHOLESALE',
    isActive: true,
    password: ''
  });

  // Debounce para búsqueda
useEffect(() => {
  const timer = setTimeout(() => {
    setFilters(prev => ({ ...prev, search: searchInput }));
    setCurrentPage(1);
  }, 500);

  return () => clearTimeout(timer);
}, [searchInput]);

  useEffect(() => {
    loadUsers();
  }, [currentPage, filters]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      
      const data = await adminApi.getUsers({
        page: currentPage,
        limit: 10,
        ...filters
      });

      setUsers(data.users);
      setPagination(data.pagination);

    } catch (err: any) {
      console.error('Error loading users:', err);
      error('Error al cargar los usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  const validateUserForm = () => {
  const errors: Record<string, string> = {};
  
  if (!userForm.firstName.trim()) {
    errors.firstName = 'Nombre es requerido';
  }
  
  if (!userForm.lastName.trim()) {
    errors.lastName = 'Apellido es requerido';
  }
  
  if (!userForm.email.trim()) {
    errors.email = 'Email es requerido';
  } else if (!/\S+@\S+\.\S+/.test(userForm.email)) {
    errors.email = 'Email inválido';
  }
  
  if (isCreating && !userForm.password.trim()) {
    errors.password = 'Contraseña es requerida';
  } else if (userForm.password && userForm.password.length < 8) {
    errors.password = 'Contraseña debe tener al menos 8 caracteres';
  }
  
  setFormErrors(errors);
  return Object.keys(errors).length === 0;
};

  const handleFilterChange = (key: keyof UserFilters, value: string) => {
  const actualValue = value === 'all' ? '' : value;
  setFilters(prev => ({ ...prev, [key]: actualValue }));
  setCurrentPage(1);
};

  const clearFilters = () => {
  setSearchInput('');
  setFilters({
    search: '',
    role: '',
    userLevel: '',
    isActive: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  setCurrentPage(1);
};

  const openCreateModal = () => {
    setUserForm({
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: 'CLIENT' as 'ADMIN' | 'CLIENT',
      userLevel: 'REGULAR' as 'REGULAR' | 'VIP' | 'WHOLESALE',
      isActive: true,
      password: ''
    });
    setSelectedUser(null);
    setIsCreating(true);
    setShowUserModal(true);
    setFormErrors({});
  };

  const openEditModal = (user: User) => {
    setUserForm({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || '',
      role: user.role,
      userLevel: user.userLevel,
      isActive: user.isActive,
      password: ''
    });
    setSelectedUser(user);
    setIsCreating(false);
    setShowUserModal(true);
    setFormErrors({});
  };

  const handleSubmitUser = async () => {
  setFormErrors({});
  
  if (!validateUserForm()) {
    error('Por favor corrige los errores marcados');
    return;
  }

  setIsSubmitting(true);

  try {
    const userData = isCreating 
      ? userForm 
      : { ...userForm, password: userForm.password || undefined };

    if (isCreating) {
      await adminApi.createUser(userData);
      success('Usuario creado exitosamente');
    } else {
      await adminApi.updateUser(selectedUser!.id, userData);
      success('Usuario actualizado exitosamente');
    }

    setShowUserModal(false);
    loadUsers();
    
  } catch (err: any) {
    console.error('Error submitting user:', err);
    
    if (err.response?.status === 400 && err.response?.data?.details) {
      const backendErrors: Record<string, string> = {};
      err.response.data.details.forEach((issue: any) => {
        if (issue.path && issue.path[0]) {
          backendErrors[issue.path[0]] = issue.message;
        }
      });
      setFormErrors(backendErrors);
      error('Por favor corrige los errores marcados');
    } else if (err.response?.data?.error) {
      error(err.response.data.error);
    } else {
      error('Error al procesar la solicitud');
    }
  } finally {
    setIsSubmitting(false);
  }
};

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await promise(
        adminApi.deleteUser(userToDelete.id),
        {
          loading: 'Eliminando usuario...',
          success: 'Usuario eliminado exitosamente',
          error: 'Error al eliminar usuario'
        }
      );

      setShowDeleteDialog(false);
      setUserToDelete(null);
      loadUsers();
      
    } catch (err: any) {
      console.error('Error deleting user:', err);
    }
  };

  const toggleUserStatus = async (user: User) => {
    try {
      await promise(
        adminApi.toggleUserStatus(user.id),
        {
          loading: 'Cambiando estado...',
          success: `Usuario ${user.isActive ? 'desactivado' : 'activado'} exitosamente`,
          error: 'Error al cambiar estado del usuario'
        }
      );

      loadUsers();
      
    } catch (err: any) {
      console.error('Error toggling user status:', err);
    }
  };

  const getRoleBadge = (role: string) => {
    const config = {
      ADMIN: { label: 'Admin', className: 'bg-red-500/10 text-red-400 border-red-500/30' },
      CLIENT: { label: 'Cliente', className: 'bg-cyan/10 text-cyan border-cyan/30' }
    };
    
    const { label, className } = config[role as keyof typeof config] || config.CLIENT;
    return <Badge className={className}>{label}</Badge>;
  };

  const getLevelBadge = (level: string) => {
    const config = {
      REGULAR: { label: 'Regular', className: 'bg-gray-600/10 text-gray-400 border-gray-600/30' },
      VIP: { label: 'VIP', className: 'bg-gold/10 text-gold border-gold/30' },
      WHOLESALE: { label: 'Mayorista', className: 'bg-cyan/10 text-cyan border-cyan/30' }
    };
    
    const { label, className } = config[level as keyof typeof config] || config.REGULAR;
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-darkbg p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/admin/dashboard')}
            className="p-2 text-white hover:text-gold hover:bg-darkbg-light"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Users className="h-8 w-8 text-gold" />
              Gestión de Usuarios
            </h1>
            <p className="text-gray-400 mt-2">
              {pagination.total} usuario{pagination.total !== 1 ? 's' : ''} registrado{pagination.total !== 1 ? 's' : ''}
            </p>
          </div>
          <Button onClick={openCreateModal} className="bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg font-semibold">
            <UserPlus className="h-4 w-4 mr-2" />
            Nuevo Usuario
          </Button>
        </div>

        {/* Filtros */}
        <Card className="bg-darkbg-light border-gold/20">
          <CardHeader className="border-b border-gold/10">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg text-white">Filtros de Búsqueda</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-darkbg border-gold/30 text-white hover:bg-gold hover:text-darkbg hover:border-gold"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
                </Button>
                <Button
  variant="outline"
  size="sm"
  onClick={clearFilters}
  type="button"
  className="bg-darkbg border-cyan/30 text-white hover:bg-cyan hover:text-darkbg hover:border-cyan"
>
  <RefreshCw className="h-4 w-4 mr-2" />
  Limpiar
</Button>
<Button 
  variant="outline" 
  size="sm" 
  onClick={loadUsers}
  type="button"
  className="bg-darkbg border-gold/30 text-white hover:bg-gold hover:text-darkbg hover:border-gold"
>
  <RefreshCw className="h-4 w-4 mr-2" />
  Actualizar
</Button>
              </div>
            </div>
          </CardHeader>
          
          {showFilters && (
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {/* Búsqueda */}
                <div>
                  <Label htmlFor="search" className="text-gray-300">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
  id="search"
  placeholder="Email, nombre..."
  value={searchInput}
  onChange={(e) => setSearchInput(e.target.value)}
  className="pl-10 bg-darkbg border-gold/20 text-white placeholder-gray-500 focus:border-gold focus:ring-gold/50"
/>
{searchInput !== filters.search && searchInput.length > 0 && (
    <div className="absolute right-3 top-3">
      <Loader2 className="h-4 w-4 animate-spin text-gold" />
    </div>
  )}
                  </div>
                </div>

                {/* Rol */}
                <div>
                  <Label className="text-gray-300">Rol</Label>
                  <Select 
                    value={filters.role || 'ALL'}  
                    onValueChange={(value) => handleFilterChange('role', value)}
                  >
                    <SelectTrigger className="bg-darkbg border-gold/20 text-white focus:border-gold focus:ring-gold/50">
                      <SelectValue placeholder="Todos los roles" />
                    </SelectTrigger>
                    <SelectContent className="bg-darkbg-light border-gold/20">
                      <SelectItem value="ALL" className="text-white hover:bg-darkbg hover:text-gold">Todos los roles</SelectItem>
                      <SelectItem value="CLIENT" className="text-white hover:bg-darkbg hover:text-gold">Cliente</SelectItem>
                      <SelectItem value="ADMIN" className="text-white hover:bg-darkbg hover:text-gold">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Nivel */}
                <div>
                  <Label className="text-gray-300">Nivel</Label>
                  <Select 
                    value={filters.userLevel || 'ALL'}  
                    onValueChange={(value) => handleFilterChange('userLevel', value)}
                  >
                    <SelectTrigger className="bg-darkbg border-gold/20 text-white focus:border-gold focus:ring-gold/50">
                      <SelectValue placeholder="Todos los niveles" />
                    </SelectTrigger>
                    <SelectContent className="bg-darkbg-light border-gold/20">
                      <SelectItem value="ALL" className="text-white hover:bg-darkbg hover:text-gold">Todos los niveles</SelectItem>
                      <SelectItem value="REGULAR" className="text-white hover:bg-darkbg hover:text-gold">Regular</SelectItem>
                      <SelectItem value="VIP" className="text-white hover:bg-darkbg hover:text-gold">VIP</SelectItem>
                      <SelectItem value="WHOLESALE" className="text-white hover:bg-darkbg hover:text-gold">Mayorista</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Estado */}
                <div>
                  <Label className="text-gray-300">Estado</Label>
                  <Select 
                    value={filters.isActive || 'all'} 
                    onValueChange={(value) => handleFilterChange('isActive', value)}
                  >
                    <SelectTrigger className="bg-darkbg border-gold/20 text-white focus:border-gold focus:ring-gold/50">
                      <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent className="bg-darkbg-light border-gold/20">
                      <SelectItem value="all" className="text-white hover:bg-darkbg hover:text-gold">Todos</SelectItem>
                      <SelectItem value="true" className="text-white hover:bg-darkbg hover:text-gold">Activos</SelectItem>
                      <SelectItem value="false" className="text-white hover:bg-darkbg hover:text-gold">Inactivos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Ordenar */}
                <div>
                  <Label className="text-gray-300">Ordenar por</Label>
                  <div className="flex gap-2">
                    <Select 
                      value={filters.sortBy} 
                      onValueChange={(value) => handleFilterChange('sortBy', value)}
                    >
                      <SelectTrigger className="bg-darkbg border-gold/20 text-white focus:border-gold focus:ring-gold/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-darkbg-light border-gold/20">
                        <SelectItem value="createdAt" className="text-white hover:bg-darkbg hover:text-gold">Fecha de registro</SelectItem>
                        <SelectItem value="lastLogin" className="text-white hover:bg-darkbg hover:text-gold">Último acceso</SelectItem>
                        <SelectItem value="firstName" className="text-white hover:bg-darkbg hover:text-gold">Nombre</SelectItem>
                        <SelectItem value="email" className="text-white hover:bg-darkbg hover:text-gold">Email</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select 
                      value={filters.sortOrder} 
                      onValueChange={(value) => handleFilterChange('sortOrder', value)}
                    >
                      <SelectTrigger className="w-20 bg-darkbg border-gold/20 text-white focus:border-gold focus:ring-gold/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-darkbg-light border-gold/20">
                        <SelectItem value="desc" className="text-white hover:bg-darkbg hover:text-gold">↓</SelectItem>
                        <SelectItem value="asc" className="text-white hover:bg-darkbg hover:text-gold">↑</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Tabla de usuarios */}
        <Card className="bg-darkbg-light border-gold/20">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gold" />
                <div className="text-lg text-white">Cargando usuarios...</div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-600 mx-auto mb-6" />
                <h2 className="text-xl font-semibold text-white mb-4">
                  No se encontraron usuarios
                </h2>
                <p className="text-gray-400">
                  Ajusta los filtros o crea el primer usuario
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-darkbg border-b border-gold/10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Usuario</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rol</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Nivel</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Último acceso</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Pedidos</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Registro</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-darkbg-light divide-y divide-gold/10">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-darkbg transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-medium text-white">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-400 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className="text-sm text-gray-400 flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {user.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{getRoleBadge(user.role)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{getLevelBadge(user.userLevel)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge 
                            variant={user.isActive ? "default" : "secondary"}
                            className={user.isActive ? "bg-gold/10 text-gold border-gold/30" : "bg-red-500/10 text-red-400 border-red-500/30"}
                          >
                            {user.isActive ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Activo
                              </>
                            ) : (
                              <>
                                <Ban className="h-3 w-3 mr-1" />
                                Inactivo
                              </>
                            )}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.lastLogin ? (
                            <span className="text-sm text-white">
                              {formatDate(user.lastLogin)}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500">Nunca</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium text-white">
                            {user._count?.orders || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-400 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(user.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModal(user)}
                              className="text-cyan hover:text-gold hover:bg-darkbg"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleUserStatus(user)}
                              className={user.isActive ? "text-red-400 hover:text-red-300 hover:bg-darkbg" : "text-gold hover:text-cyan hover:bg-darkbg"}
                            >
                              {user.isActive ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setUserToDelete(user);
                                setShowDeleteDialog(true);
                              }}
                              className="text-red-400 hover:text-red-300 hover:bg-darkbg"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Paginación */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center gap-4">
            <Button
              variant="outline"
              disabled={!pagination.hasPrev}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="bg-darkbg border-gold/30 text-white hover:bg-gold hover:text-darkbg hover:border-gold disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
            
            <span className="text-sm text-gray-400">
              Página {currentPage} de {pagination.pages}
            </span>
            
            <Button
              variant="outline"
              disabled={!pagination.hasNext}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="bg-darkbg border-gold/30 text-white hover:bg-gold hover:text-darkbg hover:border-gold disabled:opacity-50"
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Modal de crear/editar usuario */}
        <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
          <DialogContent className="max-w-md bg-darkbg-light border-gold/20">
            <DialogHeader className="border-b border-gold/10 pb-4">
              <DialogTitle className="text-white">
                {isCreating ? 'Crear Nuevo Usuario' : 'Editar Usuario'}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                {isCreating 
                  ? 'Completa la información para crear un nuevo usuario'
                  : 'Modifica la información del usuario'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
  <Label htmlFor="firstName" className="text-gray-300">Nombre</Label>
  <Input
    id="firstName"
    value={userForm.firstName}
    onChange={(e) => {
      setUserForm({...userForm, firstName: e.target.value});
      if (formErrors.firstName) {
        setFormErrors({...formErrors, firstName: ''});
      }
    }}
    className={`bg-darkbg border-gold/20 text-white placeholder-gray-500 focus:border-gold focus:ring-gold/50 ${formErrors.firstName ? 'border-red-500' : ''}`}
  />
  {formErrors.firstName && (
    <p className="text-sm text-red-400 mt-1">{formErrors.firstName}</p>
  )}
</div>
                <div>
  <Label htmlFor="lastName" className="text-gray-300">Apellido</Label>
  <Input
    id="lastName"
    value={userForm.lastName}
    onChange={(e) => {
      setUserForm({...userForm, lastName: e.target.value});
      if (formErrors.lastName) {
        setFormErrors({...formErrors, lastName: ''});
      }
    }}
    className={`bg-darkbg border-gold/20 text-white placeholder-gray-500 focus:border-gold focus:ring-gold/50 ${formErrors.lastName ? 'border-red-500' : ''}`}
  />
  {formErrors.lastName && (
    <p className="text-sm text-red-400 mt-1">{formErrors.lastName}</p>
  )}
</div>
              </div>

              <div>
  <Label htmlFor="email" className="text-gray-300">Email</Label>
  <Input
    id="email"
    type="email"
    value={userForm.email}
    onChange={(e) => {
      setUserForm({...userForm, email: e.target.value});
      if (formErrors.email) {
        setFormErrors({...formErrors, email: ''});
      }
    }}
    className={`bg-darkbg border-gold/20 text-white placeholder-gray-500 focus:border-gold focus:ring-gold/50 ${formErrors.email ? 'border-red-500' : ''}`}
  />
  {formErrors.email && (
    <p className="text-sm text-red-400 mt-1">{formErrors.email}</p>
  )}
</div>

              <div>
                <Label htmlFor="phone" className="text-gray-300">Teléfono</Label>
                <Input
                  id="phone"
                  value={userForm.phone}
                  onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                  className="bg-darkbg border-gold/20 text-white placeholder-gray-500 focus:border-gold focus:ring-gold/50"
                />
              </div>

              {isCreating && (
  <div>
    <Label htmlFor="password" className="text-gray-300">Contraseña</Label>
    <Input
      id="password"
      type="password"
      value={userForm.password}
      onChange={(e) => {
        setUserForm({...userForm, password: e.target.value});
        if (formErrors.password) {
          setFormErrors({...formErrors, password: ''});
        }
      }}
      className={`bg-darkbg border-gold/20 text-white placeholder-gray-500 focus:border-gold focus:ring-gold/50 ${formErrors.password ? 'border-red-500' : ''}`}
    />
    {formErrors.password && (
      <p className="text-sm text-red-400 mt-1">{formErrors.password}</p>
    )}
  </div>
)}

              {!isCreating && (
                <div>
                  <Label htmlFor="password" className="text-gray-300">Nueva Contraseña (opcional)</Label>
                  <Input
                    id="password"
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                    placeholder="Dejar en blanco para mantener actual"
                    className="bg-darkbg border-gold/20 text-white placeholder-gray-500 focus:border-gold focus:ring-gold/50"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Rol</Label>
                  <Select 
                    value={userForm.role} 
                    onValueChange={(value: 'ADMIN' | 'CLIENT') => setUserForm({...userForm, role: value})}
                  >
                    <SelectTrigger className="bg-darkbg border-gold/20 text-white focus:border-gold focus:ring-gold/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-darkbg-light border-gold/20">
                      <SelectItem value="CLIENT" className="text-white hover:bg-darkbg hover:text-gold">Cliente</SelectItem>
                      <SelectItem value="ADMIN" className="text-white hover:bg-darkbg hover:text-gold">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-gray-300">Nivel</Label>
                  <Select 
                    value={userForm.userLevel} 
                    onValueChange={(value: 'REGULAR' | 'VIP' | 'WHOLESALE') => setUserForm({...userForm, userLevel: value})}
                  >
                    <SelectTrigger className="bg-darkbg border-gold/20 text-white focus:border-gold focus:ring-gold/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-darkbg-light border-gold/20">
                      <SelectItem value="REGULAR" className="text-white hover:bg-darkbg hover:text-gold">Regular</SelectItem>
                      <SelectItem value="VIP" className="text-white hover:bg-darkbg hover:text-gold">VIP</SelectItem>
                      <SelectItem value="WHOLESALE" className="text-white hover:bg-darkbg hover:text-gold">Mayorista</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={userForm.isActive}
                  onChange={(e) => setUserForm({...userForm, isActive: e.target.checked})}
                  className="rounded border-gray-600 bg-darkbg"
                />
                <Label htmlFor="isActive" className="text-gray-300">Usuario activo</Label>
              </div>
            </div>

            <DialogFooter className="border-t border-gold/10 pt-4">
              <Button variant="outline" onClick={() => setShowUserModal(false)} className="bg-darkbg border-gray-600 text-white hover:bg-darkbg-light">
                Cancelar
              </Button>
              <Button 
  onClick={handleSubmitUser}
  disabled={isSubmitting}
  className="bg-gradient-to-r from-gold to-cyan hover:from-cyan hover:to-gold text-darkbg font-semibold"
>
  {isSubmitting ? (
    <>
      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      {isCreating ? 'Creando...' : 'Guardando...'}
    </>
  ) : (
    isCreating ? 'Crear Usuario' : 'Guardar Cambios'
  )}
</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de confirmación de eliminación */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="bg-darkbg-light border-gold/20">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">¿Confirmar eliminación?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                ¿Estás seguro de que quieres eliminar al usuario "{userToDelete?.firstName} {userToDelete?.lastName}"? 
                Esta acción no se puede deshacer y se perderán todos los datos asociados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-darkbg border-gray-600 text-white hover:bg-darkbg-light">Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteUser}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
              >
                Eliminar Usuario
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}