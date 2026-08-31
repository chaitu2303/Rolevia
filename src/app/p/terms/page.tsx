export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 prose prose-slate dark:prose-invert">
      <h1>Terms of Service</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>

      <h2>1. Acceptance of Terms</h2>
      <p>By accessing and using Rolevia, you accept and agree to be bound by the terms and provision of this agreement.</p>

      <h2>2. Description of Service</h2>
      <p>Rolevia provides career intelligence, resume analysis, and interview preparation tools. The service is provided "as is".</p>

      <h2>3. Disclaimer regarding Career Outcomes</h2>
      <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-md border border-yellow-200 dark:border-yellow-700/50">
        <p className="font-semibold m-0">No Guarantees</p>
        <p className="m-0 mt-2 text-sm">
          Rolevia provides estimates and recommendations based on algorithms and ATS heuristics. We do NOT guarantee any specific job outcomes, interviews, or employment. An ATS score is an estimate, not an absolute truth.
        </p>
      </div>

      <h2>4. User Accounts</h2>
      <p>You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account and password.</p>

      <h2>5. Prohibited Conduct</h2>
      <p>You agree not to use the service for any unlawful purpose, to solicit others to perform unlawful acts, or to violate any regulations, rules, or laws.</p>
    </div>
  );
}
