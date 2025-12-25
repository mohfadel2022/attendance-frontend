'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'es' | 'ar'

interface I18nContextType {
  lang: Language
  setLang: (lang: Language) => void
  t: (key: string) => string
  isRTL: boolean
}

const translations = {
  es: {
    dashboard: 'Panel de Control',
    employees: 'Empleados',
    attendance: 'Asistencia',
    reports: 'Reportes',
    office_qr: 'QR de Oficina',
    settings: 'Ajustes',
    logout: 'Cerrar Sesión',
    welcome: 'Bienvenido de nuevo, Administrador',
    add_employee: '+ Agregar Empleado',
    search_employees: 'Buscar empleados...',
    filter_logs: 'Filtrar registros...',
    search_reports: 'Buscar reportes...',
    export: 'Exportar',
    theme: 'Tema',
    language: 'Idioma',
    light: 'Claro',
    dark: 'Oscuro',
    spanish: 'Español',
    arabic: 'Árabe',
    qr_description: 'Descarga este código QR para imprimirlo y colocarlo en la entrada de la oficina.',
    export_pdf: 'Exportar a PDF (A4)',
    cancel: 'Cancelar',
    name: 'Nombre',
    email: 'Correo electrónico',
    role: 'Rol',
    password: 'Contraseña',
    edit_employee: 'Editar Empleado',
    new_employee: 'Nuevo Empleado',
    confirm_delete: '¿Estás seguro?',
    delete_success: 'Eliminado exitosamente',
    total_employees: 'Total de Empleados',
    today_checkins: 'Registros de hoy',
    total_activity: 'Actividad Total',
    user: 'Usuario',
    date_time: 'Fecha/Hora',
    actions: 'Acciones',
    status: 'Estado',
    office_checkin_title: 'Registro de Entrada/Salida en Oficina',
    scan_to_check: 'Escanea para registrar entrada / salida',
    admin_profile: 'Perfil de Administrador',
    administrator: 'Administrador',
    change_password: 'Cambiar Contraseña',
    confirm_action: 'Confirmar Acción',
    cancel_action: 'Cancelar Acción',
    delete_action: 'Eliminar Acción',
    view_logs: 'Ver Registros',
    checkin: 'Entrada',
    checkout: 'Salida',
    total: 'Total',
    employee_role: 'Empleado',
    admin_role: 'Administrador',
    save: 'Guardar',
    create: 'Crear',
  },
  ar: {
    dashboard: 'لوحة التحكم',
    employees: 'الموظفين',
    attendance: 'الحضور',
    reports: 'التقارير',
    office_qr: 'رمز المكتب',
    settings: 'الإعدادات',
    logout: 'تسجيل الخروج',
    welcome: 'مرحباً بك، المدير',
    add_employee: '+ إضافة موظف',
    search_employees: 'بحث عن موظفين...',
    filter_logs: 'تصفية السجلات...',
    search_reports: 'بحث في التقارير...',
    export: 'تصدير',
    theme: 'المظهر',
    language: 'اللغة',
    light: 'فاتح',
    dark: 'داكن',
    spanish: 'الإسبانية',
    arabic: 'العربية',
    qr_description: 'قم بتنزيل رمز QR هذا لطباعته ووضعه عند مدخل المكتب.',
    export_pdf: 'تصدير إلى PDF (A4)',
    cancel: 'إلغاء',
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    role: 'الدور',
    password: 'كلمة المرور',
    edit_employee: 'تعديل موظف',
    new_employee: 'موظف جديد',
    confirm_delete: 'هل أنت متأكد؟',
    delete_success: 'تم الحذف بنجاح',
    total_employees: 'إجمالي الموظفين',
    today_checkins: 'عمليات الحضور اليوم',
    total_activity: 'إجمالي النشاط',
    user: 'المستخدم',
    date_time: 'التاريخ/الوقت',
    actions: 'الإجراءات',
    status: 'الحالة',
    office_checkin_title: 'تسجيل الحضور/الانصراف بالمكتب',
    scan_to_check: 'امسح الرمز لتسجيل الحضور / الانصراف',
    admin_profile: 'ملف المدير',
    administrator: 'المدير العام',
    change_password: 'تغيير كلمة المرور',
    confirm_action: 'تأكيد الإجراء',
    cancel_action: 'إلغاء',
    delete_action: 'حذف',
    view_logs: 'عرض السجلات',
    checkin: 'تسجيل دخول',
    checkout: 'تسجيل خروج',
    total: 'الإجمالي',
    employee_role: 'موظف',
    admin_role: 'مدير',
    save: 'حفظ',
    create: 'إنشاء',
  }
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useState<Language>('es')

  useEffect(() => {
    const savedLang = localStorage.getItem('lang') as Language
    if (savedLang && (savedLang === 'es' || savedLang === 'ar')) {
      setLang(savedLang)
    }
  }, [])

  const handleSetLang = (newLang: Language) => {
    setLang(newLang)
    localStorage.setItem('lang', newLang)
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = newLang
  }

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }, [lang])

  const t = (key: string) => {
    return translations[lang][key as keyof typeof translations['es']] || key
  }

  return (
    <I18nContext.Provider value={{ lang, setLang: handleSetLang, t, isRTL: lang === 'ar' }}>
      {children}
    </I18nContext.Provider>
  )
}

export const useI18n = () => {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useI18n must be used within I18nProvider')
  return context
}
