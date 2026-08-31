export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 prose prose-slate dark:prose-invert">
      <h1>Privacy Policy</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      
      <h2>1. Introduction</h2>
      <p>Welcome to Rolevia. We respect your privacy and are committed to protecting your personal data.</p>
      
      <h2>2. Data We Collect</h2>
      <p>We may collect and process the following data about you:</p>
      <ul>
        <li>Identity Data (name, username)</li>
        <li>Contact Data (email address)</li>
        <li>Career Data (resumes, job targets, skills, assessments)</li>
        <li>Usage Data (how you interact with our platform)</li>
      </ul>

      <h2>3. How We Use Your Data</h2>
      <p>Your data is used to provide you with personalized career intelligence, resume feedback, and interview preparation. We do not sell your personal data to third parties.</p>

      <h2>4. Data Security</h2>
      <p>We implement appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way.</p>

      <h2>5. Your Legal Rights</h2>
      <p>Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, or restriction.</p>

      <h2>6. Contact Us</h2>
      <p>For any questions regarding this privacy policy, please contact support.</p>
    </div>
  );
}
