import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Espaco } from '@/pages/Particoes';

interface QrCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  espaco: Espaco | null;
  qrCodeType: "empresa" | "espaco";
  baseUrl: string;
}

export function QrCodeDialog({
  open,
  onOpenChange,
  espaco,
  qrCodeType,
  baseUrl
}: QrCodeDialogProps) {
  const qrCodeRef = useRef<HTMLDivElement>(null);

  // Criar a URL para o QR Code
  const generateQrCodeUrl = () => {
    if (!espaco) return '';

    const params = new URLSearchParams();
    params.append('companyId', espaco.companyId.toString());
    params.append('companyName', espaco.companyName || '');
    if (qrCodeType === 'espaco') {
      params.append('espacoId', espaco.id.toString());
      params.append('espacoNome', espaco.name);
    }
    return `${baseUrl}/agendamento-qrcode?${params.toString()}`;
  };

  const downloadAsPdf = async () => {
    if (!qrCodeRef.current) return;
    
    try {
      const element = qrCodeRef.current;
      const canvas = await html2canvas(element, {
        scale: 3,
        backgroundColor: '#ffffff',
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      // Add title
      pdf.setFontSize(18);
      pdf.text(
        qrCodeType === 'empresa' 
          ? `QR Code para Agendamento: ${espaco?.companyName}` 
          : `QR Code para Agendamento: ${espaco?.name}`,
        20, 
        20
      );
      
      // Add description
      pdf.setFontSize(12);
      pdf.text(
        qrCodeType === 'empresa'
          ? 'Escaneie este QR Code para agendar em qualquer espaço desta empresa'
          : 'Escaneie este QR Code para agendar especificamente neste espaço',
        20,
        30
      );
      
      // Calculate position to center the QR code
      const imgWidth = 100;
      const imgHeight = 100;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const x = (pageWidth - imgWidth) / 2;
      const y = 50;
      
      // Add QR code image
      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      
      // Add URL text below QR code
      pdf.setFontSize(8);
      const url = generateQrCodeUrl();
      const urlWidth = pdf.getStringUnitWidth(url) * 8 / pdf.internal.scaleFactor;
      const urlX = (pageWidth - urlWidth) / 2;
      pdf.text(url, urlX, y + imgHeight + 10);
      
      // Add usage instructions
      pdf.setFontSize(10);
      pdf.text('Como usar:', 20, y + imgHeight + 25);
      pdf.text('1. Abra a câmera do seu smartphone', 20, y + imgHeight + 35);
      pdf.text('2. Aponte para o QR Code acima', 20, y + imgHeight + 45);
      pdf.text('3. Toque na notificação que aparecer', 20, y + imgHeight + 55);
      pdf.text('4. Preencha seus dados e escolha o horário desejado', 20, y + imgHeight + 65);
      
      // Add footer with timestamp
      pdf.setFontSize(8);
      pdf.text(`Gerado em: ${new Date().toLocaleString()}`, 20, pageHeight - 10);
      
      // Save the PDF
      pdf.save(
        qrCodeType === 'empresa'
          ? `QRCode_${espaco?.companyName?.replace(/\s+/g, '_')}.pdf`
          : `QRCode_${espaco?.name?.replace(/\s+/g, '_')}.pdf`
      );
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.');
    }
  };

  const qrCodeUrl = generateQrCodeUrl();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            QR Code para Agendamento
          </DialogTitle>
          <DialogDescription>
            {qrCodeType === 'empresa'
              ? `Use este QR Code para agendar em qualquer espaço da empresa ${espaco?.companyName}`
              : `Use este QR Code para agendar diretamente no espaço ${espaco?.name}`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-4" ref={qrCodeRef}>
          <div className="border rounded-md p-4 bg-white">
            <QRCodeSVG 
              value={qrCodeUrl} 
              size={250}
              level="H"
              includeMargin={true}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-4 text-center break-all">
            {qrCodeUrl}
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button onClick={downloadAsPdf}>
            Baixar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
