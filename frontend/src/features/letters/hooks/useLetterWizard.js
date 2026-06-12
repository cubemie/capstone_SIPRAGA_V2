import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../../utils/api';

import { toast } from 'sonner';

export const useLetterWizard = () => {
  // Wizard State
  const [currentStep, setCurrentStep] = useState(1);
  const [draftUuid, setDraftUuid] = useState(null);
  
  // Form Data State
  const [selectedType, setSelectedType] = useState(null);
  const [fieldValues, setFieldValues] = useState({});
  const [letterContent, setLetterContent] = useState({ subject: '', purpose: '' });
  const [attachments, setAttachments] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  // --- Queries ---

  // 1. Fetch Letter Types
  const { data: letterTypes, isLoading: isLoadingTypes } = useQuery({
    queryKey: ['letterTypes'],
    queryFn: async () => {
      const { data, error } = await api.get('/v2/letters/types');
      if (error) throw new Error(error);
      return data?.data || [];
    },
    staleTime: 5 * 60 * 1000 // Cache 5 menit karena data statis
  });

  // 2. Fetch Template Fields
  const { data: templateFields, isLoading: isLoadingFields } = useQuery({
    queryKey: ['templateFields', selectedType?.id],
    queryFn: async () => {
      if (!selectedType?.id) return [];
      const { data, error } = await api.get(`/v2/letters/types/${selectedType.id}/fields`);
      if (error) throw new Error(error);
      return data?.data || [];
    },
    enabled: !!selectedType?.id,
    staleTime: 5 * 60 * 1000
  });

  // 3. Fetch Workflow Options
  const { data: workflowOptions, isLoading: isLoadingWorkflows } = useQuery({
    queryKey: ['workflows'],
    queryFn: async () => {
      const { data, error } = await api.get('/v2/letters/workflows');
      if (error) throw new Error(error);
      return data?.data || [];
    },
    staleTime: 5 * 60 * 1000
  });

  // 4. Fetch Draft Detail
  const { data: draftDetail } = useQuery({
    queryKey: ['letterDetail', draftUuid],
    queryFn: async () => {
      if (!draftUuid) return null;
      const { data, error } = await api.get(`/v2/letters/${draftUuid}`);
      if (error) throw new Error(error);
      return data?.data || null;
    },
    enabled: !!draftUuid
  });

  // --- Mutations ---

  // Save Draft (Step 1-5 consolidation)
  const saveDraftMutation = useMutation({
    mutationFn: async () => {
      // Format fields to array
      const fieldsArray = Object.keys(fieldValues).map(key => ({
        field_key: key,
        value: fieldValues[key]
      }));

      const payload = {
        letter_type_id: selectedType.id,
        workflow_option_id: selectedWorkflow?.id || 1, // Fallback
        subject: letterContent.subject || `Pengajuan ${selectedType.name}`,
        purpose: letterContent.purpose,
        fields: fieldsArray
      };

      const { data, error } = await api.post('/v2/letters/drafts', payload);
      if (error) throw new Error(error);
      return data?.data;
    },
    onSuccess: (data) => {
      setDraftUuid(data.uuid);
    },
    onError: (error) => {
      toast.error(error.message || 'Gagal menyimpan draft');
    }
  });

  // Submit Final (Step 7 -> 8)
  const submitLetterMutation = useMutation({
    mutationFn: async (uuid) => {
      const { data, error } = await api.post(`/v2/letters/${uuid}/submit`);
      if (error) throw new Error(error);
      return data?.data;
    },
    onSuccess: () => {
      toast.success('Surat berhasil diajukan!');
      setCurrentStep(8); // Go to success step
    },
    onError: (error) => {
      toast.error(error.message || 'Gagal mengajukan surat');
    }
  });

  // --- Handlers ---
  
  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 8));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const goToStep = (step) => setCurrentStep(step);

  return {
    // State
    currentStep,
    draftUuid,
    selectedType,
    fieldValues,
    letterContent,
    attachments,
    selectedWorkflow,
    draftDetail,
    
    // Setters
    setSelectedType,
    setFieldValues,
    setLetterContent,
    setAttachments,
    setSelectedWorkflow,
    
    // Navigation
    nextStep,
    prevStep,
    goToStep,
    
    // Queries
    letterTypes,
    isLoadingTypes,
    templateFields,
    isLoadingFields,
    workflowOptions,
    isLoadingWorkflows,
    
    // Mutations
    saveDraft: () => saveDraftMutation.mutateAsync(),
    isSavingDraft: saveDraftMutation.isPending,
    submitLetter: () => submitLetterMutation.mutateAsync(draftUuid),
    isSubmitting: submitLetterMutation.isPending
  };
};
