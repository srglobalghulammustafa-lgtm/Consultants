import React from 'react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="py-16 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <h1 className="text-3xl font-bold text-navy-950 font-serif">Privacy Policy</h1>
        <p className="text-xs text-slate-400">Effective Date: November 2026</p>

        <section className="space-y-3 text-sm text-slate-600 leading-relaxed">
          <h2 className="text-lg font-bold text-slate-900">1. Information Collection</h2>
          <p>
            SR Global Consultants collects student contact information (name, email address, phone number), educational transcripts, passport identification, and test scores solely for educational counseling, institutional admissions, and lawful visa applications.
          </p>
        </section>

        <section className="space-y-3 text-sm text-slate-600 leading-relaxed">
          <h2 className="text-lg font-bold text-slate-900">2. Usage of Data</h2>
          <p>
            Your information is used strictly to process university applications, verify Genuine Student (GS) compliance, schedule counseling appointments, and communicate visa outcomes. We never sell or distribute your data to unauthorized marketing third parties.
          </p>
        </section>

        <section className="space-y-3 text-sm text-slate-600 leading-relaxed">
          <h2 className="text-lg font-bold text-slate-900">3. Contact Office</h2>
          <p>
            For questions regarding data privacy or record deletion, contact:
            <br />
            <strong>SR Global Consultants</strong>, 1st Floor, 239A Civic Center, Gujranwala, Pakistan.
            <br />
            Email: contact@srglobalconsultants.com
          </p>
        </section>
      </div>
    </div>
  );
};

export const Terms: React.FC = () => {
  return (
    <div className="py-16 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <h1 className="text-3xl font-bold text-navy-950 font-serif">Terms of Service</h1>
        <p className="text-xs text-slate-400">Effective Date: November 2026</p>

        <section className="space-y-3 text-sm text-slate-600 leading-relaxed">
          <h2 className="text-lg font-bold text-slate-900">1. Educational Counseling Scope</h2>
          <p>
            SR Global Consultants provides educational counseling and visa advisory services. While we provide diligent guidance and have achieved a 98.4% grant record, all final visa decisions are subject to the sovereign discretion of respective immigration authorities (e.g. Australian Department of Home Affairs, UK Visas and Immigration, IRCC Canada).
          </p>
        </section>

        <section className="space-y-3 text-sm text-slate-600 leading-relaxed">
          <h2 className="text-lg font-bold text-slate-900">2. Accuracy of Client Documentation</h2>
          <p>
            Applicants agree to provide truthful and authentic academic records, identity papers, and bank statements. Submission of fraudulent records is strictly prohibited and grounds for immediate termination of representation.
          </p>
        </section>
      </div>
    </div>
  );
};
