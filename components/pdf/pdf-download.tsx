// components/pdf/pdf-download.tsx

'use client';

import { pdf } from '@react-pdf/renderer';
import { toast } from 'sonner';
import { downloadBlob } from '@/lib/utils';

interface DownloadOptions {
  filename: string;
  component: React.ReactElement;
}

export async function downloadPDF({ filename, component }: DownloadOptions) {
  try {
    const blob = await pdf(component).toBlob();
    downloadBlob(blob, filename);
    return true;
  } catch (err) {
    toast.error('Failed to generate PDF');
    return false;
  }
}

export async function printPDF({ component }: { component: React.ReactElement }) {
  try {
    const blob = await pdf(component).toBlob();
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (!win) {
      toast.error('Please allow popups to print');
      return;
    }
    // Give browser time to load the PDF then trigger print
    setTimeout(() => {
      try {
        win.print();
      } catch {
        // ignore
      }
    }, 800);
  } catch (err) {
    toast.error('Failed to open print dialog');
  }
}