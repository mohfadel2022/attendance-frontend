'use client'
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from "sonner"
import { Loader2, Database, Link as LinkIcon, RefreshCw, Server, ShieldCheck, Save, FolderOpen, FileCode, AlertTriangle } from 'lucide-react'
import { useI18n } from '@/app/i18n'
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'

export default function DatabaseSettingsPage() {
    const { t } = useI18n()
    const router = useRouter()

    const [config, setConfig] = useState({
        dbMode: 'local',
        localDbUrl: '',
        remoteDbUrl: '',
        lastSyncAt: null,
        syncActive: false
    })
    const [originalConfig, setOriginalConfig] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [syncing, setSyncing] = useState(false)
    const [pulling, setPulling] = useState(false)
    const [checkStatus, setCheckStatus] = useState<'idle' | 'checking' | 'connected' | 'error'>('idle')
    const [localCheckStatus, setLocalCheckStatus] = useState<'idle' | 'checking' | 'connected' | 'error'>('idle')
    const [mounted, setMounted] = useState(false)
    const [fileItems, setFileItems] = useState<{ name: string, type: string, path: string, url: string }[]>([])
    const [currentPath, setCurrentPath] = useState<string>('')
    const [exploring, setExploring] = useState(false)

    const isModified = !!(originalConfig && JSON.stringify(config) !== JSON.stringify(originalConfig))

    useEffect(() => {
        setMounted(true)
        verifyRole()
    }, [])

    const verifyRole = async () => {
        try {
            const res = await apiFetch(`/auth/me`)
            if (res.ok) {
                const user = await res.json()
                if (user.role !== 'SUPERADMIN') {
                    toast.error('Acceso denegado: Se requiere rol de Superadmin')
                    router.push('/admin')
                } else {
                    fetchConfig()
                }
            } else {
                router.push('/login')
            }
        } catch (err) {
            console.error(err)
            router.push('/admin')
        }
    }

    const fetchConfig = async () => {
        setLoading(true)
        try {
            const res = await apiFetch(`/config`)
            if (res.ok) {
                const data = await res.json()
                setConfig(data)
                setOriginalConfig(data)
            }
        } catch (err) {
            console.error(err)
            toast.error('Error al cargar la configuración')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await apiFetch(`/config`, {
                method: 'PUT',
                body: JSON.stringify(config)
            })
            if (res.ok) {
                const updated = await res.json()
                setConfig(updated)
                setOriginalConfig(updated)
                toast.success(t('settings_saved') || 'Configuración guardada correctamente')
            } else {
                toast.error('Error al guardar la configuración')
            }
        } catch (err) {
            console.error(err)
            toast.error('Error de conexión')
        } finally {
            setSaving(false)
        }
    }

    const checkRemoteConnection = async () => {
        if (!config.remoteDbUrl) {
            toast.error('Ingresa una URL de base de datos remota')
            return
        }

        setCheckStatus('checking')
        try {
            const res = await apiFetch(`/config/check-remote`, {
                method: 'POST',
                body: JSON.stringify({ url: config.remoteDbUrl })
            })
            const data = await res.json()
            if (res.ok) {
                setCheckStatus('connected')
                toast.success('¡Conexión remota exitosa!')
            } else {
                setCheckStatus('error')
                toast.error(data.message || 'Fallo en la conexión remota')
            }
        } catch (err) {
            setCheckStatus('error')
            toast.error('Error de conexión')
        }
    }

    const checkLocalConnection = async () => {
        setLocalCheckStatus('checking')
        try {
            const res = await apiFetch(`/config/check-local`, {
                method: 'POST',
                body: JSON.stringify({ url: config.localDbUrl })
            })
            const data = await res.json()
            if (res.ok) {
                setLocalCheckStatus('connected')
                toast.success('¡Base de datos local verificada!')
            } else {
                setLocalCheckStatus('error')
                toast.error(data.message || 'Fallo en la base de datos local')
            }
        } catch (err) {
            setLocalCheckStatus('error')
            toast.error('Error de conexión')
        }
    }

    const fetchLocalFiles = async (path?: string) => {
        setExploring(true)
        try {
            const query = path ? `?path=${encodeURIComponent(path)}` : ''
            const res = await apiFetch(`/config/explore-local${query}`)
            if (res.ok) {
                const data = await res.json()
                if (Array.isArray(data)) {
                    // Fallback for old backend
                    const items = data.map((f: any) => ({
                        name: f.name,
                        type: 'file',
                        path: f.name, // Path not available in old version
                        url: f.url
                    }))
                    setFileItems(items)
                    setCurrentPath('')
                } else {
                    // New backend structure
                    setFileItems(data.items || [])
                    setCurrentPath(data.currentPath || '')
                }
            }
        } catch (err) {
            console.error(err)
            toast.error('Error al explorar archivos')
        } finally {
            setExploring(false)
        }
    }

    const triggerSync = async () => {
        if (isModified) {
            toast.error('Primero debes guardar los cambios en la configuración.')
            return
        }
        setSyncing(true)
        try {
            const res = await apiFetch(`/config/sync`, { method: 'POST' })
            const data = await res.json()
            if (res.ok) {
                toast.success(data.message || 'Sincronización completada')
                fetchConfig()
            } else {
                toast.error(data.error || 'Error al sincronizar')
            }
        } catch (err) {
            console.error(err)
            toast.error('Error inesperado al sincronizar')
        } finally {
            setSyncing(false)
        }
    }

    const handlePull = async () => {
        if (isModified) {
            toast.error('Primero debes guardar los cambios en la configuración.')
            return
        }
        setPulling(true)
        try {
            const res = await apiFetch(`/config/pull-remote`, { method: 'POST' })
            const data = await res.json()
            if (res.ok) {
                toast.success(data.message || 'Datos traídos correctamente')
                fetchConfig()
            } else {
                toast.error(data.error || 'Error al traer datos')
            }
        } catch (err) {
            console.error(err)
            toast.error('Error de red al intentar traer datos')
        } finally {
            setPulling(false)
        }
    }

    const openInExplorer = async () => {
        try {
            const res = await apiFetch(`/config/open-explorer`, {
                method: 'POST',
                body: JSON.stringify({ path: currentPath })
            })
            if (res.ok) {
                toast.success('Abriendo en Windows Explorer...')
            } else {
                toast.error('Error al abrir explorer')
            }
        } catch (err) {
            console.error(err)
        }
    }

    if (!mounted || loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{t('database_settings') || 'Ajustes de Base de Datos'}</h2>
                    <p className="text-muted-foreground">
                        {t('db_settings_desc') || 'Gestiona conexiones locales/remotas y sincronización de datos.'}
                    </p>
                </div>
                {isModified && (
                    <Badge variant="destructive" className="animate-pulse py-1.5 px-3">
                        {t('unsaved_changes') || 'Cambios sin guardar'}
                    </Badge>
                )}
            </div>

            <div className="grid gap-6">
                <Card className="shadow-sm border-none bg-secondary/30">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-2xl">
                                    <Database className="h-6 w-6 text-primary" />
                                    {t('connection_mode') || 'Modo de Conexión'}
                                </CardTitle>
                                <CardDescription>
                                    {t('db_mode_desc') || 'Elige dónde se almacenarán tus datos primarios.'}
                                </CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" onClick={fetchConfig} disabled={loading}>
                                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                </Button>
                                <Badge variant={config.dbMode === 'remote' ? "default" : "secondary"} className="px-3 py-1">
                                    {config.dbMode === 'remote' ? 'Remoto Activo' : 'Local Activo'}
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex bg-background p-1.5 rounded-xl border w-full max-w-sm">
                            <Button
                                variant={config.dbMode === 'local' ? 'default' : 'ghost'}
                                onClick={() => setConfig({ ...config, dbMode: 'local' })}
                                className="flex-1 gap-2"
                            >
                                <Server className="h-4 w-4" />
                                {t('local') || 'Local'}
                            </Button>
                            <Button
                                variant={config.dbMode === 'remote' ? 'default' : 'ghost'}
                                onClick={() => setConfig({ ...config, dbMode: 'remote' })}
                                className="flex-1 gap-2"
                            >
                                <LinkIcon className="h-4 w-4" />
                                {t('remote') || 'Remoto'}
                            </Button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4 p-4 bg-background/50 rounded-xl border border-dashed">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label className="flex items-center gap-2">
                                            <Server className="h-4 w-4" /> {t('local_db_config') || 'Configuración Local'}
                                        </Label>
                                        {localCheckStatus === 'connected' && (
                                            <span className="text-xs text-green-600 flex items-center gap-1 font-medium">
                                                <ShieldCheck className="h-3 w-3" /> OK
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Input
                                            id="local-url"
                                            placeholder="postgresql://... o file:prisma/dev.db"
                                            value={config.localDbUrl || ''}
                                            onChange={(e) => setConfig({ ...config, localDbUrl: e.target.value })}
                                        />
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="icon" onClick={() => fetchLocalFiles()} title="Explorar Archivos">
                                                    <FolderOpen className="h-4 w-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Explorar Bases de Datos Locales</DialogTitle>
                                                    <DialogDescription>
                                                        Selecciona un archivo de base de datos de tu directorio.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-2 py-4">
                                                    <div className="flex gap-2">
                                                        <div className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded flex-1 break-all">
                                                            {currentPath || 'Root'}
                                                        </div>
                                                        <Button size="icon" variant="outline" onClick={openInExplorer} title="Abrir en Windows">
                                                            <FolderOpen className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <div className="max-h-[300px] overflow-y-auto space-y-1">
                                                        {exploring ? (
                                                            <div className="flex justify-center py-4"><Loader2 className="animate-spin" /></div>
                                                        ) : fileItems.length > 0 ? (
                                                            fileItems.map((item, i) => (
                                                                <Button
                                                                    key={i}
                                                                    variant={item.type === 'directory' ? "outline" : "ghost"}
                                                                    className={`w-full justify-start gap-3 h-10 ${item.type === 'directory' ? 'border-dashed' : ''}`}
                                                                    onClick={() => {
                                                                        if (item.type === 'directory') {
                                                                            fetchLocalFiles(item.path)
                                                                        } else {
                                                                            setConfig({ ...config, localDbUrl: item.url })
                                                                            toast.success('Seleccionado: ' + item.name)
                                                                        }
                                                                    }}
                                                                >
                                                                    {item.type === 'directory' ? (
                                                                        <FolderOpen className="h-4 w-4 text-amber-500" />
                                                                    ) : (
                                                                        <FileCode className="h-4 w-4 text-blue-500" />
                                                                    )}
                                                                    <span className="truncate">{item.name}</span>
                                                                </Button>
                                                            ))
                                                        ) : (
                                                            <p className="text-center text-muted-foreground py-4">No se encontraron archivos .db aquí.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                    <Button variant="ghost" size="sm" className="w-full text-xs h-8" onClick={checkLocalConnection} disabled={localCheckStatus === 'checking'}>
                                        {localCheckStatus === 'checking' ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <ShieldCheck className="h-3 w-3 mr-2" />}
                                        Probar Conexión Local
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-4 p-4 bg-background/50 rounded-xl border border-dashed">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label className="flex items-center gap-2">
                                            <LinkIcon className="h-4 w-4" /> {t('remote_db_config') || 'Configuración Remota'}
                                        </Label>
                                        {checkStatus === 'connected' && (
                                            <span className="text-xs text-green-600 flex items-center gap-1 font-medium">
                                                <ShieldCheck className="h-3 w-3" /> OK
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Input
                                            id="remote-url"
                                            type="password"
                                            placeholder="postgresql://usuario:pass@host:puerto/db"
                                            value={config.remoteDbUrl || ''}
                                            onChange={(e) => setConfig({ ...config, remoteDbUrl: e.target.value })}
                                        />
                                        <Button variant="outline" size="icon" onClick={checkRemoteConnection} disabled={checkStatus === 'checking'}>
                                            {checkStatus === 'checking' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                    <Button variant="ghost" size="sm" className="w-full text-xs h-8" onClick={checkRemoteConnection} disabled={checkStatus === 'checking'}>
                                        {checkStatus === 'checking' ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <ShieldCheck className="h-3 w-3 mr-2" />}
                                        Probar Conexión Remota
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                className={`h-11 px-8 font-semibold ${isModified ? 'animate-bounce shadow-lg ring-2 ring-primary ring-offset-2' : ''}`}
                                disabled={saving}
                                onClick={handleSave}
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                {t('save_db_config') || 'Guardar Configuración'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-none bg-primary/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <RefreshCw className="h-5 w-5 text-primary" />
                            {t('synchronization') || 'Sincronización de Datos'}
                        </CardTitle>
                        <CardDescription>
                            {t('sync_desc') || 'Sincroniza los registros entre tus bases de datos configuradas.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-2">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground uppercase font-semibold">{t('last_sync') || 'Última Sincronización Exitosa'}</p>
                                <p className="text-xl font-bold">
                                    {config.lastSyncAt ? new Date(config.lastSyncAt).toLocaleString() : (t('never') || 'Nunca')}
                                </p>
                            </div>
                            <div className="flex items-center justify-end gap-3">
                                <Button
                                    className="gap-2 h-12 px-6"
                                    variant="outline"
                                    disabled={pulling || !config.remoteDbUrl || isModified}
                                    onClick={handlePull}
                                >
                                    {pulling ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5 rotate-180" />}
                                    {t('pull_remote') || 'Traer desde Remoto'}
                                </Button>
                                <Button
                                    className="gap-2 h-12 px-6"
                                    variant="default"
                                    disabled={syncing || !config.remoteDbUrl || isModified}
                                    onClick={triggerSync}
                                >
                                    {syncing ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
                                    {t('sync_now') || 'Enviar a Remoto'}
                                </Button>
                            </div>
                        </div>

                        {isModified && (
                            <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900 flex gap-4">
                                <AlertTriangle className="h-6 w-6 text-red-600 shrink-0" />
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-red-900 dark:text-red-400">
                                        Acción Bloqueada: Cambios no guardados
                                    </p>
                                    <p className="text-xs text-red-800 dark:text-red-500">
                                        Has realizado cambios en las URLs o el modo de conexión. Debes hacer clic en "Guardar Configuración" antes de poder sincronizar o traer datos para evitar errores de conexión.
                                    </p>
                                </div>
                            </div>
                        )}

                        {!isModified && (
                            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900 flex gap-4">
                                <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0" />
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-amber-900 dark:text-amber-400">
                                        {t('sync_warning') || 'Nota Crítica'}
                                    </p>
                                    <p className="text-xs text-amber-800 dark:text-amber-500">
                                        {t('sync_warning_text') || 'Esta acción sincronizará los Usuarios, Asistencia y Oficinas entre las bases de datos. Asegúrate de que las URLs sean correctas.'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
