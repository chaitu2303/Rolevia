export default function RefundPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 prose prose-slate dark:prose-invert">
      <h1>Refund Policy</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>

      <h2>1. Overview</h2>
      <p>Our aim is to provide high-quality career intelligence tools. If you are not satisfied with your purchase, we are here to help.</p>

      <h2>2. Subscription Cancellations</h2>
      <p>You can cancel your subscription at any time. Your cancellation will take effect at the end of the current paid term. You will retain access to premium features until then.</p>

      <h2>3. Refund Requests</h2>
      <p>Refunds are considered on a case-by-case basis. Generally, we offer refunds within 7 days of the initial purchase if you have not heavily utilized the service (e.g., generated extensive resume reports or mock interviews).</p>

      <h2>4. Exceptions</h2>
      <p>We do not grant refunds based on job outcomes. Our tools provide guidance and estimates, but do not guarantee employment, interviews, or passing ATS systems in the real world.</p>

      <h2>5. How to Request a Refund</h2>
      <p>To request a refund, please contact support with your account email and the reason for your request.</p>
    </div>
  );
}
