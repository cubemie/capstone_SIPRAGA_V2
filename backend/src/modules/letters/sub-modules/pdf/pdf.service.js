const mustache = require('mustache');
const QRCode = require('qrcode');
const LettersModel = require('../../letters.model');

class PdfService {
  /**
   * Render HTML string using Mustache
   */
  static async renderHtml(templateStr, data) {
    // Generate QR Code if token exists
    if (data.qr_token) {
      // In production, this URL should point to the public verification page
      const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify/${data.qr_token}`;
      data.qrCodeBase64 = await QRCode.toDataURL(verificationUrl);
    }

    return mustache.render(templateStr, data);
  }

  /**
   * Generate PDF buffer from HTML string
   */
  static async generatePdfBuffer(htmlContent) {
    const { getBrowser } = require('../../../../utils/puppeteerManager');
    const browser = await getBrowser();
    let page;

    try {
      page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '2cm', right: '2cm', bottom: '2cm', left: '2cm' }
      });
      
      return pdfBuffer;
    } finally {
      if (page) await page.close();
    }
  }

  /**
   * Main function to generate PDF for a specific letter
   * Can be called by BullMQ worker or directly for preview
   */
  static async createPdfForLetter(uuid) {
    // 1. Fetch letter detail & fields
    const letter = await LettersModel.getLetterByUuid(uuid);
    if (!letter) throw new Error("Letter not found");

    const fields = await LettersModel.getFieldValues(letter.id);
    
    // Combine standard letter data with dynamic fields
    const dynamicFieldsArray = Object.entries(fields).map(([k, v]) => ({
      key: k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: v
    }));

    const templateData = {
      ...letter,
      ...fields,
      dynamic_fields: dynamicFieldsArray,
      // Format dates if necessary
      created_date: new Date(letter.created_at).toLocaleDateString('id-ID'),
    };

    // 2. Fetch template
    const template = await LettersModel.getPdfTemplate(letter.letter_type_id, letter.tenant_id);
    
    let htmlTemplateStr;
    if (!template) {
      // Fallback simple template
      htmlTemplateStr = `
        <html>
          <body style="font-family: sans-serif; padding: 20px;">
            <h1 style="text-align: center; text-transform: uppercase; margin-bottom: 5px;">{{letter_type_name}}</h1>
            <p style="text-align: center; margin-top: 0; color: #555;">Nomor: {{letter_number}}</p>
            <hr style="margin: 20px 0; border: 1px solid #ccc;" />
            
            <p>Yang bertanda tangan di bawah ini menerangkan bahwa:</p>
            <table style="width: 100%; margin-bottom: 20px; border-collapse: collapse;">
              <tr>
                <td style="width: 30%; padding: 5px 0;"><strong>Nama Lengkap</strong></td>
                <td style="width: 5%; text-align: center;">:</td>
                <td style="width: 65%;">{{resident_name}}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0;"><strong>NIK</strong></td>
                <td style="text-align: center;">:</td>
                <td>{{resident_nik}}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0;"><strong>Tujuan/Keperluan</strong></td>
                <td style="text-align: center;">:</td>
                <td>{{purpose}}</td>
              </tr>
              {{#dynamic_fields}}
              <tr>
                <td style="padding: 5px 0;"><strong>{{key}}</strong></td>
                <td style="text-align: center;">:</td>
                <td>{{value}}</td>
              </tr>
              {{/dynamic_fields}}
            </table>

            <p>Demikian surat ini dibuat agar dapat dipergunakan sebagaimana mestinya.</p>
            
            <div style="margin-top: 50px; text-align: right;">
              <p>Dibuat tanggal: {{created_date}}</p>
              {{#qrCodeBase64}}
                <img src="{{qrCodeBase64}}" width="100" style="margin-top: 10px;" />
                <p style="font-size: 10px; color: #666; margin-top: 5px;">Dokumen ini sah dan ditandatangani secara elektronik</p>
              {{/qrCodeBase64}}
            </div>
          </body>
        </html>
      `;
    } else {
      htmlTemplateStr = template.html_template;
    }

    // 3. Render HTML
    const renderedHtml = await this.renderHtml(htmlTemplateStr, templateData);

    // 4. Generate PDF
    const pdfBuffer = await this.generatePdfBuffer(renderedHtml);
    return pdfBuffer;
  }
}

module.exports = PdfService;
