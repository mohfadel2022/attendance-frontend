"use client"
import { useState, useEffect } from "react"

import { useI18n } from "@/app/i18n";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import jsPDF from "jspdf";
import { QrCode } from "lucide-react";
import QRCode from "react-qr-code";

const OfficeqrPage = () => {
    const { t } = useI18n()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const handlePrint = () => {
        const svg = document.querySelector('#printable-qr svg');
        if (!svg) {
            console.error('QR SVG not found');
            return;
        }

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new window.Image();

        img.onload = () => {
            // Scale up for better quality
            const scale = 4;
            canvas.width = svg.clientWidth * scale;
            canvas.height = svg.clientHeight * scale;
            if (ctx) {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                const pngData = canvas.toDataURL('image/png');
                const doc = new jsPDF('p', 'mm', 'a4');
                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();

                // Centering logic
                const qrSize = 120; // 120mm wide
                const x = (pageWidth - qrSize) / 2;
                const y = (pageHeight - qrSize) / 2 - 10;

                // Add Title
                doc.setFontSize(28);
                doc.setTextColor(40, 40, 40);
                doc.text("Office Check-in/out", pageWidth / 2, y - 25, { align: 'center' });

                // Add QR Code
                doc.addImage(pngData, 'PNG', x, y, qrSize, qrSize);

                // Add Label
                doc.setFontSize(16);
                doc.setFont("courier", "bold");
                doc.text("OFFICE_CHECK_2025", pageWidth / 2, y + qrSize + 15, { align: 'center' });

                // Add Subtitle
                doc.setFontSize(14);
                doc.setFont("helvetica", "normal");
                doc.setTextColor(100, 100, 100);
                doc.text("Scan to Check-in / Check-out", pageWidth / 2, y + qrSize + 25, { align: 'center' });

                // Preview PDF
                const pdfBlob = doc.output('blob');
                const pdfUrl = URL.createObjectURL(pdfBlob);
                window.open(pdfUrl, '_blank');
            }
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    }

    if (!mounted) return null

    return (
        <div className="flex flex-1 items-center justify-center gap-20 p-4 min-h-[calc(100vh-200px)] flex-col-reverse md:flex-row">
            <Card className="p-8 border shadow-lg flex flex-col items-center bg-background w-[420px] h-[560px] justify-center rounded-xl" id="printable-qr">
                <div className="flex flex-col items-center gap-6">
                    <h1 className="text-3xl font-bold text-center">{t('office_checkin_title')}</h1>
                    <div className="p-5 bg-white rounded-xl border shadow-sm">
                        <QRCode value="OFFICE_CHECK_2025" size={280} />
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <span className="font-mono text-xl font-bold text-muted-foreground">OFFICE_CHECK_2025</span>
                        <span className="text-lg text-muted-foreground text-center">{t('scan_to_check')}</span>
                    </div>
                </div>
            </Card>

            <div className="flex flex-col gap-4 items-center">
                <div className="text-base text-muted-foreground w-[200px] text-center">
                    {t('qr_description')}
                </div>
                <Button
                    size="lg"
                    className="gap-2"
                    onClick={handlePrint}
                >
                    <QrCode className="h-5 w-5" />
                    {t('export_pdf')}
                </Button>
            </div>
        </div>
    )
}

export default OfficeqrPage
