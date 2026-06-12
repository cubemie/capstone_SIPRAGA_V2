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
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '2cm', right: '2cm', bottom: '2cm', left: '2cm' }
      });
      
      return pdfBuffer;
    } finally {
      await browser.close();
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
    const templateData = {
      ...letter,
      ...fields,
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
          <body style="font-family: sans-serif;">
            <h1>{{letter_type_name}}</h1>
            <p>Nomor: {{letter_number}}</p>
            <p>Nama: {{resident_name}}</p>
            <p>NIK: {{resident_nik}}</p>
            <p>Keperluan: {{purpose}}</p>
            <hr/>
            {{#qrCodeBase64}}
              <img src="{{qrCodeBase64}}" width="100"/>
            {{/qrCodeBase64}}
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
