import React, { useRef } from 'react';
import { Download, Share2, Facebook, Twitter, Linkedin, Mail, Copy, CheckCircle } from 'lucide-react';
import html2pdf from 'html2pdf.js';

/**
 * Certificate Component
 * Displays course completion certificate with download and social sharing
 * - Professional certificate design
 * - PDF download functionality
 * - Social media sharing (Facebook, Twitter, LinkedIn, Email)
 * - Copy certificate link
 * - Shareable certificate data
 */
export default function Certificate({
  userName,
  courseName,
  courseCode,
  completionDate,
  certificateId,
  instructor = 'LearnSphere Academy',
  onClose = () => {},
}) {
  const certificateRef = useRef(null);
  const [copied, setCopied] = React.useState(false);
  const [shareOpen, setShareOpen] = React.useState(false);

  // Format date
  const formattedDate = new Date(completionDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Certificate URL for sharing
  const certificateUrl = `${window.location.origin}/certificate/${certificateId}`;
  const shareText = `I just completed "${courseName}" on LearnSphere! 🎓`;

  // Download certificate as PDF
  const handleDownloadPDF = () => {
    const element = certificateRef.current;
    const options = {
      margin: 0,
      filename: `${userName}-${courseName.replace(/\s+/g, '-')}-Certificate.pdf`,
      image: { type: 'png', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'landscape', unit: 'mm', format: 'a4' },
    };

    html2pdf().set(options).from(element).save();
  };

  // Copy certificate link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(certificateUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Social media share handlers
  const shareHandlers = {
    facebook: () => {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(certificateUrl)}`,
        'facebook-share-dialog',
        'width=626,height=436'
      );
    },
    twitter: () => {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(certificateUrl)}`,
        'twitter-share',
        'width=626,height=436'
      );
    },
    linkedin: () => {
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificateUrl)}`,
        'linkedin-share',
        'width=626,height=436'
      );
    },
    email: () => {
      const mailtoLink = `mailto:?subject=${encodeURIComponent(`I completed "${courseName}"`)}&body=${encodeURIComponent(`I just completed a course on LearnSphere! 🎓\n\nCourse: ${courseName}\nDate: ${formattedDate}\n\nView my certificate: ${certificateUrl}`)}`;
      window.location.href = mailtoLink;
    },
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-6 flex justify-between items-center rounded-t-2xl">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">🎉 Congratulations!</h2>
            <p className="text-blue-100">Your certificate of completion is ready</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Certificate Preview */}
        <div className="p-8">
          {/* Certificate Display */}
          <div
            ref={certificateRef}
            className="bg-gradient-to-br from-amber-50 via-white to-amber-50 rounded-2xl border-8 border-amber-700 shadow-xl p-12 mb-8"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M50 10 L61 40 L92 40 L67 57 L78 87 L50 70 L22 87 L33 57 L8 40 L39 40 Z" fill="%23D97706" opacity="0.03" /%3E%3C/svg%3E")',
              backgroundRepeat: 'repeat',
            }}
          >
            {/* Corner decorations */}
            <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-amber-700 rounded-lg opacity-60"></div>
            <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-amber-700 rounded-lg opacity-60"></div>

            <div className="relative z-10">
              {/* Top Badge */}
              <div className="text-center mb-8">
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
                  {userName}
                </h2>

                {/* Course details */}
                <p className="text-center text-amber-700 text-sm font-semibold mb-2">has successfully completed</p>
                <h3 className="text-center text-2xl font-bold text-amber-900 mb-6 italic">
                  {courseName}
                </h3>

                {/* Info section */}
                <div className="grid grid-cols-3 gap-6 text-center text-sm">
                  <div>
                    <p className="text-amber-700 font-semibold">Course Code</p>
                    <p className="text-amber-900 font-mono">{courseCode}</p>
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
                    <p className="text-amber-700 italic text-xs mt-1">{instructor}</p>
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
                Verify at: {certificateUrl.substring(0, 50)}...
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {/* Primary Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Download PDF */}
              <button
                onClick={handleDownloadPDF}
                className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Download className="w-5 h-5" />
                Download as PDF
              </button>

              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className={`flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copy Link
                  </>
                )}
              </button>
            </div>

            {/* Share Section */}
            <div>
              <button
                onClick={() => setShareOpen(!shareOpen)}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Share2 className="w-5 h-5" />
                Share on Social Media
              </button>

              {/* Social Share Options */}
              {shareOpen && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in">
                  {/* Facebook */}
                  <button
                    onClick={shareHandlers.facebook}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Facebook className="w-5 h-5" />
                    <span className="text-sm font-medium hidden sm:inline">Facebook</span>
                  </button>

                  {/* Twitter */}
                  <button
                    onClick={shareHandlers.twitter}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
                  >
                    <Twitter className="w-5 h-5" />
                    <span className="text-sm font-medium hidden sm:inline">Twitter</span>
                  </button>

                  {/* LinkedIn */}
                  <button
                    onClick={shareHandlers.linkedin}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                    <span className="text-sm font-medium hidden sm:inline">LinkedIn</span>
                  </button>

                  {/* Email */}
                  <button
                    onClick={shareHandlers.email}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                    <span className="text-sm font-medium hidden sm:inline">Email</span>
                  </button>
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 rounded-xl font-semibold transition-all duration-200"
            >
              Close
            </button>
          </div>

          {/* Share message */}
          <p className="text-center text-gray-600 text-sm mt-6">
            Share your achievement with your network! Your certificate can be verified at the provided link.
          </p>
        </div>
      </div>
    </div>
  );
}
