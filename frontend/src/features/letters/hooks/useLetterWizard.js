import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../../utils/api';
import { toast } from 'sonner';

export const useLetterWizard = () => {
  // Wizard State
  const [isSubmitted, setIsSubmitted] = useState(false);
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

  // --- Mutations ---

  // Simpan Draft
  const saveDraftMutation = useMutation({
    mutationFn: async () => {
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
      toast.error('Gagal menyimpan draft: ' + (error.message || error));
    }
  });

  // Upload Attachments
  const uploadAttachmentsMutation = useMutation({
    mutationFn: async ({ uuid, files }) => {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('attachments', file);
      });
      
      const { data, error } = await api.postFormData(`/v2/letters/${uuid}/attachments`, formData);
      if (error) throw new Error(error);
      return data;
    },
    onError: (error) => {
      toast.error('Gagal mengunggah lampiran: ' + (error.message || error));
    }
  });

  // Submit Final (Merubah status draft menjadi diajukan)
  const submitLetterMutation = useMutation({
    mutationFn: async (uuid) => {
      const { data, error } = await api.post(`/v2/letters/${uuid}/submit`);
      if (error) throw new Error(error);
      return data?.data;
    },
    onSuccess: () => {
      toast.success('Surat berhasil diajukan!');
      setIsSubmitted(true);
    },
    onError: (error) => {
      toast.error(error.message || 'Gagal mengajukan surat');
    }
  });

  return {
    // State
    isSubmitted,
    draftUuid,
    selectedType,
    fieldValues,
    letterContent,
    attachments,
    selectedWorkflow,
    
    // Setters
    setIsSubmitted,
    setSelectedType,
    setFieldValues,
    setLetterContent,
    setAttachments,
    setSelectedWorkflow,
    
    // Queries
    letterTypes,
    isLoadingTypes,
    templateFields,
    isLoadingFields,
    workflowOptions,
    isLoadingWorkflows,
    
    // Mutations
    saveDraftAsync: saveDraftMutation.mutateAsync,
    isSavingDraft: saveDraftMutation.isPending,
    uploadAttachmentsAsync: uploadAttachmentsMutation.mutateAsync,
    isUploadingAttachments: uploadAttachmentsMutation.isPending,
    submitLetterAsync: submitLetterMutation.mutateAsync,
    isSubmitting: submitLetterMutation.isPending || saveDraftMutation.isPending || uploadAttachmentsMutation.isPending
  };
};
