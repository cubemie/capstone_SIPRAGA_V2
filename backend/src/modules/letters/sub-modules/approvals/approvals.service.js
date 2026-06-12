const LettersModel = require('../../letters.model');
const { pdfQueue } = require('../pdf/pdf.queue');

class ApprovalsService {
  /**
   * Approve a letter by RT or RW
   */
  static async approveLetter(uuid, role) {
    const letter = await LettersModel.getLetterByUuid(uuid);
    if (!letter) throw new Error("Letter not found");

    // Get current workflow steps
    const steps = typeof letter.workflow_steps === 'string' ? JSON.parse(letter.workflow_steps) : letter.workflow_steps;
    
    // Find the next step
    const currentStepIndex = steps.findIndex(s => s.step === letter.current_step);
    if (currentStepIndex === -1) throw new Error("Invalid workflow state");

    const currentStepConfig = steps[currentStepIndex];
    if (currentStepConfig.role !== role) {
      throw new Error(`Role ${role} is not authorized for this step`);
    }

    const nextStepConfig = steps[currentStepIndex + 1];

    if (nextStepConfig) {
      // Move to next step
      let nextStatus = 'in_review_rw'; // default assumption
      if (nextStepConfig.role === 'admin_rw') {
        nextStatus = 'in_review_rw';
      }
      
      await LettersModel.updateLetterStatus(letter.id, nextStatus, nextStepConfig.step);
      return { status: nextStatus, step: nextStepConfig.step };
    } else {
      // Workflow is finished!
      // Generate a letter number (in a real app, use a sequence generator)
      const letterNumber = `LTR/${new Date().getFullYear()}/${letter.id.toString().padStart(4, '0')}`;
      
      // Update status to completed
      await LettersModel.updateLetterStatus(letter.id, 'completed', letter.current_step, letterNumber, letter.uuid);

      // Trigger PDF generation asynchronously!
      await pdfQueue.add('generate-pdf', { letterUuid: letter.uuid });

      return { status: 'completed', step: letter.current_step };
    }
  }

  /**
   * Reject a letter
   */
  static async rejectLetter(uuid, role, reason) {
    const letter = await LettersModel.getLetterByUuid(uuid);
    if (!letter) throw new Error("Letter not found");

    // Check if authorized
    const steps = typeof letter.workflow_steps === 'string' ? JSON.parse(letter.workflow_steps) : letter.workflow_steps;
    const currentStepConfig = steps.find(s => s.step === letter.current_step);
    
    if (currentStepConfig.role !== role) {
      throw new Error(`Role ${role} is not authorized for this step`);
    }

    // In a real app, we might save the rejection reason to a remarks table
    await LettersModel.updateLetterStatus(letter.id, 'rejected', letter.current_step);
    
    return { status: 'rejected' };
  }
}

module.exports = ApprovalsService;
