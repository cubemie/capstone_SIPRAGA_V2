import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Register fonts if needed (using default for now)
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 50,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  letterNumber: {
    fontSize: 10,
    color: '#555555',
  },
  line: {
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    marginBottom: 20,
  },
  content: {
    fontSize: 11,
    lineHeight: 1.5,
  },
  paragraph: {
    marginBottom: 10,
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: 10,
    marginBottom: 20,
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: '35%',
    fontWeight: 'bold',
  },
  colon: {
    width: '5%',
  },
  value: {
    width: '60%',
  },
  footer: {
    marginTop: 40,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 10,
  },
  signatureContainer: {
    marginTop: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  signatureImage: {
    width: 80,
    height: 80,
    objectFit: 'contain',
    marginVertical: 5,
  },
  signatureLine: {
    marginTop: 50,
    width: 120,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
  },
});

const formatKey = (key) => {
  if (!key) return '';
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function LetterPdfTemplate({ data }) {
  // Extract standard fields and dynamic fields
  const {
    letter_type_name = 'Surat Pengantar',
    letter_number = '___/RT.001/RW.001/2026',
    resident_name = 'Nama Pemohon',
    resident_nik = '3374xxxxxxxxxxxx',
    purpose = 'Keperluan',
    dynamic_fields = {},
    qr_token = null,
    signatures = [], // Array of { role: 'Ketua RT', name: 'Budi', url: '...' }
    attachments = [], // Array of { file_url: '...' } or just strings
    approver_name = 'Ketua RT / RW',
    created_date = new Date().toLocaleDateString('id-ID'),
  } = data || {};

  // Convert dynamic_fields object to array of { label, value }
  const customFields = Object.entries(dynamic_fields).map(([k, v]) => ({
    label: formatKey(k),
    value: v,
  }));

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{letter_type_name}</Text>
          <Text style={styles.letterNumber}>Nomor: {letter_number}</Text>
        </View>

        <View style={styles.line} />

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.paragraph}>
            Yang bertanda tangan di bawah ini menerangkan bahwa:
          </Text>

          <View style={styles.table}>
            <View style={styles.row}>
              <Text style={styles.label}>Nama Lengkap</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{resident_name}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>NIK</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{resident_nik}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Keperluan</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{purpose}</Text>
            </View>

            {/* Render Custom Fields dynamically */}
            {customFields.map((field, idx) => (
              <View style={styles.row} key={idx}>
                <Text style={styles.label}>{field.label}</Text>
                <Text style={styles.colon}>:</Text>
                <Text style={styles.value}>{field.value || '-'}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.paragraph}>
            Demikian surat ini dibuat agar dapat dipergunakan sebagaimana mestinya.
          </Text>
        </View>

        {/* Footer & Signatures */}
        <View style={styles.footer}>
          <View style={{ flex: 1 }}>
            <Text>Dibuat tanggal: {created_date}</Text>
          </View>
          
          <View style={{ flex: 2, flexDirection: 'row', justifyContent: 'flex-end', gap: 20 }}>
            {signatures.map((sig, idx) => (
              <View key={idx} style={styles.signatureContainer}>
                <Text>{sig.role}</Text>
                {sig.url ? (
                  <Image src={sig.url} style={styles.signatureImage} />
                ) : qr_token ? (
                  <View style={{ height: 60, justifyContent: 'center' }}>
                    <Text style={{ fontSize: 8, color: '#888' }}>[QR CODE DIGITAL]</Text>
                  </View>
                ) : (
                  <View style={styles.signatureLine} />
                )}
                <Text style={{ fontSize: 8, marginTop: 5, color: '#666', textAlign: 'center' }}>
                  Dokumen sah & tertanda digital
                </Text>
                <Text style={{ fontSize: 8, marginTop: 2, color: '#000', fontWeight: 'bold' }}>
                  {sig.name}
                </Text>
              </View>
            ))}
            
            {/* Fallback if no signatures configured yet */}
            {signatures.length === 0 && (
              <View style={styles.signatureContainer}>
                <Text>{approver_name}</Text>
                <View style={styles.signatureLine} />
              </View>
            )}
          </View>
        </View>
      </Page>

      {/* Lampiran Pages */}
      {attachments && attachments.length > 0 && attachments.map((att, index) => (
        <Page key={`attachment-${index}`} size="A4" style={styles.page}>
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.headerTitle}>LAMPIRAN PERSYARATAN</Text>
            <Text style={{ textAlign: 'center', fontSize: 10, marginTop: 5, color: '#666' }}>
              Lampiran {index + 1} dari {attachments.length}
            </Text>
          </View>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Image 
              src={typeof att === 'string' ? att : att.file_url} 
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
            />
          </View>
        </Page>
      ))}
    </Document>
  );
}
