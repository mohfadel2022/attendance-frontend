import { useI18n } from "@/app/i18n"
import { Button } from "./ui/button"

type ButtonProps={
    variant:'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link',
    value:string,
    setSettings:(v:any)=>void,
    updateSettings:(v:string,lang?:string)=>void,
    icon?:React.ReactNode
}

const ButtonOption = ({ variant, value, setSettings, updateSettings, icon }: ButtonProps) => {

    const { t } = useI18n()
    return (
        <Button
            size="sm"
            variant={variant}
            onClick={() => {
                setSettings(value)
                updateSettings(value, undefined)
            }}
            className="flex-1 gap-2 border-none shadow-none"
        >
            {icon}
            {t(value)}
        </Button>
    )
}

export default ButtonOption