'use client';

import Link from 'next/link';
import React, { useState, useEffect, Suspense } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import {
  ChevronLeft,
  ZoomIn,
  ZoomOut,
  Download,
  Menu,
  X,
  Monitor,
} from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const LoadingSpinner = () => (
  <div className="flex flex-col items-center space-y-3">
    <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
    <span className="text-gray-600">Loading PDF...</span>
  </div>
);

const ErrorMessage = ({ message }) => (
  <div className="fixed top-16 md:top-4 left-4 right-4 md:max-w-md md:left-auto p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg shadow-md z-50 flex items-center">
    <span className="flex-grow">{message}</span>
    <button
      onClick={() => setError('')}
      className="ml-3 text-red-500 hover:text-red-700"
    >
      <X size={18} />
    </button>
  </div>
);

const ControlButton = ({ onClick, children, className = '' }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors ${className}`}
  >
    {children}
  </button>
);

export default function PdfViewer() {
  const [pdfUrl, setPdfUrl] = useState('');
  const [inputUrl, setInputUrl] = useState(
    'http://172.105.39.187/compressed.tracemonkey-pldi-09.pdf'
  );
  const [numPages, setNumPages] = useState(null);
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pageWidth, setPageWidth] = useState(null);
  const [currentView, setCurrentView] = useState('fit-width');
  const [currentPage, setCurrentPage] = useState(1);

  const calculateScale = (containerWidth) => {
    const breakpoints = {
      xs: { width: 380, scale: 0.5 },
      sm: { width: 640, scale: 0.65 },
      md: { width: 768, scale: 0.8 },
      lg: { width: 1024, scale: 0.9 },
      xl: { width: Infinity, scale: 1 },
    };

    return (
      Object.values(breakpoints).find((bp) => containerWidth < bp.width)
        ?.scale || 1
    );
  };

  useEffect(() => {
    const updateDimensions = () => {
      const container = document.getElementById('pdf-container');
      if (container) {
        const containerWidth = container.clientWidth;
        setPageWidth(containerWidth - 48);
        if (currentView === 'fit-width') {
          setScale(calculateScale(containerWidth));
        }
      }
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();
    return () => window.removeEventListener('resize', updateDimensions);
  }, [currentView]);

  const loadPdf = async (url) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `/api/proxypdfurl?url=${encodeURIComponent(url)}`
      );
      if (!response.ok) throw new Error('Failed to load PDF');
      const blob = await response.blob();
      setPdfUrl(URL.createObjectURL(blob));
      setIsSidebarOpen(false);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message);
      setPdfUrl('');
    } finally {
      setLoading(false);
    }
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    loadPdf(inputUrl);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      setError('Download failed. Please try again.');
    }
  };

  const toggleView = () => {
    setCurrentView((prev) => {
      const newView = prev === 'fit-width' ? 'actual-size' : 'fit-width';
      const container = document.getElementById('pdf-container');
      setScale(
        newView === 'fit-width' && container
          ? calculateScale(container.clientWidth)
          : 1
      );
      return newView;
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-50 md:hidden bg-white shadow-md p-2 flex items-center justify-between">
        <ControlButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </ControlButton>

        {pdfUrl ? (
          <div className="flex items-center space-x-2">
            <ControlButton
              onClick={() => setScale((s) => Math.max(0.3, s - 0.1))}
            >
              <ZoomOut size={18} />
            </ControlButton>
            <span className="text-sm font-medium">
              {Math.round(scale * 100)}%
            </span>
            <ControlButton
              onClick={() => setScale((s) => Math.min(1, s + 0.1))}
            >
              <ZoomIn size={18} />
            </ControlButton>
          </div>
        ) : (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="px-3 py-1 text-sm rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            Add URL
          </button>
        )}

        <Link href="/" className="control-button">
          <ChevronLeft size={18} />
        </Link>
      </div>

      <div className="flex flex-col md:flex-row h-screen pt-12 md:pt-0">
        {/* Sidebar */}
        <aside
          className={`
            fixed md:relative
            w-full md:w-72 lg:w-80 xl:w-96
            h-[calc(100vh-3rem)] md:h-screen
            bg-white border-r
            transform transition-transform duration-300 ease-in-out
            ${
              isSidebarOpen
                ? 'translate-x-0'
                : '-translate-x-full md:translate-x-0'
            }
            z-40 md:z-auto
            overflow-y-auto
          `}
        >
          <div className="p-4 space-y-6">
            <div>
              <h1 className="text-xl font-bold mb-4 flex items-center gap-3">
                <Link
                  href="/"
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <ChevronLeft size={18} />
                </Link>
                URL PDF Viewer
              </h1>

              <form onSubmit={handleUrlSubmit} className="space-y-3">
                <input
                  type="url"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="Enter PDF URL..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors text-sm"
                >
                  {loading ? 'Loading...' : 'Load PDF'}
                </button>
              </form>
            </div>

            {pdfUrl && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="hidden md:flex items-center justify-between mb-4">
                    <ControlButton
                      onClick={() => setScale((s) => Math.max(0.3, s - 0.1))}
                    >
                      <ZoomOut size={18} />
                    </ControlButton>
                    <span className="font-medium">
                      {Math.round(scale * 100)}%
                    </span>
                    <ControlButton
                      onClick={() => setScale((s) => Math.min(1, s + 0.1))}
                    >
                      <ZoomIn size={18} />
                    </ControlButton>
                  </div>

                  <button
                    onClick={toggleView}
                    className="w-full px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 text-sm flex items-center justify-center gap-2"
                  >
                    <Monitor size={16} />
                    {currentView === 'fit-width'
                      ? 'Actual Size'
                      : 'Fit to Width'}
                  </button>

                  <button
                    onClick={handleDownload}
                    className="w-full px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 text-sm flex items-center justify-center gap-2"
                  >
                    <Download size={16} />
                    Download PDF
                  </button>
                </div>

                {numPages && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Page {currentPage} of {numPages}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main
          id="pdf-container"
          className="flex-1 relative overflow-auto p-4 md:p-6 bg-gray-100"
        >
          {error && <ErrorMessage message={error} />}

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
              <LoadingSpinner />
            </div>
          )}

          {pdfUrl && (
            <Suspense fallback={<LoadingSpinner />}>
              <Document
                file={pdfUrl}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                onLoadError={(err) =>
                  setError(`Error loading PDF: ${err.message}`)
                }
                className="flex flex-col items-center"
              >
                {Array.from(new Array(numPages), (_, index) => (
                  <div
                    key={`page_${index + 1}`}
                    className="mb-4 flex justify-center w-full"
                  >
                    <Page
                      pageNumber={index + 1}
                      scale={scale}
                      className="shadow-xl rounded-lg bg-white"
                      renderTextLayer={false}
                      renderAnnotationLayer={true}
                      width={pageWidth}
                      onLoadSuccess={() => index === 0 && setCurrentPage(1)}
                      onRenderSuccess={() => setCurrentPage(index + 1)}
                    />
                  </div>
                ))}
              </Document>
            </Suspense>
          )}
        </main>
      </div>
    </div>
  );
}
