export default function PendingPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center">
      <h1 className="text-3xl font-bold mb-4"> Account Under Review</h1>

      <p className="text-gray-600 max-w-md">
        Thank you for submitting your vendor information. Our team is currently
        reviewing your details.
        <br />
        <br />
        You will receive an email notification once your account is approved.
      </p>
    </div>
  );
}
