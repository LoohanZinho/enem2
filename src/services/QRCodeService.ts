import QRCode from 'qrcode';

interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

class QRCodeService {
  private static instance: QRCodeService;

  public static getInstance(): QRCodeService {
    if (!QRCodeService.instance) {
      QRCodeService.instance = new QRCodeService();
    }
    return QRCodeService.instance;
  }

  /**
   * Gera QR Code como Data URL (para usar em <img>)
   */
  public async generateQRCodeDataURL(
    text: string, 
    options: QRCodeOptions = {}
  ): Promise<string> {
    try {
      const defaultOptions = {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M' as const,
        ...options
      };

      const dataURL = await QRCode.toDataURL(text, defaultOptions);
      return dataURL;
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      throw error;
    }
  }

  /**
   * Gera QR Code como SVG
   */
  public async generateQRCodeSVG(
    text: string, 
    options: QRCodeOptions = {}
  ): Promise<string> {
    try {
      const defaultOptions = {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M' as const,
        ...options
      };

      const svg = await QRCode.toString(text, { 
        type: 'svg',
        ...defaultOptions
      });
      return svg;
    } catch (error) {
      console.error('Erro ao gerar QR Code SVG:', error);
      throw error;
    }
  }

  /**
   * Gera QR Code para PIX da Cakto
   */
  public async generateCaktoPixQRCode(
    planId: string,
    amount: number,
    customerEmail?: string,
    customerName?: string
  ): Promise<string> {
    try {
      // URL base da Cakto
      const baseUrl = 'https://pay.cakto.com.br/6q9cd6n_589724';
      
      // Parâmetros para a Cakto
      const params = new URLSearchParams({
        plan: planId,
        amount: (amount * 100).toString(), // Cakto espera em centavos
        currency: 'BRL',
        ...(customerEmail && { email: customerEmail }),
        ...(customerName && { name: customerName })
      });

      const fullUrl = `${baseUrl}?${params.toString()}`;
      
      // Gerar QR Code com estilo personalizado
      const qrCodeDataURL = await this.generateQRCodeDataURL(fullUrl, {
        width: 300,
        margin: 3,
        color: {
          dark: '#1a1a1a',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H'
      });

      return qrCodeDataURL;
    } catch (error) {
      console.error('Erro ao gerar QR Code da Cakto:', error);
      throw error;
    }
  }

  /**
   * Gera QR Code simples para URL
   */
  public async generateSimpleQRCode(url: string): Promise<string> {
    try {
      return await this.generateQRCodeDataURL(url, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (error) {
      console.error('Erro ao gerar QR Code simples:', error);
      throw error;
    }
  }

  /**
   * Valida se uma string é uma URL válida
   */
  public isValidURL(string: string): boolean {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }
}

export default QRCodeService;
