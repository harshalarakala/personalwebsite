import React from 'react';

const Contact: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Contact</h2>
      <p>
        I'd love to hear from you! Whether you have a question, want to collaborate on a project, or just want to say hi, feel free to reach out.
      </p>
      <ul className="list-disc pl-5">
        <li>Email: your.email@example.com</li>
        <li>LinkedIn: <a href="https://www.linkedin.com/in/harshalarakala" className="text-blue-500">Your LinkedIn Profile</a></li>
        <li>GitHub: <a href="https://github.com/harshalarakala" className="text-blue-500">Your GitHub Profile</a></li>
      </ul>
    </div>
  );
};

export default Contact;
