'use client'
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from "sonner"
import { Loader2, MapPin, Navigation, Radius, Save } from 'lucide-react'
import { useI18n } from '@/app/i18n'
import { apiFetch } from '@/lib/api'

export default function OfficeSettingsPage() {
    const { t } = useI18n()

    const [office, setOffice] = useState({
        name: '',
        latitude: 0,
        longitude: 0,
        radius: 500
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        fetchOffice()
    }, [])

    const fetchOffice = async () => {
        try {
            const res = await apiFetch(`/office`)
            if (res.ok) {
                const data = await res.json()
                setOffice(data)
            }
        } catch (err) {
            console.error(err)
            toast.error('Failed to load office settings')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await apiFetch(`/office`, {
                method: 'PUT',
                body: JSON.stringify(office)
            })
            if (res.ok) {
                toast.success(t('settings_saved') || 'Settings saved successfully')
            } else {
                toast.error('Failed to save settings')
            }
        } catch (err) {
            console.error(err)
            toast.error('Connection error')
        } finally {
            setSaving(false)
        }
    }

    
    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser')
            return
        }

        toast.info('Getting current location...')
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setOffice({
                    ...office,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                })
                toast.success('Location updated')
            },
            (error) => {
                console.error(error)
                toast.error('Failed to get location: ' + error.message)
            }
        )
    }
    
/*
    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        toast.info("Getting current location...");

        navigator.geolocation.getCurrentPosition(
            (position) => {
            const { latitude, longitude, accuracy } = position.coords;

            console.log("Accuracy:", accuracy, "meters");

            // Validación mínima de calidad
            if (accuracy > 100) {
                toast.error("Location is not accurate enough. Please use mobile GPS.");
                return;
            }

            setOffice((prev) => ({
                ...prev,
                latitude,
                longitude,
                accuracy,
            }));

            console.log("Latitude:", latitude);
            console.log("Longitude:", longitude);
            console.log("Accuracy:", accuracy);

            toast.success(`Location updated (±${Math.round(accuracy)}m)`);
            },
            (error) => {
            console.error(error);

            switch (error.code) {
                case error.PERMISSION_DENIED:
                toast.error("Location permission denied");
                break;
                case error.POSITION_UNAVAILABLE:
                toast.error("Location unavailable");
                break;
                case error.TIMEOUT:
                toast.error("Location request timed out");
                break;
                default:
                toast.error("Failed to get location");
            }
            },
            {
            enableHighAccuracy: true, 
            timeout: 10000,
            maximumAge: 0,
            }
        );
    };
*/

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
                    <h2 className="text-3xl font-bold tracking-tight">{t('office_settings') || 'Office Settings'}</h2>
                    <p className="text-muted-foreground">
                        {t('office_settings_desc') || 'Configure your office location for attendance verification.'}
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="shadow-sm border-none bg-secondary/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            {t('location_details') || 'Location Details'}
                        </CardTitle>
                        <CardDescription>
                            {t('location_details_desc') || 'Set the exact coordinates of your main workplace.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">{t('office_name') || 'Office Name'}</Label>
                            <Input
                                id="name"
                                value={office.name}
                                onChange={(e) => setOffice({ ...office, name: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="lat">{t('latitude') || 'Latitude'}</Label>
                                <Input
                                    id="lat"
                                    type="number"
                                    step="any"
                                    value={office.latitude}
                                    onChange={(e) => setOffice({ ...office, latitude: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lon">{t('longitude') || 'Longitude'}</Label>
                                <Input
                                    id="lon"
                                    type="number"
                                    step="any"
                                    value={office.longitude}
                                    onChange={(e) => setOffice({ ...office, longitude: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>
                        <Button variant="outline" className="w-full gap-2" onClick={getCurrentLocation}>
                            <Navigation className="h-4 w-4" />
                            {t('use_current_location') || 'Use My Current Location'}
                        </Button>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-none bg-secondary/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Radius className="h-5 w-5 text-primary" />
                            {t('verification_radius') || 'Verification Radius'}
                        </CardTitle>
                        <CardDescription>
                            {t('radius_desc') || 'Define the allowed distance (in meters) for check-in.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="radius">{t('radius_meters') || 'Radius (meters)'}</Label>
                                <span className="text-2xl font-bold text-primary">{office.radius}m</span>
                            </div>
                            <Input
                                id="radius"
                                type="range"
                                min="50"
                                max="5000"
                                step="50"
                                value={office.radius}
                                onChange={(e) => setOffice({ ...office, radius: parseInt(e.target.value) })}
                                className="cursor-pointer"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-background rounded-lg border text-center">
                                    <p className="text-xs text-muted-foreground uppercase">{t('min_radius') || 'Minimum'}</p>
                                    <p className="font-bold">50m</p>
                                </div>
                                <div className="p-3 bg-background rounded-lg border text-center">
                                    <p className="text-xs text-muted-foreground uppercase">{t('max_radius') || 'Maximum'}</p>
                                    <p className="font-bold">5km</p>
                                </div>
                            </div>
                        </div>

                        <Button className="w-full gap-2 h-12 text-lg" disabled={saving} onClick={handleSave}>
                            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                            {t('save_changes') || 'Save Settings'}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-dashed">
                <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground text-center italic">
                        {t('office_settings_tip') || 'Tip: Increasing the radius can help if GPS signals are weak inside the building.'}
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
