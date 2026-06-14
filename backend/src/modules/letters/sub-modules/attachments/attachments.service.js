const supabase = require('../../../../config/supabase');

class AttachmentsService {
  /**
   * Upload a generated PDF to Supabase Storage
   * @param {Buffer} fileBuffer 
   * @param {string} fileName 
   */
  static async uploadPdf(fileBuffer, fileName) {
    const bucketName = process.env.SUPABASE_BUCKET || 'sipraga-bucket';
    const filePath = `letters/pdf/${Date.now()}_${fileName}.pdf`;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileBuffer, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (error) {
      console.error("Supabase Upload Error:", error);
      throw new Error(`Gagal upload PDF: ${error.message}`);
    }

    // Get public URL
    const { data: publicData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return publicData.publicUrl;
  }
}

module.exports = AttachmentsService;
