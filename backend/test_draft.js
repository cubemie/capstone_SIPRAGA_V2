require('dotenv').config();
const LettersService = require('./src/modules/letters/letters.service');
const db = require('./src/config/db');

async function test() {
  try {
    const uuid = await LettersService.createDraft({
      tenant_id: '1',
      resident_id: 1, // assume warga 1 exists
      letter_type_id: 1, // from seed
      workflow_option_id: 1, // from seed
      subject: 'Test Subject',
      purpose: 'Test Purpose',
      fields: []
    });
    console.log('Draft created with UUID:', uuid);
  } catch (error) {
    console.error('Error creating draft:', error);
  } finally {
    process.exit(0);
  }
}

test();
