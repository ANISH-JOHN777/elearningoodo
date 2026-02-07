import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Download, Share2, ArrowLeft, CheckCircle } from 'lucide-react';
import html2pdf from 'html2pdf.js';

/**
 * CertificateView - Public certificate display page
 * Allows verified viewing of course completion certificates
 * Shareable via direct link
 */
export default function CertificateView() {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  const { getCertificateById, recordCertificateShare } = useApp();
  const [downloaded, setDownloaded] = useState(false);
  const certificateRef = React.useRef(null);

  const certificate = getCertificateById(certificateId);

  if (!certificate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">❌</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Certificate Not Found</h1>
          <p className="text-gray-600 mb-8">
            The certificate you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Format date
  const formattedDate = new Date(certificate.completionDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Download certificate as PDF
  const handleDownloadPDF = () => {
    const element = certificateRef.current;
    const options = {
      margin: 0,
      filename: `${certificate.userName}-${certificate.courseName.replace(/\s+/g, '-')}-Certificate.pdf`,
      image: { type: 'png', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'landscape', unit: 'mm', format: 'a4' },
    };

    html2pdf().set(options).from(element).save();
    setDownloaded(true);
    recordCertificateShare(certificateId, 'pdf_download');
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Course Completion Certificate</h1>
          <div className="w-20"></div>
        </div>

        {/* Certificate Display */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8">
          {/* Certificate Header */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
              <h2 className="text-2xl font-bold text-white">Verified Certificate of Completion</h2>
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <p className="text-blue-100 text-center">This certificate verifies successful course completion</p>
          </div>

          {/* Certificate Content */}
          <div
            ref={certificateRef}
            className="bg-gradient-to-br from-amber-50 via-white to-amber-50 p-12"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M50 10 L61 40 L92 40 L67 57 L78 87 L50 70 L22 87 L33 57 L8 40 L39 40 Z" fill="%23D97706" opacity="0.03" /%3E%3C/svg%3E")',
              backgroundRepeat: 'repeat',
            }}
          >
            {/* Corner decorations */}
            <div className="absolute top-8 left-8 w-16 h-16 border-t-4 border-l-4 border-amber-700 rounded-lg opacity-60"></div>
            <div className="absolute bottom-8 right-8 w-16 h-16 border-b-4 border-r-4 border-amber-700 rounded-lg opacity-60"></div>

            <div className="relative z-10 text-center">
              {/* Top Badge */}
              <div className="mb-8">
                <div className="flex justify-center gap-2 mb-4">
                  <span className="text-2xl">🏅</span>
                  <span className="text-2xl">📜</span>
                  <span className="text-2xl">🏅</span>
                </div>
                <h1 className="text-4xl font-bold text-amber-900 tracking-wider">CERTIFICATE</h1>
                <p className="text-amber-700 text-lg mt-1">of Completion</p>
              </div>

              <div className="border-t-2 border-b-2 border-amber-700 py-8 mb-8">
                {/* Recipient name */}
                <p className="text-center text-amber-700 text-sm font-semibold mb-2">This is to certify that</p>
                <h2 className="text-center text-4xl font-bold text-amber-900 mb-4 tracking-wide uppercase">
                  {certificate.userName}
                </h2>

                {/* Course details */}
                <p className="text-center text-amber-700 text-sm font-semibold mb-2">has successfully completed</p>
                <h3 className="text-center text-2xl font-bold text-amber-900 mb-6 italic">
                  {certificate.courseName}
                </h3>

                {/* Info section */}
                <div className="grid grid-cols-3 gap-6 text-center text-sm">
                  <div>
                    <p className="text-amber-700 font-semibold">Course Code</p>
                    <p className="text-amber-900 font-mono">{certificate.courseCode}</p>
                  </div>
                  <div>
                    <p className="text-amber-700 font-semibold">Completion Date</p>
                    <p className="text-amber-900">{formattedDate}</p>
                  </div>
                  <div>
                    <p className="text-amber-700 font-semibold">Certificate ID</p>
                    <p className="text-amber-900 font-mono text-xs">{certificateId}</p>
                  </div>
                </div>
              </div>

              {/* Footer signature area */}
              <div className="mt-8">
                <p className="text-center text-amber-700 text-sm mb-6">
                  With recognition for outstanding dedication and excellent achievement
                </p>

                <div className="grid grid-cols-3 gap-8 text-center">
                  <div className="pt-4 border-t-2 border-amber-700">
                    <p className="text-amber-900 font-semibold text-sm">Instructor</p>
                    <p className="text-amber-700 italic text-xs mt-1">{certificate.instructor}</p>
                  </div>
                  <div className="pt-4 border-t-2 border-amber-700">
                    <p className="text-amber-900 font-semibold text-sm">LearnSphere</p>
                    <p className="text-amber-700 italic text-xs mt-1">Since 2026</p>
                  </div>
                  <div className="pt-4 border-t-2 border-amber-700">
                    <p className="text-amber-900 font-semibold text-sm">Official Seal</p>
                    <p className="text-4xl mt-2">🎓</p>
                  </div>
                </div>
              </div>

              {/* Certificate verification */}
              <p className="text-center text-amber-600 text-xs mt-8 font-mono">
                Verified Certificate ID: {certificateId}
              </p>
            </div>
          </div>

          {/* Certificate Footer Info */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600 font-medium">Issued By</p>
                <p className="text-gray-900">LearnSphere Academy</p>
              </div>
              <div>
                <p className="text-gray-600 font-medium">Issue Date</p>
                <p className="text-gray-900">{formattedDate}</p>
              </div>
              <div>
                <p className="text-gray-600 font-medium">Status</p>
                <p className="text-green-600 font-semibold">✓ Verified</p>
              </div>
              <div>
                <p className="text-gray-600 font-medium">Validity</p>
                <p className="text-gray-900">Lifetime</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <button
            onClick={handleDownloadPDF}
            className={`flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg ${
              downloaded
                ? 'bg-green-500 text-white'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:shadow-xl'
            }`}
          >
            <Download className="w-5 h-5" />
            {downloaded ? 'Downloaded!' : 'Download PDF'}
          </button>

          <button
            onClick={() => {
              const shareText = `I just completed "${certificate.courseName}" and earned a certificate on LearnSphere! 🎓`;
              const shareUrl = window.location.href;
              if (navigator.share) {
                navigator.share({
                  title: 'LearnSphere Certificate',
                  text: shareText,
                  url: shareUrl,
                });
              } else {
                // Fallback: copy to clipboard
                navigator.clipboard.writeText(shareUrl);
                alert('Link copied to clipboard!');
              }
              recordCertificateShare(certificateId, 'social_share');
            }}
            className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Share2 className="w-5 h-5" />
            Share Certificate
          </button>
        </div>

        {/* Information Box */}
        <div className="mt-8 max-w-2xl mx-auto bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <p className="text-blue-900 text-sm">
            <span className="font-semibold">📌 This is a verified certificate</span> issued by LearnSphere Academy. You can share this certificate on social media, add it to your resume, or save it for your records. To verify this certificate's authenticity, visit the LearnSphere website and use the certificate ID above.
          </p>
        </div>
      </div>
    </div>
  );
}
