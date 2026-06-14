import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { api } from '../../../../utils/api';

// Setup worker react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const fetchPreviewPdf = async (uuid) => {
  const res = await api.get(`/v2/letters/${uuid}/preview-pdf`);
  return res.data.data.pdf_url;
};

export default function Step6PdfPreview({ draftUuid }) {
  const [numPages, setNumPages] = useState(null);

  const { data: pdfUrl, isLoading, isError, error } = useQuery({
    queryKey: ['pdf-preview', draftUuid],
    queryFn: async () => {
      try {
        console.log('Fetching PDF for draft:', draftUuid);
        const res = await api.get(`/v2/letters/${draftUuid}/preview-pdf`);
        if (res.error) throw new Error(res.error);
        console.log('PDF URL received:', res.data?.data?.pdf_url ? 'Yes' : 'No');
        return res.data?.data?.pdf_url;
      } catch (err) {
        console.error('PDF Fetch Error:', err);
        throw err;
      }
    },
    enabled: !!draftUuid,
    staleTime: 1000 * 60 * 5, // cache 5 menit
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Preview Surat</h2>
        {pdfUrl && (
          <a
            href={pdfUrl}
            download="preview-surat.pdf"
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Download Preview
          </a>
        )}
      </div>

      <div className="border rounded-lg bg-gray-50 min-h-96 flex items-center justify-center">
        {isLoading && (
          <div className="text-center text-gray-500">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-sm">Sedang generate PDF...</p>
          </div>
        )}

        {isError && (
          <div className="text-red-500 text-sm text-center p-4">
            <p className="font-bold">Gagal memuat PDF preview.</p>
            <p>{error?.message || String(error)}</p>
          </div>
        )}

        {pdfUrl && (
          <Document
            file={pdfUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            onLoadError={(err) => {
              console.error('React-PDF load error:', err);
              alert('Error loading PDF: ' + err.message);
            }}
            className="flex flex-col items-center gap-2"
          >
            {Array.from({ length: numPages || 1 }, (_, i) => (
              <Page
                key={i + 1}
                pageNumber={i + 1}
                width={600}
                className="shadow-md"
              />
            ))}
          </Document>
        )}
      </div>

      {numPages && (
        <p className="text-xs text-center text-gray-400">
          {numPages} halaman
        </p>
      )}
    </div>
  );
}
