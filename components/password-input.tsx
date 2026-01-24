"use client"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { useI18n } from "@/app/i18n"
import { useState } from "react"
import { Input } from "./ui/input"

const PasswordInput = ({label}: {label: string}) => {

    const { t, isRTL } = useI18n()
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [currentPassword, setCurrentPassword] = useState("")
    return (
        <div className="space-y-1.5">
                                <Label htmlFor={label}>{t(label) || 'Passwor'}</Label>
                                <div className="relative">
                                    <Input
                                        id={label}
                                        type={showCurrentPassword ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="••••••••"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className={`absolute top-0 h-full px-3 py-2 hover:bg-transparent ${isRTL ? 'left-0' : 'right-0'}`}
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    >
                                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
    )
}

export default PasswordInput