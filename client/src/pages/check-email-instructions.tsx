import React from "react";

export default function CheckEmailInstructions() {
  return (
    <div className="max-w-lg mx-auto mt-16 p-8 bg-white rounded shadow text-center">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Check Your Email!</h2>
      <p className="mb-4 text-gray-700">
        We just sent you an email. If you don&apos;t see it in your inbox, please check your spam or junk folder.
      </p>
      <div className="mb-6 text-left">
        <h3 className="font-semibold text-lg mb-2 text-center">How to Whitelist <span className="text-blue-700">support@rentapog.com</span>:</h3>
        <div className="mb-4">
          <b>Gmail (Desktop & Mobile):</b>
          <ol className="list-decimal list-inside ml-4 text-gray-700">
            <li>Open your Gmail inbox and find the email from <b>support@rentapog.com</b>.</li>
            <li>If it&apos;s in Spam, open it and click the <b>&quot;Not spam&quot;</b> button at the top.</li>
            <li>Click the three dots (More) in the top right of the email.</li>
            <li>Select <b>&quot;Add <span className='text-blue-700'>support@rentapog.com</span> to Contacts list&quot;</b>.</li>
            <li>Alternatively, click the sender name, then &quot;Add to Contacts&quot;.</li>
          </ol>
        </div>
        <div className="mb-4">
          <b>Outlook/Hotmail/Live:</b>
          <ol className="list-decimal list-inside ml-4 text-gray-700">
            <li>Open your Outlook inbox and find the email from <b>support@rentapog.com</b>.</li>
            <li>If it&apos;s in Junk, right-click the email and select <b>&quot;Junk&quot; &gt; &quot;Not Junk&quot;</b>.</li>
            <li>Click &quot;Never Block Sender&quot; or &quot;Add to Safe Senders&quot; if prompted.</li>
            <li>To add manually: Go to &quot;Settings&quot; &gt; &quot;View all Outlook settings&quot; &gt; &quot;Mail&quot; &gt; &quot;Junk email&quot; and add <b>support@rentapog.com</b> to &quot;Safe senders and domains&quot;.</li>
          </ol>
        </div>
        <div className="mb-4">
          <b>Yahoo Mail:</b>
          <ol className="list-decimal list-inside ml-4 text-gray-700">
            <li>Check your Spam folder for the email from <b>support@rentapog.com</b> and mark it as &quot;Not Spam&quot;.</li>
            <li>Click the sender name and select &quot;Add to contacts&quot;.</li>
          </ol>
        </div>
        <div className="mb-4">
          <b>Apple Mail (iPhone, iPad, Mac):</b>
          <ol className="list-decimal list-inside ml-4 text-gray-700">
            <li>Open the email from <b>support@rentapog.com</b>.</li>
            <li>Tap the sender&apos;s name, then tap &quot;Add to VIP&quot; or &quot;Add to Contacts&quot;.</li>
          </ol>
        </div>
        <div className="mb-4">
          <b>General (Any Email Provider):</b>
          <ol className="list-decimal list-inside ml-4 text-gray-700">
            <li>Add <b>support@rentapog.com</b> to your address book or contacts list.</li>
            <li>Always check your spam/junk folder and mark our emails as &quot;Not Spam&quot; or &quot;Not Junk&quot;.</li>
          </ol>
        </div>
      </div>
      <p className="text-gray-600 text-sm text-center">
        Whitelisting our email ensures you never miss important updates from us!
      </p>
    </div>
  );
}
