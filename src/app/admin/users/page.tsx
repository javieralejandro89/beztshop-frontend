// src/app/admin/users/page.tsx - Gestión de usuarios CORREGIDO
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
import { adminApi } from '@/lib/api'; // CORRECCIÓN: Usar adminApi

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
  }, 500); // 500ms de delay

  return () => clearTimeout(timer);
}, [searchInput]);

  useEffect(() => {
    loadUsers();
  }, [currentPage, filters]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      
      // CORRECCIÓN: Usar adminApi en lugar de fetch directo
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
  setSearchInput(''); // Limpiar también el input
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
  // Limpiar errores previos
  setFormErrors({});
  
  // Validar localmente primero
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

    // Solo cerrar modal si es exitoso
    setShowUserModal(false);
    loadUsers();
    
  } catch (err: any) {
    console.error('Error submitting user:', err);
    
    // Manejar errores específicos del backend
    if (err.response?.status === 400 && err.response?.data?.details) {
      // Errores de validación de Zod
      const backendErrors: Record<string, string> = {};
      err.response.data.details.forEach((issue: any) => {
        if (issue.path && issue.path[0]) {
          backendErrors[issue.path[0]] = issue.message;
        }
      });
      setFormErrors(backendErrors);
      error('Por favor corrige los errores marcados');
    } else if (err.response?.data?.error) {
      // Error específico del backend
      error(err.response.data.error);
    } else {
      // Error genérico
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
      ADMIN: { label: 'Admin', className: 'bg-red-100 text-red-800' },
      CLIENT: { label: 'Cliente', className: 'bg-blue-100 text-blue-800' }
    };
    
    const { label, className } = config[role as keyof typeof config] || config.CLIENT;
    return <Badge className={className}>{label}</Badge>;
  };

  const getLevelBadge = (level: string) => {
    const config = {
      REGULAR: { label: 'Regular', className: 'bg-gray-100 text-gray-800' },
      VIP: { label: 'VIP', className: 'bg-yellow-100 text-yellow-800' },
      WHOLESALE: { label: 'Mayorista', className: 'bg-purple-100 text-purple-800' }
    };
    
    const { label, className } = config[level as keyof typeof config] || config.REGULAR;
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

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
              <Users className="h-8 w-8 text-primary-600" />
              Gestión de Usuarios
            </h1>
            <p className="text-gray-600 mt-2">
              {pagination.total} usuario{pagination.total !== 1 ? 's' : ''} registrado{pagination.total !== 1 ? 's' : ''}
            </p>
          </div>
          <Button onClick={openCreateModal} className="bg-primary-600 hover:bg-primary-700">
            <UserPlus className="h-4 w-4 mr-2" />
            Nuevo Usuario
          </Button>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Filtros de Búsqueda</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
                </Button>
                <Button
  variant="outline"
  size="sm"
  onClick={clearFilters}
  type="button"
>
  <RefreshCw className="h-4 w-4 mr-2" />
  Limpiar
</Button>
<Button 
  variant="outline" 
  size="sm" 
  onClick={loadUsers}
  type="button"
>
  <RefreshCw className="h-4 w-4 mr-2" />
  Actualizar
</Button>
              </div>
            </div>
          </CardHeader>
          
          {showFilters && (
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {/* Búsqueda */}
                <div>
                  <Label htmlFor="search">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
  id="search"
  placeholder="Email, nombre..."
  value={searchInput}
  onChange={(e) => setSearchInput(e.target.value)}
  className="pl-10"
/>
{searchInput !== filters.search && searchInput.length > 0 && (
    <div className="absolute right-3 top-3">
      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
    </div>
  )}
                  </div>
                </div>

                {/* Rol */}
                <div>
                  <Label>Rol</Label>
                  <Select 
                    value={filters.role || 'ALL'}  
                    onValueChange={(value) => handleFilterChange('role', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todos los roles</SelectItem>
                      <SelectItem value="CLIENT">Cliente</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Nivel */}
                <div>
                  <Label>Nivel</Label>
                  <Select 
                    value={filters.userLevel || 'ALL'}  
                    onValueChange={(value) => handleFilterChange('userLevel', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los niveles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todos los niveles</SelectItem>
                      <SelectItem value="REGULAR">Regular</SelectItem>
                      <SelectItem value="VIP">VIP</SelectItem>
                      <SelectItem value="WHOLESALE">Mayorista</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Estado */}
                <div>
                  <Label>Estado</Label>
                  <Select 
                    value={filters.isActive || 'all'} 
                    onValueChange={(value) => handleFilterChange('isActive', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="true">Activos</SelectItem>
                      <SelectItem value="false">Inactivos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Ordenar */}
                <div>
                  <Label>Ordenar por</Label>
                  <div className="flex gap-2">
                    <Select 
                      value={filters.sortBy} 
                      onValueChange={(value) => handleFilterChange('sortBy', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="createdAt">Fecha de registro</SelectItem>
                        <SelectItem value="lastLogin">Último acceso</SelectItem>
                        <SelectItem value="firstName">Nombre</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select 
                      value={filters.sortOrder} 
                      onValueChange={(value) => handleFilterChange('sortOrder', value)}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">↓</SelectItem>
                        <SelectItem value="asc">↑</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Tabla de usuarios */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <div className="text-lg">Cargando usuarios...</div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  No se encontraron usuarios
                </h2>
                <p className="text-gray-600">
                  Ajusta los filtros o crea el primer usuario
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nivel</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Último acceso</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pedidos</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registro</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className="text-sm text-gray-500 flex items-center gap-1">
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
                            className={user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
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
                            <span className="text-sm text-gray-900">
                              {formatDate(user.lastLogin)}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500">Nunca</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium text-gray-900">
                            {user._count?.orders || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 flex items-center gap-1">
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
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleUserStatus(user)}
                              className={user.isActive ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
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
                              className="text-red-600 hover:text-red-700"
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
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
            
            <span className="text-sm text-gray-600">
              Página {currentPage} de {pagination.pages}
            </span>
            
            <Button
              variant="outline"
              disabled={!pagination.hasNext}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Modal de crear/editar usuario */}
        <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {isCreating ? 'Crear Nuevo Usuario' : 'Editar Usuario'}
              </DialogTitle>
              <DialogDescription>
                {isCreating 
                  ? 'Completa la información para crear un nuevo usuario'
                  : 'Modifica la información del usuario'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
  <Label htmlFor="firstName">Nombre</Label>
  <Input
    id="firstName"
    value={userForm.firstName}
    onChange={(e) => {
      setUserForm({...userForm, firstName: e.target.value});
      if (formErrors.firstName) {
        setFormErrors({...formErrors, firstName: ''});
      }
    }}
    className={formErrors.firstName ? 'border-red-500' : ''}
  />
  {formErrors.firstName && (
    <p className="text-sm text-red-500 mt-1">{formErrors.firstName}</p>
  )}
</div>
                <div>
  <Label htmlFor="lastName">Apellido</Label>
  <Input
    id="lastName"
    value={userForm.lastName}
    onChange={(e) => {
      setUserForm({...userForm, lastName: e.target.value});
      if (formErrors.lastName) {
        setFormErrors({...formErrors, lastName: ''});
      }
    }}
    className={formErrors.lastName ? 'border-red-500' : ''}
  />
  {formErrors.lastName && (
    <p className="text-sm text-red-500 mt-1">{formErrors.lastName}</p>
  )}
</div>
              </div>

              <div>
  <Label htmlFor="email">Email</Label>
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
    className={formErrors.email ? 'border-red-500' : ''}
  />
  {formErrors.email && (
    <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>
  )}
</div>

              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={userForm.phone}
                  onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                />
              </div>

              {isCreating && (
  <div>
    <Label htmlFor="password">Contraseña</Label>
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
      className={formErrors.password ? 'border-red-500' : ''}
    />
    {formErrors.password && (
      <p className="text-sm text-red-500 mt-1">{formErrors.password}</p>
    )}
  </div>
)}

              {!isCreating && (
                <div>
                  <Label htmlFor="password">Nueva Contraseña (opcional)</Label>
                  <Input
                    id="password"
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                    placeholder="Dejar en blanco para mantener actual"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Rol</Label>
                  <Select 
                    value={userForm.role} 
                    onValueChange={(value: 'ADMIN' | 'CLIENT') => setUserForm({...userForm, role: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CLIENT">Cliente</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Nivel</Label>
                  <Select 
                    value={userForm.userLevel} 
                    onValueChange={(value: 'REGULAR' | 'VIP' | 'WHOLESALE') => setUserForm({...userForm, userLevel: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="REGULAR">Regular</SelectItem>
                      <SelectItem value="VIP">VIP</SelectItem>
                      <SelectItem value="WHOLESALE">Mayorista</SelectItem>
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
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isActive">Usuario activo</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUserModal(false)}>
                Cancelar
              </Button>
              <Button 
  onClick={handleSubmitUser}
  disabled={isSubmitting}
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
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estás seguro de que quieres eliminar al usuario "{userToDelete?.firstName} {userToDelete?.lastName}"? 
                Esta acción no se puede deshacer y se perderán todos los datos asociados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteUser}
                className="bg-red-600 hover:bg-red-700"
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